const pug = require('pug');
const compiledFunction = pug.compileFile('templates/main.pug');

function render_tenant_policy(policies){
    return compiledFunction({
        policies: policies

    });

}

module.exports.render_tenant_policy = render_tenant_policy


// console.log(compiledFunction({
//     policies: [
//         {
//             "Name":"Allow subscribe People Count data in University of Dayton by Provider 1",
//             "Effect":"Allow",
//             "Action":[
//                 "subscribe"
                
//             ],
//             "Resource":[
//                 "/smartcity/traffic/peoplecount/usa/oh/udayton/provider1"
//             ]
//         },
//         {
//             "Name":"Allow stream camera in University of Dayton based on curtain constraints",
//             "Action":[
//                 "subscribe"                
//             ],
//             "Effect":"Allow",
//             "Resource":[
//                 "/smartcity/traffic/camera/usa/oh/udayton/provider1"
//             ],
//             "Condition": {
//                 "AnyOf":{
//                     "GreaterThan":{
//                         "context.peoplecount.udayton.max_5mins":30,
//                         "context.peoplecount.udayton.avg_15mins": 50
//                     }
//                 },
//                 "All":{    
//                     "LessThan": {
//                         "context.tenant.data_amount.lasthour": 100000,
//                         "context.tenant.data_amount.last24hour": 100000
//                     }           
                    
//                 }
//             }
            
//         }
//     ]
//   }));