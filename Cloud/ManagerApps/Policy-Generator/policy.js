// #https://play.openpolicyagent.org/p/LxF8PaqGwi
// ?https://play.openpolicyagent.org/p/4KOgbptMe2
// https://play.openpolicyagent.org/p/gw50QqmUfh
const fs = require('fs');

var format = require("string-template")


OPERATOR_MAPPING= {
    'GreaterThanAndEqualTo': ">=",
    'GreaterThan': ">",
    'LessThanAndEqualTo': "<=",
    'LessThan': "<",
    'EqualTo': "==",

}

function render_condition_anyof(conditions){
    
    condition_list = []

    conditions_var_list = []

    Object.keys(conditions).forEach(function(context_id){
        var_id = "var"+context_id.replace(/\./g,"_")      
        
        Object.keys(conditions[context_id]).forEach(function(operator){          

            condition_text = format("{var_id} := data[emergency_topics][\"{context_id}\"] {operator} {value};\n\r",{
                var_id:var_id,
                context_id:context_id,
                operator: OPERATOR_MAPPING[operator],
                value: conditions[context_id][operator]
            });

            condition_list.push(condition_text)
    
            

        })

        conditions_var_list.push(var_id)

    });

    condition_text = condition_list.join("\n")

    condition_text_validation = `
    #Validate Condition AnyOf

    {vars}

    conditions_anyof := [{var_list}]
    some k
    conditions_anyof[k] == true
    `

    condition_text = format(condition_text_validation,{vars: condition_list.join("\n"), var_list: conditions_var_list.join(",")})

    


   return condition_text



}

function render_condition_allof(conditions){
    
    condition_list = []

    conditions_var_list = []

    Object.keys(conditions).forEach(function(context_id){
        var_id = "var"+context_id.replace(/\./g,"_")
        

        Object.keys(conditions[context_id]).forEach(function(operator){          

            condition_text = format("{var_id} := data[emergency_topics][\"{context_id}\"] {operator} {value};\n\r",{
                var_id:var_id,
                context_id:context_id,
                operator: OPERATOR_MAPPING[operator],
                value: conditions[context_id][operator]
            });
            condition_list.push(condition_text)           

        })

        conditions_var_list.push(var_id)

    });

    // condition_text = condition_list.join("\n")

    condition_text_validation = `
    #Validate Condition AllOf

    {vars}

    conditions_allof := [{var_list}]
    conditions_allof_negative := {value | value = conditions_allof[_]; value == false}
    count(conditions_allof_negative) == 0
    `

    condition_text = format(condition_text_validation,{vars:condition_list.join("\n"),var_list: conditions_var_list.join(",")})
   return condition_text
    
}

function render_condition(conditions){

    
    conditions_rego = ""
    if ('AnyOf' in conditions){

        conditions_rego=conditions_rego + render_condition_anyof(conditions['AnyOf'])

    }

    if('All' in conditions){
        conditions_rego=conditions_rego + render_condition_allof(conditions['All'])

    }
    
    
    
    return conditions_rego

}

function render_policy(policy){
    policy_template=`
allow {
    #Validate-Action
    some i
    actions := {actions}
    actions[i] == input.action

    #Validate Resource
    resources := {resources}
    some j
    regex.match(resources[j], input.topic)

    {condition}

}
    `;

    let Condition_rego=''
    if ('Condition' in policy){
        
        Condition_rego = render_condition(policy['Condition'])
    }


    
    policy_rego = format(policy_template,{
        actions: JSON.stringify(policy['Action']),
        resources: JSON.stringify(policy['Resource']).replace(/\*/g,"([a-z0-9A-Z_]+)"),
        condition: Condition_rego

    });

    
    return policy_rego

}

function render_tenant_policy(policies){

    tenant_policy = `
package app.iot

default allow = false
default deny = false
    `
    

    Object.keys(policies).forEach(function(policy){
        policy_rule = render_policy(policies[policy])

        tenant_policy = tenant_policy.concat(policy_rule)


    });

    return tenant_policy
}


module.exports.render_tenant_policy = render_tenant_policy

