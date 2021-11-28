const { Kafka } = require('kafkajs')
const BOOTSTRAP_KAFKA_HOST = process.env.BOOTSTRAP_KAFKA_HOST || "192.168.99.102:9092"

const kafka = new Kafka({
    clientId: 'context-sensing-sub',
    brokers: [BOOTSTRAP_KAFKA_HOST]
})

const consumer = kafka.consumer({ groupId: 'test-group' })

consumer.connect()
consumer.subscribe({ topic: '.context_sensing.tenant1', fromBeginning: true })

consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log({
      value: message.value.toString(),
    })
  },
})