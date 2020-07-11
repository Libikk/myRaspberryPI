const axios = require('axios');
const moment = require('moment');

const credentials = {
  login: process.env.ESP_LOGIN,
  password: process.env.ESP_PASSWORD,
};

let localTemp = '';
let isRaining = false;
let lastScreen = 2;
let internetConnectionStatus = null;

const sendDataIntervalTime = 3000;

const getLightMode = () => {
    var format = 'hh:mm:ss'
    var time = moment(moment(), format),
      beforeTime = moment('05:30:00', format),
      afterTime = moment('21:30:00', format);

    if (time.isBetween(beforeTime, afterTime)) return 'LIGHT';
    else return 'DARK';
}

const getFirstScreenData = async () => {
  const { temperature, humidity } = await axios.get('http://192.168.0.152/api', { headers: credentials }).then(r => r.data);
  const line1 = moment().format('YYYY/MM/DD  hh:mm:ss');
  const line2 = '--Room-----Outside--';
  const line3 = `  ${humidity.toFixed(2)}  |   ${isRaining ? 'rain' : ''}`;
  const line4 = `  ${temperature}C |  ${localTemp}C`;
  return { line1, line2, line3, line4 };
}

const getInternetConnectionStatus = () => {
  require('dns').resolve('www.google.com', (err) => {
    if (err) internetConnectionStatus = 'No connection';
    else internetConnectionStatus = 'Connected';
  });
}

const getSecondScreenData = () => {
  const line1 = '  Internet status';
  const line3 = `     ${internetConnectionStatus}`;
  return { line1, line3 };
}

const nextScreen = () => {
  switch(lastScreen) {
    case 1:
      lastScreen = 2;
      break;
    case 2:
        lastScreen = 1;
      break;
  }
}

const sendData = async () => {

    let screenData = {}
    const lightMode = getLightMode();
    const changeDelay = sendDataIntervalTime;
    if (lastScreen === 2) screenData = await getFirstScreenData();
    if (lastScreen === 1) screenData = getSecondScreenData();
    nextScreen();

    const { line1 = '', line2  = '', line3  = '', line4 = '' } = screenData;

    axios.get(`http://192.168.0.150/screen?line1=${line1}&line2=${line2}&line3=${line3}&line4=${line4}&screenMode=${lightMode}&changeDelay=${changeDelay}`, { headers: credentials })
}

const getLocalTemperature = () => {
  axios.get('http://api.openweathermap.org/data/2.5/weather?q=kingsbury&appid=811ade084421edfd4e2b8331ba00e291')
    .then(res => {
      isRaining = res.data.weather[0].main === 'Rain';
      localTemp = `${String((res.data.main.temp - 273.15).toFixed(2))}`;
    })
}

setInterval(getLocalTemperature, 1200000);
setInterval(getInternetConnectionStatus, 10000);
getLocalTemperature();

setInterval(sendData, sendDataIntervalTime);