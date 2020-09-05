const axios = require('axios');
const moment = require('moment');

const credentials = {
  login: process.env.ESP_LOGIN,
  password: process.env.ESP_PASSWORD,
};

let localTemp = '';
let showScreen = 2;
let internetConnectionStatus = null;
let tflStatusData = null;
let sunriseTime = null;
let sunsetTime = null;
let isRaining = null;
const sendDataIntervalTime = 5000;

const getLightMode = () => {
    var format = 'hh:mm:ss'
    var time = moment(moment(), format),
      beforeTime = moment('05:30:00', format),
      afterTime = moment('21:00:00', format);

    if (time.isBetween(beforeTime, afterTime)) return 'LIGHT';
    else return 'DARK';
}

const getTflStatus = async () => {
  tflStatusData = await axios.get('https://api.tfl.gov.uk/line/mode/tube/status').then(r => r.data);
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

const getThirdScreenData = async () => {

  const jubileeLineData = tflStatusData.find(({ id }) => id === 'jubilee')
  const metropolitanLineData = tflStatusData.find(({ id }) => id === 'metropolitan')
  const line1 = '  TFL tube status';
  const line3 = `Jub: ${jubileeLineData.lineStatuses[0].statusSeverityDescription}`;
  const line4 = `Met: ${metropolitanLineData.lineStatuses[0].statusSeverityDescription}`;
  return { line1, line3, line4 };
}

const getForthScreenData = () => {
  const line1 = '  Sunrise | Sunset  '
  const line2 = `   ${moment(sunriseTime).format('hh:mm')}  |  ${moment(sunsetTime).format('hh:mm')}   `;
  return { line1, line2 };
}

const nextScreen = () => {
  switch(showScreen) {
    case 1:
      showScreen = 2;
      break;
    case 2:
      showScreen = 3;
      break
    case 3:
      showScreen = 4;
      break;
    case 4:
      showScreen = 1;
      break;
  }
}

const sendData = async () => {

    let screenData = {}
    const lightMode = getLightMode();

    if (showScreen === 1) screenData = await getFirstScreenData();
    if (showScreen === 2) screenData = getSecondScreenData();
    if (showScreen === 3 && tflStatusData) screenData = await getThirdScreenData();
    if (showScreen === 4) screenData = await getForthScreenData();
    nextScreen();

    const { line1 = '', line2  = '', line3  = '', line4 = '' } = screenData;

    axios.get(`http://192.168.0.150/screen?line1=${line1}&line2=${line2}&line3=${line3}&line4=${line4}&screenMode=${lightMode}`, { headers: credentials })
    .catch(err => console.log('Screen error ->', err))

}

const getLocalTemperature = () => {
  axios.get('http://api.openweathermap.org/data/2.5/weather?q=kingsbury&appid=811ade084421edfd4e2b8331ba00e291')
    .then(res => {
      isRaining = res.data.weather[0].main === 'Rain';
      localTemp = `${String((res.data.main.temp - 273.15).toFixed(2))}`;
    })
    axios.get('https://api.sunrise-sunset.org/json?lat=51.5853&lng=0.2783&formatted=0')
    .then(({ data }) => {
    console.log('getLocalTemperature -> data', data, data.results.sunrise);
      sunriseTime = data.results.sunrise;
      sunsetTime = data.results.sunset;
    })
}

// update every some time
setInterval(getLocalTemperature, 1200000);
setInterval(getTflStatus, 180000);
setInterval(getInternetConnectionStatus, 10000);

// initial req
getLocalTemperature();
getTflStatus();
getInternetConnectionStatus();

// main
setInterval(sendData, sendDataIntervalTime);