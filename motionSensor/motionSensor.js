var gpio = require('onoff').Gpio;
var pir = new gpio(21, 'in', 'both');
const shellExec = require('shell-exec')

pir.watch((err, value) => {
    if (err) console.log('err', err)

    if (value == 1) {
        console.log('Triggered', new Date());
        const command = `omxplayer ${__dirname}/Akademia-pana-Kleksa-Kleksografia-edited.mp3 -o alsa:hw:1,0`;
        shellExec(command).catch(console.log)

    } else {
        console.log('End', new Date());
    }
});