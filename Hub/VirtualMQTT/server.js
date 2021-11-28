const aedes = require('aedes')()
const mqtt = require('mqtt')

const { createServer } = require('aedes-server-factory')
const sizeof = require('sizeof'); 



const urljoin = require('url-join');
const port = 1883


//Configure MQTT over WS
const httpServer = require('http').createServer()
const ws = require('websocket-stream')
const http_port = 8888
ws.createServer({ server: httpServer }, aedes.handle)


//Configure MQTT
const server = createServer(aedes)


const fetch = require('node-fetch');

const OPA_HOST = process.env.OPA_HOST || 'http:/opa:8181'
const OPA_URL = urljoin(OPA_HOST, 'v1/data/app/iot');

const AUTHENTICATION_HOST = process.env.AUTHENTICATION_HOST || 'http://192.168.99.101:3000'
const AUTHENTICATION_URL = urljoin(AUTHENTICATION_HOST, '/login');

const DATA_AMOUNT_TOPIC = "/hub/data_amount/mqtt"
const data_amount = {

}

var mqtt_client = mqtt.connect('mqtt://localhost',{
  username: "mqtt_system",
  password:"123456"
})

async function authorize_subscribe(client,topic,ts) {

  

  if(ts - client.authorize_subscribe[topic] > 10000){

    topic=topic.replace("#","99999999999999999999999999999999999")
    opa_body = {
        "input":{
          "action": "subscribe",
          "tenant_id": client.username,
          "topic": topic
          
      }    
    }



    OPA_TENANT_URL = OPA_URL.replace("opa",`opa_${client.username}`)



    fetch(OPA_TENANT_URL, { method: 'POST', body: JSON.stringify(opa_body) })
      .then(res => res.json()) // expecting a json response
      .then(json => {      
        if (json['result']['allow']){
          client.authorize_subscribe[topic] = ts       
          
        }else{
        
          client.authorize_subscribe[topic] = 0

        }
      });



  }

  


}

aedes.authenticate = function (client, username, password, callback) {

  if (username ==undefined || password == undefined){
    callback(null,true)
    return
  }

  client.username = username
  client.password = password.toString()
  
  
  login_body={
    'username': client.username,
    "password": client.password
  }


  fetch(AUTHENTICATION_URL, { method: 'POST', body: JSON.stringify(login_body) })
    .then(res => res.json()) // expecting a json response
    .then(json => {
      
      if (json['status']){
        console.log("User %s is authenticated",username)

        data_amount[username] = 0 
        callback(null,true)
      }else{

        console.log("User %s is NOT authenticated",username)

        var error = new Error('Auth error')
        error.returnCode = 4
        callback(error, null)
      }
    });

}


aedes.authorizeSubscribe = function (client, sub, callback) {

    
  topic=sub.topic.replace("#","99999999999999999999999999999999999")

  opa_body = {
      "input":{
        "action": "subscribe",
        "tenant_id": client.username,
        "topic": topic
        
    }    
  }

  if (   client.authorize_subscribe == undefined){
    client.authorize_subscribe = {

    }
  }

  

  

  OPA_TENANT_URL = OPA_URL.replace("opa",`opa_${client.username}`)

  console.log(OPA_TENANT_URL)


  const ts = Date.now();
  fetch(OPA_TENANT_URL, { method: 'POST', body: JSON.stringify(opa_body) })
    .then(res => res.json()) // expecting a json response
    .then(json => {      
      if (json['result']['allow']){
        client.authorize_subscribe[sub.topic] = ts
        callback(null, sub)
        
      }else{
        console.log("Tenant %s is not authorized to subscribe to %s",client.username,sub.topic)
        callback(new Error('Unauthorized'))

        client.authorize_subscribe[sub.topic] = 0

      }
    });
  }

aedes.authorizePublish = function (client, packet, callback) {

  if (   client.authorize_publish == undefined){
    client.authorize_publish = {

    }
  }

  

  if (client.authorize_publish[packet.topic] == undefined){
    client.authorize_publish[packet.topic] = 0
  }

  const ts = Date.now();

  if(ts - client.authorize_publish[packet.topic] < 10000){
    callback(null)

  }else{

    opa_body = {
      "input":{
        "action": "publish",
        "tenant_id": client.username,
        "topic": packet.topic
          
      }
    }

    OPA_TENANT_URL = OPA_URL.replace("opa",`opa_${client.username}`)   


    fetch(OPA_TENANT_URL, { method: 'POST', body: JSON.stringify(opa_body) })
      .then(res => res.json()) // expecting a json response
      .then(json => {
        
        if (json['result']['allow']){

          data_amount[client.username] = data_amount[client.username] + sizeof.sizeof(packet)

          client.authorize_publish[packet.topic] = ts
          callback(null)
          
        }else{
          console.log("Tenant %s is not authorized to publish to %s",client.username,packet.topic)
          callback(new Error('Unauthorized'))
        }
      });   

  }



  
}

aedes.authorizeForward = function (client, packet) {


  const ts = Date.now();

  authorize_subscribe(client,packet.topic,ts);
  

  if(ts - client.authorize_subscribe[packet.topic] <10000){
    
    data_amount[client.username] = data_amount[client.username] + sizeof.sizeof(packet)
    return packet

  }else{
    
    return
  }
  
}


server.listen(port, function () {
  console.log('server started and listening on port ', port)
})

httpServer.listen(http_port, function () {
  console.log('websocket server listening on port ', http_port)
})



setInterval(() => {

  for (const [tenant_id, value] of Object.entries(data_amount)) {
    

    topic = `${DATA_AMOUNT_TOPIC}/${tenant_id}`
    
    console.log(topic)
    mqtt_client.publish(topic, `${data_amount[tenant_id]}`)
    data_amount[tenant_id] = 0

    

  }
  
}, 6000);