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



let permission_dict = {
  
}
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
        
        if (permission_dict[client.username] == undefined){

          permission_dict[client.username] = {
            'authorize_publish': {

            },         
            'authorize_subscribe': {
              
            }
            
          }
        }

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
        
        permission_dict[client.username]['authorize_subscribe'][sub.topic] =ts
        callback(null, sub)
        
      }else{
        console.log("Tenant %s is not authorized to subscribe to %s",client.username,sub.topic)
        callback(new Error('Unauthorized'))
      }
    });
  }

//DONE
aedes.authorizePublish = function (client, packet, callback) {
  
  const packet_topic = packet.topic
  const client_username = client.username
  const topic=packet_topic.replace("#","99999999999999999999999999999999999")

  
  const opa_body = {
    "input":{
      "action": "publish",
      "tenant_id": client_username,
      "topic": topic
        
    }
  }

  const OPA_TENANT_URL = OPA_URL.replace("opa",`opa_${client_username}`)

  console.log("Cheking permission: ",client_username, packet_topic)  

  

  if(permission_dict[client_username]['authorize_publish'][packet_topic] != undefined && ts - permission_dict[client_username]['authorize_publish'][packet_topic] < PERMISSION_CACHE_TIME ){
    console.log("Cheking permission: ", packet_topic, ">> Cached")
    callback(null)
  }else{

    
    

    fetch(OPA_TENANT_URL, { method: 'POST', body: JSON.stringify(opa_body) })
      .then(res => res.json()) // expecting a json response
      .then(json => {

        
        
        if (json['result']['allow']){

          data_amount[client_username] = data_amount[client_username] + sizeof.sizeof(packet)

          permission_dict[client_username]['authorize_publish'][packet_topic] = ts
          
          
          
          console.log("Cheking permission: ", packet_topic, ">> OPA DONE")

          callback(null)
          
        }else{
          permission_dict[client_username]['authorize_publish'][packet_topic] = 0

          callback(new Error('Unauthorized'))
        }
      });

      
    
  }

}

aedes.authorizeForward = function (client, packet) {

  //Assumption: A client must subscribe to the topic to be able to go into this function
  const packet_topic = packet.topic
  const client_username = client.username

  const topic=packet.topic.replace("#","99999999999999999999999999999999999")
  const opa_body = {
        "input":{
          "action": "subscribe",
          "tenant_id": client_username,
          "topic": topic
          
      }    
  }
  const OPA_TENANT_URL = OPA_URL.replace("opa",`opa_${client_username}`)

  

  //Assumption: There is a timer to set the permission
  //If the permission expired, force to await requesting permission
  //If the permission is not expired, refresh permission in background, and check for the permission
 

  if(permission_dict[client_username]['authorize_subscribe'][packet_topic] != undefined && ts - permission_dict[client_username]['authorize_subscribe'][packet_topic] < PERMISSION_CACHE_TIME ){    
    data_amount[client_username] = data_amount[client_username] + sizeof.sizeof(packet)
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
  


  const client_lists = Object.keys(permission_dict)
  
  
  console.log("Refreshing permission for "+ client_lists.length)
  for(const client_name in client_lists){
    if(permission_dict[client_name] == undefined){
      continue
    }

    const OPA_TENANT_URL = OPA_URL.replace("opa",`opa_${client_name}`)

    
    

    if(permission_dict[client_name]['authorize_publish'] != undefined){
      const client_published_topics = Object.keys(permission_dict[client_name]['authorize_publish']);
      //Refresh Publish
      for(const client_published_topic in client_published_topics){
        const opa_body = {
          "input":{
            "action": "publish",
            "tenant_id": client_name,
            "topic": client_published_topic
              
          }
        }

        fetch(OPA_TENANT_URL, { method: 'POST', body: JSON.stringify(opa_body) })
        .then(res => res.json()) // expecting a json response
        .then(json => {
          
          if (json['result']['allow']){
            data_amount[client_name] = data_amount[client_name] + sizeof.sizeof(packet)

            permission_dict[client_name]['authorize_publish'][packet.topic] = ts
            
          }else{
            permission_dict[client_name]['authorize_publish'][packet.topic] = 0
          }
        });    
      }
    }


    //Refresh Subscribe
    if(permission_dict[client_name]['authorize_subscribe']!=undefined){
      const client_subscribed_topics = Object.keys(permission_dict[client_name]['authorize_subscribe']);
      for(const client_subscribied_topic in client_subscribed_topics){
        const opa_body = {
          "input":{
            "action": "subscribe",
            "tenant_id": client_name,
            "topic": client_subscribied_topic
              
          }
        }

        fetch(OPA_TENANT_URL, { method: 'POST', body: JSON.stringify(opa_body) })
        .then(res => res.json()) // expecting a json response
        .then(json => {

          
          
          if (json['result']['allow']){
            data_amount[client_name] = data_amount[client_name] + sizeof.sizeof(packet)
            permission_dict[client_name]['authorize_subscribe'][packet.topic] = ts
            
          }else{
            permission_dict[client_name]['authorize_subscribe'][packet.topic] = 0
          }
        });    
      }
    }

}
},PERMISSION_CACHE_REFRESH_TIME);



setInterval(() => {

  for (const [tenant_id, value] of Object.entries(data_amount)) {
    

    const topic = `${DATA_AMOUNT_TOPIC}/${tenant_id}`
    
    
    mqtt_client.publish(topic, `${data_amount[tenant_id]}`)
    data_amount[tenant_id] = 0

    

  }
  
}, 6000);



//Refresh the share ts 
setInterval(() => {

  ts = Date.now();
  
}, 500);


