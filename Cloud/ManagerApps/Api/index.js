const express = require('express')
const bcrypt = require('bcryptjs');
const MongoClient = require('mongodb').MongoClient;

const PORT = process.env.PORT || 3000
const MONGO_URL = process.env.MONGO_URL || "mongodb://root:root@192.168.99.104"
const MONGO_DBNAME = process.env.MONGO_DBNAME || "datahub"
const app = express()


app.use(express.json({type: '*/*'}));

app.get('/', (req, res) => {
  res.send('Hello World!')

  
})

app.get('/mapping', (req, res) => {
 

  MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(MONGO_DBNAME);
    
    dbo.collection("contexts").find({}).toArray(function(err, result) {
      if (err) throw err;
      
      db.close();

      res.send(JSON.stringify(result[0]))  

    });
  })


})

app.post('/login', function (req, res) {

  // response_body={
  //   "status": true            
  // }

  // res.send(JSON.stringify(response_body))
  // return

  
        
    const username = req.body['username']
    const password = req.body['password']

    MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db(MONGO_DBNAME);
      
      dbo.collection("tenants").findOne({tenant_name: username}, function(err, result) {
        if (err) throw err;
        db.close();

        let status = false


        if (result != null && bcrypt.compareSync(password, result.password)){
          status = true
        }

        response_body={
          "status": status            
        }

        res.send(JSON.stringify(response_body))
        
      });
    });    
  })

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})