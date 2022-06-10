const ExternalPermission = {
    "tenant1": {
        "topics":{
            "publish": [
                "/environment/air/([a-z]+)/([a-z]+)/oh/universityofdayton/tenant1",
                "/smartcity/traffic/([a-z]+)/([a-z]+)/tx/([a-z]+)/tenant1"
            ],
            "subscribe": []
        },
        "quota":{
            "publish":{
                "bytes": 1*1000*1000,  // 100 bytes
                "duration": 60 // Second
            },
            "subscribe":{
                "bytes": 1*1000*1000,  // 100 bytes
                "duration": 60 // Second
            }
            
        }
    },
    "tenant2": {

        "topics":{
        
            "publish": [
                "/environment/([a-z]+)/([a-z]+)/usa/oh/([a-z]+)/tenant2"
            ],
            "subscribe": [
                "/smartcity/traffic/([a-z]+)/([a-z]+)/tx/([a-z]+)/tenant1"
            ]
        },               
        "quota":{
            "publish":{
                "bytes": 1*1000*1000,  // 100 bytes
                "duration": 60 // Second
            },
            "subscribe":{
                "bytes": 1*1000,  // 100 bytes
                "duration": 60 // Second
            }
            
        }

    },
    "tenant3": {

        "topics":{
            "publish": [],
            "subscribe": [
                "/environment/air/([a-z]+)/([a-z]+)/oh/([a-z]+)/([a-z]+)"
            ]
        }
    },
    "tenant4": {
        "topics":{
            "publish": [],
            "subscribe": [
                "/environment/([a-z]+)/([a-z]+)/([a-z]+)/oh/([a-z]+)/tenant2"
            ]
        }
    }
}


module.exports.ExternalPermission = ExternalPermission