# IoT DataHub

This setup has implement a system architecture on the Fog/Cloud environment for the IoT-Datahub.


## Requirements
We dockerlize all components, so it's required the following softwares to make the system up and running: 
* Docker 
* docker-compose

## Structure 
```
scenario
│   README.md
|   docker-compose.yml│
└───AuthenticationService
└───OPA
└───VirtualMQTT
└───Streaming-Service
└───Streaming-Auth
└───EmergencyMonitor
```

All these folders have the readme on the relavant configurations for these external providers and how to run them.

---

## Services

### AuthenticationService
This service is a sample service that take `123456` as the default password for all user name. There is also a JSON file named `permission.json` represent the user list and user permission in the system. Once user authenticates, a JWT token is returned with permission information of the given user. 


### VirtualMQTT
This service is implemented using Aedes (https://github.com/moscajs/aedes) to enhance the security by integrating with OPA to validate the permission of the current logged in user. 

To publish a message, run the following command:

```bash 
 mosquitto_pub -h 192.168.99.101 -u tenant1 -P 123456 -t "/smartcity/traffic/peoplecount/usa/oh/udayton/tenant1" -m "123" 
 ```

To subscribe to a topic, run the following command: 

```bash
 mosquitto_sub -h 192.168.99.101 -u tenant2 -P 123456 -t "/smartcity/traffic/peoplecount/usa/oh/udayton/tenant1" 
 ```


### Streaming-Service

This streaming service is using Nginx RTMP plugin.
To publish a video to this service, use the following command: 

```bash
 ffmpeg -re -i videoplayback.mp4 -vcodec copy -f flv rtmp://192.168.99.101/show/stream
 ```
 