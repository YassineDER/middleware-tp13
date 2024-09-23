const express = require('express')
const dateformat = require('date-format')
const clone = require('clone')
// const random = require('random')
// Pour une raison inconnue, la ligne ci-dessus ne fonctionne pas (erreur: random.normal is not a function)
const random = new (require('random').Random)()

const ip = require("ip")
const path = require('path')

const app = express()
const ipAddress = ip.address()
const ipPort = 3000

app.use(express.json({
    inflate: true,
    limit: '100kb',
    reviver: null,
    strict: true,
    type: 'application/json',
    verify: undefined
}))

app.use(express.static(path.join(__dirname, "")))
app.set("view engine", "ejs")
app.engine('ejs', require('ejs').__express);
app.set("views", path.join(__dirname, ""))

let timerDataGenerator = null
let arrRandomNumbers = []
let funcDataGenerator = null
let jsonSetting = null
let interval // glabal variable to store the interval of the generator

app.get('/', (req, res) => {
    let x1

    if (arrRandomNumbers.length === 0) {
        x1 = []
    } else {
        x1 = arrRandomNumbers.slice(-20)
        x1.reverse()
    }

    res.render(path.join(__dirname, "webpage-data-generator.ejs"), {
        htmlDataPoints: x1
    })
})

app.post('/json', (req, res) => {
    let ans = ""
    let x1, x2, x3

    switch (req.body['MessageType']) {
        case 'Setting':
            ans = "Config/Update: "
            jsonSetting = clone(req.body)

            if (jsonSetting['DataGeneration'] != null) {
                switch (jsonSetting['DataGeneration']['DistributionType']) {
                    case 'Normal':
                        // Fetching the parameters from the JSON object based on the test-data-generator.js
                        const mu = jsonSetting['DataGeneration']['Params']['mu']
                        const sigma = jsonSetting['DataGeneration']['Params']['sigma']
                        // random.normal(mu, sigma) return itself a function, so no need to wrap it in another lambda function
                        funcDataGenerator = random.normal(mu, sigma)
                        break

                    case 'Uniform':
                        // Fetching the parameters from the JSON object based on the test-data-generator.js
                        const min = jsonSetting['DataGeneration']['Params']['min']
                        const max = jsonSetting['DataGeneration']['Params']['max']
                        // random.uniform(min, max) return itself a function, so no need to wrap it in another lambda function
                        funcDataGenerator = random.uniform(min, max)
                        break
                }

                // Fetching the interval from the JSON object based on the test-data-generator.js
                interval = jsonSetting['DataGeneration']['Interval']
            }

            break;

        case 'Command':
            ans = `Execute:${req.body['NodeCommand']}`
            switch (req.body['NodeCommand']) {
                case 'Start':
                    clearInterval(timerDataGenerator)
                    // The presence of Interval in the test file, precisely in the DataGenerator body, means that it must be used when the generator is started
                    timerDataGenerator = setInterval(() => {
                        x1 = funcDataGenerator()
                        x1 = Math.round(x1 * 10) / 10
                        x2 = new Date()
                        x3 = dateformat('yyyy-MM-dd hh:mm:ss.SSS', x2)

                        arrRandomNumbers.push({
                                'TimeStampRaw': x2,
                                'TimeStampFormatted': x3,
                                'DataValue': x1
                            })
                    }, interval);
                    // By default, the generator will perform the generation every 100ms

                    break

                case 'Stop':
                    // Stop the generator by clearing the interval
                    clearInterval(timerDataGenerator)
                    break

                case 'DeleteAllData':
                    // Clear the array of generated data
                    arrRandomNumbers = []
                    break

                case 'Fetch-Data':
                    ans = { 'DataPoints': arrRandomNumbers }
                    break
            }

            break

        default:
            ans += ` => Unknown Message Type => ${req.body['MessageType']} !!!`
    }

    res.json({ 'Message': ans })
})


app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`))