'use strict';

const fs = require('fs');
const { Transform } = require('stream');
const { magenta} = require('colors/safe');
const cliProgress = require('cli-progress');
const IP_LIST = ['89.123.1.41', '34.48.240.111'];
const SOURCE_FILE = './access.log';

const readStream = fs.createReadStream(SOURCE_FILE, 'utf8');

const bar = new cliProgress.SingleBar({
    format: 'Progress |' + magenta('{bar}') + '| {percentage}% || {value}/{total} Bytes',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
}, cliProgress.Presets.shades_grey);

const fileStats = fs.statSync(SOURCE_FILE);
let fileSize = fileStats.size;
let currentSize = 0;

const startRenderBar = () => {
    bar.start(fileSize, 0, bar.eta);
}

const updateRenderBar = (chunk) => {
    bar.update(currentSize += chunk.length, bar.eta);
}

const endRenderBar = () => {
    bar.stop();
}

readStream
    .once('data', startRenderBar)
    .on('data', updateRenderBar)
    .on('end', endRenderBar);

const getOutputFileName = (ip) => `./${ip}_requests.log`;

IP_LIST.forEach( ip => {
    const regExp = new RegExp(`^${ip}.*$`, 'gm');
    const outputFileName = getOutputFileName(ip);

    const transformStream = new Transform({
        transform(chunk, _encoding, callback) {
            let transformedChunk = '';
            const searchArray = chunk.toString().match(regExp);
            if (searchArray) {
                transformedChunk = searchArray.join('\n') + '\n';
            }
            callback(null, transformedChunk);
        },
    });

    const writeStream = fs.createWriteStream(outputFileName, 'utf-8');

    readStream.pipe(transformStream).pipe(writeStream);
});