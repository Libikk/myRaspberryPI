const sensor = require("node-dht-sensor");
const express = require('express')
const app = express()
const port = 3333
const shellExec = require('shell-exec')
const { tempReadings } = require('./fanControl');


app.get('/room', (req, res) => {
	sensor.read(11, 4, function(err, temperature, humidity) {
  		if (err) return console.error(err)
		const temps = `Room temperature: <span style="font-weight: bold; font-size:20; color: green;">${temperature}&#8451;, humidity: ${humidity}%<span>`;
		console.log(temps)
		res.send(temps)
	});
})

app.get('/processor', (req, res) => {
	tempReadings()
		.then(data => res.send(data)) ;
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
