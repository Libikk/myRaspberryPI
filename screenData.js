const axios = require('axios');
const moment = require('moment');

const credentials = {
  login: process.env.ESP_LOGIN,
  password: process.env.ESP_PASSWORD,
};

let localTemp = '';
let isRaining = false;

const getLightMode = () => {
    var format = 'hh:mm:ss'
    var time = moment(moment(), format),
      beforeTime = moment('05:30:00', format),
      afterTime = moment('21:30:00', format);

    if (time.isBetween(beforeTime, afterTime)) return 'LIGHT';
    else return 'DARK';
}

const sendData = async () => {
    const { temperature, humidity } = await axios.get('http://192.168.0.152/api', { headers: credentials }).then(r => r.data);
    const lightMode = getLightMode();
    const line1 = moment().format('YYYY/MM/DD  hh:mm:ss');
    const line2 = '--Room-----Outside--';
    const line3 = `  ${humidity.toFixed(2)}  |   ${isRaining ? 'rain' : ''}`;
    const line4 = `  ${temperature}C |  ${localTemp}C`;

    axios.get(`http://192.168.0.150/screen?line1=${line1}&line2=${line2}&line3=${line3}&line4=${line4}&screenMode=${lightMode}`, { headers: credentials })
}

const getLocalTemperature = () => {
  axios.get('http://api.openweathermap.org/data/2.5/weather?q=kingsbury&appid=811ade084421edfd4e2b8331ba00e291')
    .then(res => {
      isRaining = res.data.weather[0].main === 'Rain';
      localTemp = `${String((res.data.main.temp - 273.15).toFixed(2))}`;
    })
}

setInterval(getLocalTemperature, 1200000);
getLocalTemperature();

setInterval(sendData, 10000);