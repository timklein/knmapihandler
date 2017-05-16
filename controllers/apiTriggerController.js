'use strict';

const request = require('request');

const logger = require('../utils/logger.js');

const configVars = require('../config/configVars.json');
const accounts = require('../config/accounts.json');

let apiURL = "";

const apiTriggerController = {

	trigger	: function (req, res) {

		// Build API URL path for the API trigger action
		apiURL = "https://" + req.body.integration + ".infusionsoft.com/api/xmlrpc/";

		// Get the Infusionsoft API access key associated with the account this request is directed to
		let keyBuild = accounts[req.body.integration].key;

		// Populate the variables into the API submission string
		let submissionBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>FunnelService.achieveGoal</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><string>' + req.body.integration + '</string></value></param><param><value><string>' + req.body.callName + '</string></value></param><param><value><int>' + req.body.contactId + '</int></value></param></params></methodCall>';

		// Send the request to the Infusionsoft API
		request ({
			method	: 'POST',
			url		: apiURL,
			headers	: {'Content-Type' : 'application/xml'},
			body	: submissionBody
		}, function (err, resp, body) {

			logger.verbose('API Trigger Response Body: ' + body);

			if (err) {
				res.sendStatus(200);
				return logger.error('Request to API not sent: ', err);
			}
			else if (body.includes('faultCode')) {
				logger.error('API Error - API Trigger Not Processed');
				res.sendStatus(200);
			}
			else if (body.includes('<boolean>1</boolean>')) {
				logger.info('API Trigger Processed for callName: ' + req.body.callName + ', in application: ' + req.body.integration);
				res.sendStatus(200);
			}
			else {
				logger.warn('Unknown Outcome Processing API Trigger for callName: ' + req.body.callName + ', in application: ' + req.body.integration);
				res.sendStatus(200);
			}
		});
	}
};

module.exports = apiTriggerController;