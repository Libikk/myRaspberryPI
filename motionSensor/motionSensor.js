const shellExec = require('shell-exec')
let songNames = [];
const fs = require('fs');

fs.readdir(`${__dirname}/songs/`, (err, files) => (songNames = files));

const getRandomNum = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


let isPlaying = false;
let isMotion = false


const playMusicOnMotion = (value) => {
    isMotion = value === 'ON'

    if (isMotion && !isPlaying) {
        isPlaying = true;

        const randomSong = songNames[getRandomNum(0, songNames.length)]
        // const command = `omxplayer ${__dirname}/Akademia-pana-Kleksa-Kleksografia-edited.mp3 -o alsa:hw:1,0`;
        const command = `omxplayer ${__dirname}/songs/${randomSong} -o alsa:hw:1,0`;

        shellExec(command)
            .then(() => {
                console.log('TRIGGERED', new Date());
                console.log('________________________');
                isPlaying = false;
            })
            .catch(console.log)
    }

}




module.exports = { playMusicOnMotion }