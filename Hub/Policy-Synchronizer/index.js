const { Kafka } = require('kafkajs')

const BOOTSTRAP_KAFKA_HOST = process.env.BOOTSTRAP_KAFKA_HOST || "192.168.99.104:9092"
const DEBUG = process.env.DEBUG || true
const http = require('http')


const TENANT_CONTEXT_DATA_TOPIC = ".tenant_context_data"
const TENANT_POLICY_TOPIC = ".tenant_policy"

const kafka = new Kafka({
    clientId: 'policy-synchronizer',
    brokers: [BOOTSTRAP_KAFKA_HOST]
})

const consumer = kafka.consumer({ groupId: `policy-synchronizer-group` })
consumer.connect()




consumer.subscribe({ topic: TENANT_CONTEXT_DATA_TOPIC, fromBeginning: false })
consumer.subscribe({ topic: TENANT_POLICY_TOPIC, fromBeginning: true })


console.log(`Subscribing ${TENANT_CONTEXT_DATA_TOPIC}`)
console.log(`Subscribing ${TENANT_POLICY_TOPIC}`)

function update_policy(tenant_id,opa_policy){


  console.log("------------------------------------")
  console.log(tenant_id)  
  console.log("------------------------------------")
  
  const OPA_HOST = `opa_${tenant_id}`
  const options = {
    hostname: OPA_HOST,
    port: 8181,
    
    path: '/v1/policies/iot',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': opa_policy.length
    }
  }

  
  const req = http.request(options, res => {
    
  
    res.on('data', d => {
      process.stdout.write(d)
    })
  })
  
  req.on('error', error => {
    console.log(OPA_HOST)
    console.error(error)
    
  })
  
  req.write(opa_policy)
  req.end()

}

function update_context_data(tenant_id,opa_data){
    
    start_time = new Date().getTime() 

    const OPA_HOST = `opa_${tenant_id}`

    const options = {
      hostname: OPA_HOST,
      port: 8181,
      
      path: '/v1/data/context_data',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': opa_data.length
      }
    }

    
    const req = http.request(options, res => {

      res.on('data', d => {
        process.stdout.write(d)
      })
    })
    
    req.on('error', error => {
      console.error(error)
    })
    
    req.write(opa_data)
    req.end()

    end_time = new Date().getTime() 

    duration = end_time - start_time
    console.log(`[Profile]Update Context Data for ${tenant_id}, Duration: ${duration}`)

}



consumer.run({
    eachMessage: async ({ topic, partition, message }) => {


      
      if(DEBUG){
        console.log("----------------------------------------------------")
        console.log(topic)
      }


      // console.log(message.value.toString())

      message_parsed = JSON.parse(message.value.toString())    

      // console.log(message_parsed)
      
      if (topic.startsWith(TENANT_POLICY_TOPIC)){

        const ts = Date.now();
        console.log(`[${message_parsed['tenant_id']}], Policy Updated TS: ${ts}`);

        update_policy(message_parsed['tenant_id'],message_parsed['policies']);

      }else if(topic.startsWith(TENANT_CONTEXT_DATA_TOPIC)){        

        const ts = Date.now();
        console.log(`[${message_parsed['tenant_id']}], Context Data Updated TS: ${ts}`);
        
        update_context_data(message_parsed['tenant_id'],message_parsed['context_data']);

      }

      
      
  
    },
  })
