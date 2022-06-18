#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { stripColors, bgMagenta, green, red, yellow } = require('colors/safe');
const { Transform } = require('stream');

const isFile = (entity) => {
    try {
        return fs.lstatSync(entity).isFile()
    } catch (e) {
        console.log(e);
    }
}

function filePathValidator(input) {
    return fs.existsSync(input)
        || 'File path is not exists.';
}

async function shouldUseFileManager() {
    return await inquirer.prompt([
        {
            name: 'fileManager',
            type: 'confirm',
            message: 'Do you want to use File Manager?',
            default: true
        }
    ]);
}

function getFsTransformedEntitiesList(list) {
    return ['..'].concat(list.map(i => {
        return isFile(i) ? i : bgMagenta(i);
    }));
}

async function fileManager(dir = __dirname) {
    process.chdir(dir);
    console.clear();

    let list = fs.readdirSync(dir);

    const answer = await inquirer.prompt([
        {
            name: 'entityName',
            type: 'list',
            pageSize: 15,
            message: 'Path: ' + dir + '\nChoose file:',
            loop: false,
            choices: getFsTransformedEntitiesList(list)
        },
    ]);

    answer.entityName = stripColors(answer.entityName);

    const newFilePath = path.join(dir, answer.entityName);

    if(!isFile(answer.entityName)) return fileManager(newFilePath);

    return newFilePath;
}

function findAndTransform(searchString) {
    const regExp = new RegExp('^.*' + searchString + '.*$', 'gmi');

    return new Transform({
        transform(chunk, encoding, callback) {
            callback(null, chunk.toString().replaceAll(regExp, green('$&')));
        }
    });
}

async function main() {
    const answer = await inquirer.prompt([
        {
            name: 'filePath',
            message: 'Enter the file path: '
        }
    ]);

    const validation = filePathValidator(answer.filePath);

    if (typeof validation === 'string') {
        console.error(red(validation));
        await shouldUseFileManager()
            .then(answer => {
                return answer.fileManager ? fileManager() : main();
            })
            .then(path => answer.filePath = path);
    }

    const searchAnswer = await inquirer.prompt([
        {
            name: 'searchString',
            message: 'Printing the entire file.\n' + 'Otherwise, enter the' + yellow(' search string: ')
        }
    ]);

    const readStream = fs.createReadStream(answer.filePath, 'utf8');

    if (!searchAnswer.searchString.length) return readStream.pipe(process.stdout);

    readStream.pipe(findAndTransform(searchAnswer.searchString)).pipe(process.stdout);
}

main();