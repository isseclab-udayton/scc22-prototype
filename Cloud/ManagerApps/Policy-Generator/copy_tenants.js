const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const MONGO_URL = process.env.MONGO_URL ||  "mongodb://root:root@192.168.99.104"
const MONGO_DBNAME = process.env.MONGO_DBNAME || "datahub"



MongoClient.connect(MONGO_URL,  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(MONGO_DBNAME);

    


    dbo.collection("policies").findOne({tenant_name:"tenant-3"},function(err, result) {
        if (err) throw err;        
        
        const tenant_idx = Math.floor(+new Date() )

        delete result['_id']

        console.log(result)
            
        result['tenant_name'] = `tenant-${tenant_idx}`


        dbo.collection("policies").insertOne(result, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
            
            });
        

        


        
        
    
      });

});