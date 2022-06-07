'use strict';

const EventEmitter = require('events');
const event = new EventEmitter();
const { red, green, yellow, white } = require('colors/safe');
const timers = process.argv.slice(2);
// const timers = ['20-06-6-2022'];

function handleInput(timers) {
    let message = '';
    let errCount = 0;

    return Object.assign(timers.map( (timer) => {
        const parsedTimer = timer.split(new RegExp('[-\.\/]', 'g'));

        const isNumbers = parsedTimer.every((timer) => isFinite(Number(timer)));

        if (!isNumbers || parsedTimer.length !== 4) {
            ++errCount;
            return {
            message: red(` The date must be valid   ${white('|')}
            ${white('|')}    and in the format      ${white('|')}
            ${white('|')}     "HH-dd-mm-YYYY".    `),
                status: 'error'
            };
        }

        const timerDate = new Date(
            Date.UTC(parsedTimer[3], parsedTimer[2] - 1, parsedTimer[1], parsedTimer[0])
        );

        let currentDate = new Date();

        currentDate = Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            currentDate.getHours(),
            currentDate.getMinutes(),
            currentDate.getSeconds()
        );

        const diffTimestamp = timerDate - currentDate;

        if (diffTimestamp <= 0) {
            ++errCount;
            return {
                message: red(`The timer execution time  ${white('|')}
            ${white('|')}    must be greater than   ${white('|')}
            ${white('|')}     the current one.    `),
                status: 'error'
            };
        }

        const formattedDate = timerDate
            .toISOString()
            .replace("T", " ")
            .replace("Z", "")
            .replace(".000", "");

        return { formattedDate, diffTimestamp, status: 'run' };

    }), {errorCount: errCount});
}

function getDateUntil(diff) {
    let seconds = Math.floor(diff / 1000),
        minutes = Math.floor(seconds / 60),
        hours   = Math.floor(minutes / 60),
        days    = Math.floor(hours / 24),
        months  = Math.floor(days / 30),
        years   = Math.floor(days / 365);

    return {
        seconds: seconds % 60,
        minutes: minutes % 60,
        hours: hours % 24,
        days: days % 30,
        months: months % 12,
        years: years
    }
}

function renderTimers(timers) {
    return timers.map( (timer, index) => {
        if (timer.status === 'error') {
            return `             ------${red(`timer-${index + 1}`)}-------------- 
            | ${timer.message}  |
             ---------------------------  \n`;
        }

        if (timer.status === 'done') {
            return `             ------${green(`timer-${index + 1}`)}-------------- 
            | ${timer.message}  |
             ---------------------------  \n`;
        }

        let {seconds, minutes, hours, days, months, years} = getDateUntil(timer.diffTimestamp);

        days = days.toString().length > 1 ? `  ${days}   |` : `  ${days}    |`;
        months = months.toString().length > 1 ? `    ${months}   |` : `    ${months}    |`;
        years = years.toString().length > 1 ? `   ${years} ` : `    ${years} `;
        hours = hours.toString().length > 1 ? `  ${hours}   |` : `   ${hours}   |`;
        minutes = minutes.toString().length > 1 ? `    ${minutes}   |` : `    ${minutes}    |`;
        seconds = seconds.toString().length > 1 ? `   ${seconds} ` : `   ${seconds}  `;

        return `             ------${yellow(`timer-${index + 1}`)}--------------  
            | Days  |  Months |  Years  | 
            |${days}${months}${years}   | 
            |___________________________| 
            | Hours | Minutes | Seconds | 
            |${hours}${minutes}${seconds}   | 
             ---------------------------  \n`;
    }).join('');
}

function setTimer(timers) {
    setInterval(() => {
        console.clear();

        timers.forEach( (timer) => {
            timer.diffTimestamp -= 1000;

            if (!timer.diffTimestamp && timer.status !== 'error' ) {
                timer.status = 'done';
                timer.message = green(` [ ${timer.formattedDate} ]  ${white('|')}
            ${white('|')}    Timer is finished!   `);
            }
        });

        event.emit('timer', renderTimers(timers));

        if (timers.errorCount === timers.length) throw new Error(red('You have not passed any valid timers.'));
    }, 1000);
}

setTimer(handleInput(timers));

event.on('timer', console.log);