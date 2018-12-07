const { createServer } = require('net')
const camelcase = require('camelcase')

const exportedObject = {
    getFreePort: () => {
        return new Promise((resolve, reject) => {
            const server = createServer()
            server.on('error', err => {
                reject(err)
            })
            server.on('listening', () => {
                const port = server.address().port
                server.close()
                resolve(port)
            })
            server.listen()
        })
    },
    camelize: item => {
        if(typeof item !== 'object' || !item)
            return item
        if(item instanceof Array) {
            return item.map(value => exportedObject.camelize(value))
        }
        Object.entries(item).forEach(([ key, value ]) => {
            const camelizedKey = camelcase(key)
            const isSameKey = key === camelizedKey
            item[camelizedKey] = exportedObject.camelize(value)
            if(!isSameKey) {
                delete item[key]
            }
        })
        return item
    },
    setupPublisherTest: ({
        client,
        dialog,
        publishedJson,
        expectedJson,
        hermesTopic,
        dialogPublication
    }) => {
        return new Promise(resolve => {
            client.subscribe(hermesTopic, function() {
                dialog.publish(dialogPublication, publishedJson)
            })
            client.on('message', (topic, messageBuffer) => {
                const message = JSON.parse(messageBuffer.toString())
                const expected = expectedJson || exportedObject.camelize(publishedJson)
                expect(expected).toMatchObject(message)
                client.unsubscribe(hermesTopic)
                resolve()
            })
        })
    },
    setupSubscriberTest: ({
        client,
        dialog,
        mqttJson,
        expectedJson,
        hermesTopic,
        dialogSubscription
    }) => {
        return new Promise(resolve => {
            dialog.once(dialogSubscription, message => {
                const expected = expectedJson || exportedObject.camelize(mqttJson)
                const received = expectedJson ? message : exportedObject.camelize(message)
                expect(received).toMatchObject(expected)
                resolve()
            })
            client.publish(hermesTopic, JSON.stringify(mqttJson))
        })
    }
}

module.exports = exportedObject