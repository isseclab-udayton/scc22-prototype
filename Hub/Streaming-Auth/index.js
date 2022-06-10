const express = require('express')
const parse = require('url-parse')
const path = require("path");
const urljoin = require('url-join');

const fetch = require('node-fetch');


const AUTHENTICATION_HOST = process.env.AUTHENTICATION_HOST || 'http://192.168.99.102:3000'
const AUTHENTICATION_URL = urljoin(AUTHENTICATION_HOST, '/login');


const OPA_HOST = process.env.OPA_HOST || 'http:/opa:8181'
const OPA_URL = urljoin(OPA_HOST, 'v1/data/app/iot');



const app = express()
const port = 80


function authenticate_and_authorize(username,password,action,resource_id, res){



  const regex = /\./ig;  
  const iot_resource_id = `/${resource_id.replace(regex, '/')}`
  const login_body={
    'username': username,
    "password": password
  }


  const opa_body = {
    "input":{
      "action": action,
      "tenant_id": username,
      "topic": iot_resource_id
      
    }    
  }

  const OPA_TENANT_URL = OPA_URL.replace("opa",`opa_${username}`)

  console.log(OPA_TENANT_URL)
  console.log(opa_body)


  //Authenticate
  fetch(AUTHENTICATION_URL, { method: 'POST', body: JSON.stringify(login_body) })
    .then(res_authen => res_authen.json()) // expecting a json response
    .then(json => {      
      if (json['status']){
        
        //Authorize using OPA
        fetch(OPA_TENANT_URL, { method: 'POST', body: JSON.stringify(opa_body) })
        .then(res_autho => res_autho.json()) // expecting a json response
        .then(json => {

          console.log(username,json)
          
          
          if (json['result']['allow']){

            console.log("Tenant %s is authorized, action: %s, topic: %s",username,action,iot_resource_id);

            res.status(200);            
            res.send("OK");
            
          }else{

            
            console.log("Tenant %s is not authorized, action: %s, topic: %s",username,action,iot_resource_id);
            console.log(json)

            res.status(401);
            res.send("Unauthorized");
          }
        });

      }else{

        console.log("Tenant %s is authenticated, action: %s, topic: %s",username,action,resource_id);
        res.status(401); 
        res.send("Unauthenticate");
      }
    });



}


app.get('/auth_publish', (req, res) => {   

    username = req.query['username']
    password = req.query['password']
    resource_id  = req.query['name']    

    //This will return
    authenticate_and_authorize(username,password,'publish',resource_id,res)
    
})


//This is for checking authentication before playing
app.get('/auth_play', (req, res) => {

  username = req.query['username']
  password = req.query['password']
  resource_id  = req.query['name']    

  //This will return
  authenticate_and_authorize(username,password,'subscribe',resource_id,res)

})




//This is for checking authentication every 5 seconds
app.get('/auth_update', (req, res) => {

  

  username = req.query['username']
  password = req.query['password']
  resource_id  = req.query['name']    

  //This will return
  

  
  if (req.query['call'] == 'update_play'){
    authenticate_and_authorize(username,password,'subscribe',resource_id,res)
  }else{
    authenticate_and_authorize(username,password,'publish',resource_id,res)
  }  

})



//This is for checking authentication before playing
app.get('/auth_hls', (req, res) => {

  console.log("/auth_hls")

  

  try {

    console.log(req.headers['x-original-uri'])
    requestbody = parse(req.headers['x-original-uri'],true)
    pathname = requestbody['pathname']
    console.log("----",pathname)
    if(requestbody['pathname'].endsWith("m3u8")){

      resource_id =  path.basename(pathname).replace(".m3u8","");
      username= requestbody['query']['username']
      password= requestbody['query']['password']

      authenticate_and_authorize(username,password,'subscribe',resource_id,res)

    }
    else{
      //Ignore the files
      res.status(200);
      res.send('OK')
    }

  }catch (e) {

    console.log(e)
    
    res.status(500);
    res.send('OK')

  }

  
  


})


app.listen(port,'0.0.0.0', () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`)
})