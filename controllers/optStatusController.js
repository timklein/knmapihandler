'use strict';

const request = require('request');

const logger = require('../utils/logger.js');

const accounts = require('../config/accounts.json');

let apiURL = "";

const optStatusController = {

	optin	: function (req, res, next) {

		// Build API URL path for the record query
		apiURL = "https://" + req.body.toAccount + ".infusionsoft.com/api/xmlrpc/";

		// Get the Infusionsoft API access key associated with the account this request is coming from
		let keyBuild = accounts[req.body.toAccount].key;

		// Populate the variables into the API submission string
		let submissionBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>APIEmailService.optIn</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><string>' + req.body.Email + '</string></value></param><param><value><string>API Opt In</string></value></param></params></methodCall>';

		// Send the request to the Infusionsoft API
		request ({
			method	: 'POST',
			url		: apiURL,
			headers	: {'Content-Type' : 'application/xml'},
			body	: submissionBody
		}, function (err, resp, body) {

			logger.verbose(req.body.toAccount + ': API Opt In Email Address Response Body: ' + body);

			if (err) {
				res.sendStatus(200);
				return logger.error('Request to API not sent: ', err);
			}
			else if (body.includes('faultCode')) {
				logger.error('API Error - Opt In Update Not Processed for Email ' + req.body.Email + ' in Application ' + req.body.toAccount);
				next();
			}
			else if (body.includes('<boolean>0</boolean>')) {
				logger.info('Opt In of Email ' + req.body.Email + ' Not Processed');
				next();
			}
			else if (body.includes('<boolean>1</boolean>')) {
				logger.info('Opt In of Email ' + req.body.Email + ' Processed');
				next();
			}
			else {
				logger.warn('Unknown Outcome Processing Opt In for ' + req.body.Email);
			}
		});
	}
};

module.exports = optStatusController;