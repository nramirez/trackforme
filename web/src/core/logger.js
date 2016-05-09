'use strict';

import winston from 'winston';
import fs from 'fs';
import { Papertrail } from 'winston-papertrail';
import { NODE_ENV } from '../../config';

const isProduction = NODE_ENV === 'production';
const logsDir = '../logs';
const today = new Date();
const fileName = `${today.getMonth()}_${today.getDay()}_${today.getFullYear()}.log`;

if (!fs.existsSync(logsDir)) {
    // Create the directory if it does not exist
    fs.mkdirSync(logsDir);
}

let loggerTransports = [
    new(winston.transports.File)({
        filename: `${logsDir}/${fileName}`
    })
];

if (isProduction) {
    loggerTransports.push(new winston.transports.Papertrail({
        host: 'logs4.papertrailapp.com',
        port: 41562
    }));
}

const logger = new winston.Logger({
    transports: loggerTransports
});

export default logger;
