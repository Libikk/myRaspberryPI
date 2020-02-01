const shellExec = require('shell-exec')

const getTemp = () => shellExec('python3 ./temp-hdc1080/testHDC1080.py')
	.then(e => e.stdout)
	.catch(console.log);

module.exports = getTemp;