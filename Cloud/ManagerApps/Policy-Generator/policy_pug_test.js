const pug = require('pug');
const compiledFunction = pug.compileFile('templates/main.pug');


console.log(compiledFunction({
    policies: [
        {
            "Name":"Deny subscribe People Count data in University of Dayton by Provider 1",
            "Effect":"Deny",
            "Action":[
                "subscribe"
                
            ],
            "Resource":[
                "/smartcity/traffic/peoplecount/usa/oh/udayton/provider1"
            ]
        },
        {
            "Name":"Allow stream camera in University of Dayton based on curtain constraints",
            "Action":[
                "subscribe"                
            ],
            "Effect":"Allow",
            "Resource":[
                "/smartcity/camera/stream/usa/ohio/store_x/city_surveillance"
            ],
            "Condition": {
                "AnyOf":[
                    {"object":"people_count","location":"store_x","max_5mins":{"gt": 30}}                      
                                     
                ],
                "All":[
                    {"object":"data_amount","protocol":"mqtt","lasthour_mb":{"lt": 3000}},
                    
                ]
            }
        }
    ]
  }));
