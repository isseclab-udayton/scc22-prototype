package app.iot


# Validate Whitelist 
default allow = false

allow {
	action_is_publish
    validate_publish_permission
}

allow {
	action_is_subscribe
    validate_subscribe_permission

}

action_is_publish {
	input.action == "publish"
    
}

action_is_subscribe {
	input.action == "subscribe"
}

validate_publish_permission{
	some i
	regex.match(input.policy["topics"]["publish"][i], input.topic)
}


validate_subscribe_permission{
	some i
	regex.match(input.policy["topics"]["subscribe"][i], input.topic)
}


# Validate Emergency using Emergency List 


# Validate using something. 



