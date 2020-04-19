const sensor = require("node-dht-sensor");
const express = require('express')
const app = express()
require('dotenv').config()
const port = 3333
const { tempReadings } = require('./fanControl');
const hdc1080 = require('./temp-hdc1080/hdc-1080reader');
const { playMusicOnMotion } = require('./motionSensor');
const schedule = require('node-schedule');
const dayjs = require('dayjs');
const axios = require('axios');

const images = {
	DHT10: "https://gr33nonline.files.wordpress.com/2015/09/5-pcs-lot-single-bus-dht11-digital-temperature-and-humidity-sensor-dht11-probe-090345.jpg",
	HDC1080: "https://www.ezgiz.com/wp-content/uploads/2017/08/gy213v-hdc1080-high-accuracy-digital-humidity-with-temperature-sensor-module-3383.jpg"
}


const getDHT10Reading = () => new Promise((resolve, reject) => {
	sensor.read(11, 4, function(err, temperature, humidity) {
		if (err) return reject(err)
		resolve({ temperature, humidity })
	});
})


// schedule.scheduleJob({ hour: 2, minute: 30 }, async () => {
//     const endTime = dayjs().add(2, 'hours');
// 	const restart = require('./restart');

//     while (dayjs().isBefore(endTime)) {
//         await restart(false);
//     }
// });


app.get('/room', async (req, res) => {
	const wrapIntoTemplate = (temp, humi, title) => {
		return `<div>
			<h1>${title} sensor</h1>
			<img src=${images[title]} style="width: 200px; height: 200px;">
			<div>Room temperature: <span style="font-weight: bold; font-size:20; color: green;">${temp} &#8451;<span></div>
			<div>Room humidity: <span style="font-weight: bold; font-size:20; color: green;">${humi} %<span></div>
		</div>`
	}
	// const HDT10 = await getDHT10Reading().then(({ temperature, humidity }) => wrapIntoTemplate(temperature, humidity, 'DHT10'))

	const hdc1080Res = await axios.get('http://192.168.1.107/')
		.then(r => r.data)
		.then(({ temperature, humidity }) => wrapIntoTemplate(temperature, humidity, 'HDC1080'))


	res.send('     ' + hdc1080Res);
})

app.get('/motion/:status', (req, res) => {
    playMusicOnMotion(req.params.status);
    res.sendStatus(200)
})

app.get('/processor', (req, res) => {
	tempReadings()
		.then(data => res.send(data)) ;
})

app.get('/distance/:distance', (req, res) => {
    console.log('req: ', new Date(), req.params);
    res.sendStatus(200)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
