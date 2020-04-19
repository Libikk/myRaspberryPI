const Gpio = require('onoff').Gpio;
const FAN = new Gpio(18, 'out');
const shellExec = require('shell-exec')

const TEMP_UPPER_LIMIT = 40;
const TEMP_BOTTOM_LIMIT = 37;

const isFanOn = () => !!FAN.readSync();
const toggleFan = () => isFanOn() ? FAN.writeSync(0) : FAN.writeSync(1);

const checkTemperature = () => {
  shellExec('vcgencmd measure_temp')
    .then(({ stdout }) => {
      const processorTemperature = stdout.replace ( /[^\d.]/g, '' );
      
      if (processorTemperature > TEMP_UPPER_LIMIT && !isFanOn()) return toggleFan();
      if (processorTemperature < TEMP_BOTTOM_LIMIT && isFanOn()) return toggleFan();
    })
    .catch(console.log);
}

setInterval(checkTemperature, 4000);

const tempReadings = () => {
  return shellExec('vcgencmd measure_temp')
  .then(({ stdout }) => {
	console.log('RESS', stdout)
    const processorTemperature = stdout.replace ( /[^\d.]/g, '' );
    return `
    <div style="display: flex; flex-direction: column;">
      <div>
        Processor temperature: <span style="font-weight: bold; font-size:20; color: green;">${processorTemperature}&#8451;<span>
      </div>
      <div>
        Is fan on: <mark>${isFanOn()}</mark>
      </div>
      <div style="display: flex; flex-direction: column;">
        <span>Upper temp limit: ${TEMP_UPPER_LIMIT}&#8451;</span>
        <span>Bottom temp limit: ${TEMP_BOTTOM_LIMIT}&#8451;</span>
      </div>
    </div>
      `
  })
  .catch(console.log)
}

// circuit http://i.imgur.com/yFuEZMe.png

module.exports = { tempReadings };
