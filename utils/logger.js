'use strict';

const winston = require('winston');
const split = require('split');
const fs = require('fs');
const path = require('path');
const dailyRotate = require('winston-daily-rotate-file');

const logDirectory = path.join(__dirname, '../log');
const tsFormat = () => (new Date()).toString();

// Create log directory if it doesn't exist
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory); //jshint ignore:line

const logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({
			level: 'debug',
			json: false,
			colorize: true,
			formatter: function (options) {
				return `${options.level.toUpperCase()}: ${(options.message ? options.message : '')}`;
			}
		}),
		new (dailyRotate)({
			level: 'debug',
			filename: `${logDirectory}/-results.log`,
			datePattern: 'yyyy-MM-dd',
			prepend: true,
			json: false,
			timestamp: tsFormat,
			formatter: function (options) {
				return `${options.level.toUpperCase()}: ${options.timestamp()} - ${(options.message ? options.message : '')}`;
			}
		})
	]
});

// Production instance sends all messages to logs - otherwise direct output to console
process.env.NODE_ENV == 'production' ? logger.remove(winston.transports.Console) : logger.remove(dailyRotate); //jshint ignore:line

module.exports = logger;
module.exports.stream = split().on('data', function (message) {
  logger.info(message);
});