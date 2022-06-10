for i in {1..10000}; do 
	mosquitto_pub -h 192.168.99.102 -t "/smartcity/traffic/peoplecount/usa/oh/udayton/provider1" -u provider1 -P 123456 -m `echo $((1 + $RANDOM % 30))`; 
	mosquitto_pub -h 192.168.99.102 -t "/smartcity/traffic/camera/usa/oh/udayton/provider1" -u provider1 -P 123456 -m `echo $((1 + $RANDOM % 10))`; 
	
	mosquitto_pub -h 192.168.99.102 -t "/hub/data_amount/mqtt/tenant1" -u context_sensing -P 123456 -m `echo $((1 + $RANDOM % 10))`; 
	sleep 1; 
done
