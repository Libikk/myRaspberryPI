const sensor = require("node-dht-sensor");
const express = require('express')
const app = express()
require('dotenv').config()
const port = 3333
const { tempReadings } = require('./fanControl');
require('./screenData');
const hdc1080 = require('./temp-hdc1080/hdc-1080reader');
const { playMusicOnMotion } = require('./motionSensor');
const schedule = require('node-schedule');
const dayjs = require('dayjs');
const axios = require('axios');

const credentials = {
    login: process.env.ESP_LOGIN,
    password: process.env.ESP_PASSWORD
}
console.log('credentials', credentials);

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

const beepTimes = async (times = 1, duration = 200) => {
    for (i = 0; i < times; i++) {
       await axios.get(`http://192.168.0.151/playBeep?duration=${duration}`, { headers: credentials })
    }
}

const lightSwitch = (onOrOff) => {
	axios.get(`http://192.168.0.154/api?switchValue=${onOrOff}`, { headers: credentials })
		.then(res => console.log('light toggled', res.data))
		.catch(err => console.log('light switch error:', err))
}

schedule.scheduleJob({ hour: 5, minute: 0 }, async () => {
	beepTimes(2)
});

schedule.scheduleJob({ hour: 5, minute: 30 }, async () => beepTimes(3));
schedule.scheduleJob({ hour: 6, minute: 0 }, async () => {
	beepTimes(4, 1000)
	lightSwitch('ON')
});

schedule.scheduleJob({ hour: 7, minute: 0 }, async () => lightSwitch('OFF'));

// breaks
schedule.scheduleJob({ hour: 11, minute: 0 }, async () => beepTimes(2, 1000));
schedule.scheduleJob({ hour: 12, minute: 0 }, async () => beepTimes(2, 1000));
schedule.scheduleJob({ hour: 13, minute: 0 }, async () => beepTimes(2, 1000));

schedule.scheduleJob({ hour: 15, minute: 30 }, async () => beepTimes(2, 1000));
schedule.scheduleJob({ hour: 17, minute: 30 }, async () => beepTimes(4, 1000));

schedule.scheduleJob({ hour: 18, minute: 0 }, async () => lightSwitch('ON'));
schedule.scheduleJob({ hour: 21, minute: 0 }, async () => lightSwitch('OFF'));


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

	const hdc1080Res = await axios.get('http://192.168.0.152/api', { headers: credentials })
		.then(r => r.data)
		.then(({ temperature, humidity }) => wrapIntoTemplate(temperature, humidity, 'HDC1080'))
		.catch(err => console.log('/room errrrrr-rrrr', err))


	res.send('     ' + hdc1080Res);
})

app.get('/motion/:status', (req, res) => {
    playMusicOnMotion(req.params.status);
    res.sendStatus(200)
})

app.get('/playBeep/:duration', async (req, res) => {
	const durationDefault = 500;
	await axios.get(`http://192.168.0.151/playBeep?duration=${req.params.status || durationDefault}`, { headers: credentials })
		.catch(err => console.log('/playBeep/:duration errrrrr-rrrr', err))
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
