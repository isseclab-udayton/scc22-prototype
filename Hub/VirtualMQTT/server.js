const aedes = require('aedes')()
const mqtt = require('mqtt')

const { createServer } = require('aedes-server-factory')
const sizeof = require('sizeof'); 

const PERMISSION_CACHE_TIME = 20000 // Cache in 20 seconds. 
const PERMISSION_CACHE_REFRESH_TIME=10000 // Trigger a cache refresh in 10 seconds





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


let client_lists = []

let ts = Date.now();

//DONE

     





//DONE
aedes.authenticate = function (client, username, password, callback) {

  if (username ==undefined || password == undefined){
    callback(null,true)
    return
  }

  client.username = username
  client.password = password.toString()
  
  
  const login_body={
    'username': client.username,
    "password": client.password
  }


  fetch(AUTHENTICATION_URL, { method: 'POST', body: JSON.stringify(login_body) })
    .then(res => res.json()) // expecting a json response
    .then(json => {
      
      if (json['status']){
        console.log("User %s is authenticated",username)      

        data_amount[username] = 0 
        client_lists.push(client);

        //Append to the client_lists        
        callback(null,true)

        
        


      }else{

        console.log("User %s is NOT authenticated",username)

        var error = new Error('Auth error')
        error.returnCode = 4
        callback(error, null)
      }
    });

}

//DONE
aedes.authorizeSubscribe = function (client, sub, callback) {

  //High level logic:
  // if a topic in this list has not been initialized, the client has not subscribed for it. 
  
  const topic=sub.topic.replace("#","99999999999999999999999999999999999")

  //Initialize the authorize_subscribe dictionary
  if (   client.authorize_subscribe == undefined){
    client.authorize_subscribe = {

    }
  }

  //Assumption: if a topic in this list has not been initialized, the client has not subscribed for it. 
  //Request for permission
   

  const OPA_TENANT_URL = OPA_URL.replace("opa",`opa_${client.username}`)
  const opa_body = {
      "input":{
        "action": "subscribe",
        "tenant_id": client.username,
        "topic": topic
        
    }    
  }
  
  fetch(OPA_TENANT_URL, { method: 'POST', body: JSON.stringify(opa_body) })
    .then(res => res.json()) // expecting a json response
    .then(json => {
      if (json['result']['allow']){
        
        client.authorize_subscribe[sub.topic] =ts
        callback(null, sub)
        
      }else{
        console.log("Tenant %s is not authorized to subscribe to %s",client.username,sub.topic)
        callback(new Error('Unauthorized'))
      }
    });
  }

//DONE
aedes.authorizePublish = function (client, packet, callback) {

  


  //Initialize the dictionary
  if (client.authorize_publish == undefined){
    client.authorize_publish = {

    }

    
  }

  
  const opa_body = {
    "input":{
      "action": "publish",
      "tenant_id": client.username,
      "topic": packet.topic
        
    }
  }
  const OPA_TENANT_URL = OPA_URL.replace("opa",`opa_${client.username}`)   

  console.log("Cheking permission: ", packet.topic)
  
  if(client.authorize_publish[packet.topic] != undefined && ts - client.authorize_publish[packet.topic] < PERMISSION_CACHE_TIME ){
    console.log("Cheking permission: ", packet.topic, ">> Cached")
    callback(null)
  }else{

    console.log("Cheking permission: ", packet.topic, ">> OPA")

    fetch(OPA_TENANT_URL, { method: 'POST', body: JSON.stringify(opa_body) })
      .then(res => res.json()) // expecting a json response
      .then(json => {
        
        if (json['result']['allow']){

          data_amount[client.username] = data_amount[client.username] + sizeof.sizeof(packet)

          client.authorize_publish[packet.topic] = ts


          console.log("Cheking permission: ", packet.topic, ">> OPA DONE")

          callback(null)
          
        }else{
          client.authorize_publish[packet.topic] = 0

          callback(new Error('Unauthorized'))
        }
      });

      
    
  }

}

aedes.authorizeForward = function (client, packet) {

  //Assumption: A client must subscribe to the topic to be able to go into this function

  topic=topic.replace("#","99999999999999999999999999999999999")
  opa_body = {
        "input":{
          "action": "subscribe",
          "tenant_id": client.username,
          "topic": topic
          
      }    
  }
  OPA_TENANT_URL = OPA_URL.replace("opa",`opa_${client.username}`)

  

  //Assumption: There is a timer to set the permission
  //If the permission expired, force to await requesting permission
  //If the permission is not expired, refresh permission in background, and check for the permission
 

  if(client.authorize_subscribe[packet.topic] != undefined && ts - client.authorize_subscribe[packet.topic] < PERMISSION_CACHE_TIME ){    
    data_amount[client.username] = data_amount[client.username] + sizeof.sizeof(packet)
    return packet

  }else{
    
    return
  }

  

  //Check if the permission is granted, call the callback function
  
  
}


server.listen(port, function () {
  console.log('server started and listening on port ', port)
})

httpServer.listen(http_port, function () {
  console.log('websocket server listening on port ', http_port)
})



setInterval(() => {
  
  
  
  console.log("Refreshing permission for "+ client_lists.length)
  for(const client in client_lists){
    if(client.username == undefined){
      continue
    }

    const OPA_TENANT_URL = OPA_URL.replace("opa",`opa_${client.username}`)

    console.log(OPA_TENANT_URL)
    

    if(client.authorize_publish != undefined){
      const client_published_topics = Object.keys(client.authorize_publish);
      //Refresh Publish
      for(const client_published_topic in client_published_topics){
        const opa_body = {
          "input":{
            "action": "publish",
            "tenant_id": client.username,
            "topic": client_published_topic
              
          }
        }

        fetch(OPA_TENANT_URL, { method: 'POST', body: JSON.stringify(opa_body) })
        .then(res => res.json()) // expecting a json response
        .then(json => {
          
          if (json['result']['allow']){
            data_amount[client.username] = data_amount[client.username] + sizeof.sizeof(packet)

            client.authorize_publish[packet.topic] = ts
            
          }else{
            client.authorize_publish[packet.topic] = 0
          }
        });    
      }
    }


    //Refresh Subscribe
    if(client.authorize_subscribe!=undefined){
      const client_subscribed_topics = Object.keys(client.authorize_subscribe);
      for(const client_subscribied_topic in client_subscribed_topics){
        const opa_body = {
          "input":{
            "action": "subscribe",
            "tenant_id": client.username,
            "topic": client_subscribied_topic
              
          }
        }

        fetch(OPA_TENANT_URL, { method: 'POST', body: JSON.stringify(opa_body) })
        .then(res => res.json()) // expecting a json response
        .then(json => {

          console.log(json)
          
          if (json['result']['allow']){
            data_amount[client.username] = data_amount[client.username] + sizeof.sizeof(packet)
            client.authorize_subscribe[packet.topic] = ts
            
          }else{
            client.authorize_subscribe[packet.topic] = 0
          }
        });    
      }
    }

}
},PERMISSION_CACHE_REFRESH_TIME);



setInterval(() => {

  for (const [tenant_id, value] of Object.entries(data_amount)) {
    

    topic = `${DATA_AMOUNT_TOPIC}/${tenant_id}`
    
    
    mqtt_client.publish(topic, `${data_amount[tenant_id]}`)
    data_amount[tenant_id] = 0

    

  }
  
}, 6000);



//Refresh the share ts 
setInterval(() => {

  ts = Date.now();
  
}, 500);


