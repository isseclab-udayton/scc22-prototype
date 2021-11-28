# CONTEXT-BASED MULTI-TENANCY POLICY ENFORCEMENT FOR DATA SHARING IN IOT SYSTEMS
## Introduction
This Github repository includes the code and infrastructure set up for the IoT Datahub. 
This project has been implemented by Huu Ha Nguyen with the instruction and supervisor from Professor  Hong-Linh Truong,  Professor Phu. Phung, Dr. Phu Nguyen. 


## System Architecture

The platform is proposed to be a multi-regional-hubs system that connects with the Cloud for data exchange. The hubs serve the clients in its region and based on the data collected, it aggregates the corresponding data to become contexts and sends them to the Cloud. The cloud receives that context data to process and sends management commands to the hubs. 

![Alt text](/readme/img/cloud-hubs-architecture.png?raw=true "Multiple region architecture")

Considering the connection between a specific hub with the cloud, there are several services are set up tied to 2 types: 
Cloud services: The services that runs on the cloud for management including MongoDB, Kafka, Context-based interpretation worker, Local Policy Synchronizer.
Hub Services
Hub-specific services: The must-have services on the hub to automate the data management on the Hubs such as Local Policy Synchronizer, Virtual MQTT, Context Sensing, etc
Tenant-specific services: The services that are set up for each tenant on the hubs such as OPA.
These components connect tightly together that create 3 main operations: 
Data publishing and subscribing
Tenant-specific policy generation
Tenant-specific context data generation

![Alt text](/readme/img/cloud-hub-architecture.png?raw=true "Cloud-Hub Architecture")


### Data Publishing and Subscribing
On every hub, multiple hub-specific applications are the data gateways for the clients to connect to. These applications need to connect to the OPA, a tenant-specific application, for authorization for per requests. 

![Alt text](/readme/img/publish-subscribe-architecture.png?raw=true "Cloud-Hub Architecture")

In this research, we have implemented two applications using MQTT protocol and RTMP protocols.




## Directory Structure

```
.
│   README.md:
│   readme\img    
│
└───Cloud
│   └───Cloud-Kafka
│   |   -   docker-compose.yml
│   |   -   startup.sh
│   └───Cloud-Mongo
│   |   -   docker-compose.yml
│   |   -   startup.sh
│   |   -   datahub
│   └───ManagerApps
│       |───API
│       |   -   Dockerfile
│       |   -   *.js files
│       |───Context-Interpretation-Worker
│       |   -   Dockerfile
│       |   -   *.js files
│       |───Policy-Generator
│       |   -   Dockerfile
│       |   -   *.js files
│   
└───Hubs
│   | -   docker-compose.yml
│   | -   startup.sh
│   └───ManagerApps
│   |   |───ContextSensing
│   |   |   -   Dockerfile
│   |   |   -   *.js files
│   └───OPA
│   |   |───ContextSensing
│   |   |   -   Dockerfile
│   |   |   -   *.js files
│   └───Policy-Synchronizer
│   |   |───ContextSensing
│   |   |   -   Dockerfile
│   |   |   -   *.js files
│   └───Streaming-Auth
│       |───ContextSensing
│       |   -   Dockerfile
│       |   -   *.js files
│       Streaming-Service
│       |───ContextSensing
│       |   -   Dockerfile
│       |   -   *.js files
│       VirtualMQTT
│       |───ContextSensing
│       |   -   Dockerfile
│       |   -   *.js files
└───Tenants
│   | -   docker-compose.yml
│   | -   startup_ai.sh
│   | -   startup_publisher.sh
│   | -   startup_web.sh
│   └───Tenant-1: Video Publisher
│       |───ContextSensing
│       |   -   Dockerfile
│       |   -   *.js files
│       Tenant-2: AI
│       |───ContextSensing
│       |   -   Dockerfile
│       |   -   *.js files
│       Tenant-Web
│       |───ContextSensing
│       |   -   Dockerfile
│       |   -   *.js files

```


## Sample Data

The sample data is in the folder: Cloud-Mongo\datahub.
To import the data, use MongoCompass to import the data to the following collections:
- tenants
- policies
- contexts

## Steps to run the system
Prerequisite: You must install docker and docker-compose on your computer
1. Start Kafka
```
cd Cloud-Kafka
./startup.sh
```

2. Start MongoDB and import collections to MongoDB
```
cd Cloud-Mongo
./startup.sh
```

Use MongoDB Compass to import the sample data.

3. Start Cloud Manager Apps

```
cd ManagerApps
./startup.sh
```

4. Start Hub Services

```
cd Hubs
./startup.sh
```


5. Start Tenant Services

```
cd Hubs
./startup.sh
```


