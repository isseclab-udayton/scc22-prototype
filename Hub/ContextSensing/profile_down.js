var mqtt = require('mqtt')
const { Kafka } = require('kafkajs')
const {DataFrame} = require("dataframe-js")
const fetch = require('node-fetch');
const urljoin = require('url-join');



const MQTT_HOST = process.env.MQTT_HOST || "mqtt://192.168.99.104:1883"
const BOOTSTRAP_KAFKA_HOST = process.env.BOOTSTRAP_KAFKA_HOST || "192.168.99.104:9092"
const API = process.env.API || "http://192.168.99.104:3000"
const kafka_context_sensing_topic = ".context_data"


var client = mqtt.connect(MQTT_HOST,{
    username: "context_sensing",
    password:"123456"
})

const kafka = new Kafka({
    clientId: 'context-sensing',
    brokers: [BOOTSTRAP_KAFKA_HOST]
})


const producer = kafka.producer()
producer.connect()








producer.on(producer.events.CONNECT, function () {



    setInterval(() => {

        const context_data = {
            'people_count': {},
            'smoke_alarm': {}
        }


        const ts = Date.now();
        console.log(`[Context Change TS: ${ts}`);
    
    
        context_data['people_count']['store_x'] = {
            "max_5mins": 5,
            "min_5mins": 1,
            "avg_5mins": 2,
            "max_15mins": 10,
            "min_15mins": 1,
            "avg_15mins": 3
            
        }

        context_data['smoke_alarm']['store_x'] = {
            "max_5mins": 1,
            "min_5mins": 1,
            "avg_5mins": 1,
            "max_15mins": 1,
            "min_15mins": 1,
            "avg_15mins": 1
            
        }
    
        producer.send({
            topic: kafka_context_sensing_topic,
            messages: [
                { value: JSON.stringify(context_data) },
                ],
            });

    },20000);
    

});


