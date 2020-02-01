const gpio = require("pi-gpio");


gpio.read(5, function(err, value) {
    if(err) throw err;
    console.log('val', value);	// The current state of the pin
});