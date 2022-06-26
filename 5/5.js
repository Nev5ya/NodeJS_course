#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { Transform } = require('stream');

const ALLOWED_METHODS = ['GET'];

const INDEX_FILE = fs.createReadStream(path.join(__dirname, 'index.html'));

http.createServer((request, response) => {
    if (!ALLOWED_METHODS.includes(request.method)) {
        response.writeHead(405).end();
    }

    if (request.url === '/favicon.ico') return response.statusCode = 204;

    response.writeHead(200, {'Content-Type' : 'text/html'});

    fileManager(request.url).pipe(response);

}).listen(8000);

const isFile = (entity) => {
    try {
        return fs.lstatSync(entity).isFile();
    } catch (e) {
        fs.writeFileSync(path.join(__dirname, 'errors.txt'), e.toString());
    }
}

function getFormattedFsList(list) {
    const diskExcluded = process.cwd().slice(2);
    const parentDir = diskExcluded.split('\\').slice(0, -1).join('/');

    return [`<ul><li><a href='${ parentDir }'>🔙</a></li>`].concat(list.map(i => {
        const pathToFile = path.join(diskExcluded, i);
        return isFile(i) ?
            `<li><a href="${ pathToFile }">${i}</a></li>` :
            `<li style="list-item_dir"><a href="${ pathToFile }">${i}</a></li>`;
    }), ['</ul>']).join('');
}

function fileManager(queryPath) {

    if (isFile(queryPath)) {
        const selectedFile = fs.readFileSync(queryPath).toString();

        return INDEX_FILE.pipe(renderEntity(queryPath, selectedFile));
    }

    process.chdir(queryPath);

    const entitiesList = getFormattedFsList(
        fs.readdirSync(queryPath)
    );

    return INDEX_FILE.pipe(renderEntity(queryPath, entitiesList));
}

function renderEntity(path, string) {
    return new Transform({
        transform(chunk, encoding, callback) {
            callback(null,
                chunk
                    .toString()
                    .replace('{{ $path }}', path)
                    .replace('{{ $renderHere }}', string)
            );
        }
    });
}