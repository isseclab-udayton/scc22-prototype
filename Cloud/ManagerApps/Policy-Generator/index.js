const { Kafka } = require('kafkajs')
const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;


const {render_tenant_policy} = require('./policy_pug.js')


const BOOTSTRAP_KAFKA_HOST = process.env.BOOTSTRAP_KAFKA_HOST || "192.168.99.104:9092"
const MONGO_URL = process.env.MONGO_URL ||  "mongodb://root:password123@192.168.99.104"
const MONGO_DBNAME = process.env.MONGO_DBNAME || "datahub"

const POLICY_TOPIC = ".tenant_policy"

const kafka = new Kafka({
    clientId: 'policy-generator',
    brokers: [BOOTSTRAP_KAFKA_HOST]
})




const producer = kafka.producer()
producer.connect()
const admin = kafka.admin()
admin.connect()

async function generate_policy(tenant_id, policies){

  
  

    console.log(`Updating policy for tenant ${tenant_id}`)
    
    const tenant_policy = {
      policies: render_tenant_policy(policies),
      tenant_id: tenant_id
    }

    
    let ts = Date.now();
    console.log(`[${tenant_id}], Policy Generate TS: ${ts}`);

    producer.send({
      topic: POLICY_TOPIC,
      waitForLeaders: true,
      messages: [
        { 
          value: JSON.stringify(tenant_policy )
        },
      ],
    })
}







MongoClient.connect(MONGO_URL,  {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function(err, db) {
  if (err) throw err;
  var dbo = db.db(MONGO_DBNAME);



  //Watch for changes
  changeStream = dbo.collection("policies").watch();

  changeStream.on("change",function(change){
    documentKey = change['documentKey']['_id'];
    

    dbo.collection("policies").findOne({"_id": new ObjectId(documentKey)}, function(err, doc) {
      if(doc!=undefined){

        const ts = Date.now();
        console.log(`[${doc['tenant_name']}], Policy Change TS: ${ts}`);

        tenant_id = doc['tenant_name']
        policies = doc['policies']
        generate_policy(tenant_id,policies)
      }
    });
  });


  
  //Regenerate the policy at once
  dbo.collection("policies").find({}).toArray(function(err, result) {



    if (err) throw err;

    result.forEach(doc => {
      const ts = Date.now();
      console.log(`[${doc['tenant_name']}], Policy Generate TS: ${ts}`);


      tenant_id = doc['tenant_name']
      policies = doc['policies']     

      generate_policy(tenant_id,policies)
    
    });

  });

});

