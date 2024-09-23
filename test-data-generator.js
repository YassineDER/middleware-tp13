const axios = require('axios');
const urlDataGenerator = 'http://localhost:3000/json'


function sendAxiosPost(url, dataObj) {
    axios.post(url, dataObj)
        .then((res) => {
            if (res.data.Message.DataPoints != null)
                console.log(res.data.Message.DataPoints);
            else console.log(res.data);
        })
        .catch((err) => console.log(err))
}


// sendAxiosPost(urlDataGenerator, {
//     MessageType: 'Setting',
//     DataGeneration: {
//         DistributionType: 'Normal', // or 'Uniform'
//         Params: { mu: 100, sigma: 10 }, // or Params: { min: -10, max: 10 }
//         Interval: 100
//     }
// })


sendAxiosPost(urlDataGenerator, {
    MessageType: 'Setting',
    DataGeneration: {
        DistributionType: 'Uniform',
        Params: { min: -10, max: 10 },
        Interval: 100
    }
})

sendAxiosPost(urlDataGenerator, {
    MessageType: 'Command',
    NodeCommand: 'DeleteAllData'
})

sendAxiosPost(urlDataGenerator, {
    MessageType: 'Command',
    NodeCommand: 'Start'
})


setTimeout(() => {
    sendAxiosPost(urlDataGenerator, {
        MessageType: 'Command',
        NodeCommand: 'Stop'
    })

}, 5000);

setTimeout(() => {
    sendAxiosPost(urlDataGenerator, {
        MessageType: 'Command',
        NodeCommand: 'Fetch-Data'
    })

}, 6000);
