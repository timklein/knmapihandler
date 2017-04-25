'use strict';

const request = require('request');

const logger = require('../utils/logger.js');

const configVars = require('../config/configVars.json');
const accounts = require('../config/accounts.json');

let apiURL = "";

const notesController = {

	retrieveNotes : function (req, res, next) {

		// Build API URL path for the record query
		apiURL = "https://" + req.body.toAccount + ".infusionsoft.com/api/xmlrpc";

		// Get the Infusionsoft API access key associated with this account
		let keyBuild = accounts[req.body.toAccount].key;

		let referralNotes = req.body.ContactNotes || "";

		let queryBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>ContactService.load</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><int>' + req.body.newContactId + '</int></value></param><param><value><array><data><value><string>ContactNotes</string></value></data></array></value></param></params></methodCall>';

		request ({
			method	: 'POST',
			url		: apiURL,
			headers	: {'Content-Type' : 'application/xml'},
			body	: queryBody
		}, function (err, resp, body) {

			logger.verbose('API Retrieve Existing Notes Response Body: ' + body);

			if (err) {
				res.sendStatus(200);
				return logger.error('Request to API not sent: ', err);
			}
			else if (body.includes('faultCode')) {
				logger.error('Database Error - Contact Notes Not Loaded');
				res.sendStatus(200);
			}
			else if (body.includes('<struct/>')) {
				logger.info('Contact Notes Field is Empty');
				req.body.ContactNotes = referralNotes;
				next();
			}
			else {

				let existingNotes = body.split('ContactNotes</name><value>')[1].split('</value>')[0];
				req.body.ContactNotes = existingNotes + '\n' + referralNotes;

				logger.info('Notes Built for Contact ' + (req.body.newContactId || ""));
				next();
			}
		});
	},
	appendNotes : 	function (req, res, next) {

		// Build API URL path for the record update
		apiURL = "https://" + req.body.toAccount + ".infusionsoft.com/api/xmlrpc";

		// Get the Infusionsoft API access key associated with this account
		let keyBuild = accounts[req.body.toAccount].key;

		let submissionBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>ContactService.update</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><int>' + req.body.newContactId + '</int></value></param><param><value><struct><member><name>ContactNotes</name><value><string>' + req.body.ContactNotes + '</string></value></member></struct></value></param></params></methodCall>';

		request ({
			method	: 'POST',
			url		: apiURL,
			headers	: {'Content-Type' : 'application/xml'},
			body	: submissionBody
		}, function (err, resp, body) {

			logger.verbose('API Update Notes Response Body: ' + body);

			if (err) {
				res.sendStatus(200);
				return logger.error('Request to API not sent: ', err);
			}
			else if (body.includes('faultCode')) {
				logger.error('Database Error - Notes Update Not Processed');
				res.sendStatus(200);
			}
			else if (body.includes('<value><i4>' + req.body.newContactId)) {
				logger.info('Notes Update Successful for Contact ' + req.body.newContactId);
				next();
			}
			else {

				logger.error('Unknown Outcome Updating ' + req.body.newContactId);
				next();
			}

		});
	}
};

module.exports = notesController;