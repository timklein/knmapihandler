'use strict';

const request = require('request');

const logger = require('../utils/logger.js');

const configVars = require('../config/configVars.json');
const accounts = require('../config/accounts.json');

let apiURL = "";

const tagController = {

	referralTagId 	: function (req, res, next) {

		// Build API URL path for the record query
		apiURL = "https://" + req.body.toAccount + ".infusionsoft.com/api/xmlrpc/";

		// Get the Infusionsoft API access key associated with the account this request is coming from
		let keyBuild = accounts[req.body.toAccount].key;

		let findTag = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>DataService.query</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><string>ContactGroup</string></value></param><param><value><int>5</int></value></param><param><value><int>0</int></value></param><param><value><struct><member><name>GroupName</name><value><string>' + configVars.referTagName + '</string></value></member></struct></value></param><param><value><array><data><value><string>GroupName</string></value><value><string>Id</string></value></data></array></value></param><param><value><string>GroupName</string></value></param><param><value><boolean>1</boolean></value></param></params></methodCall>';

		request ({
			method	: 'POST',
			url		: apiURL,
			headers	: {'Content-Type' : 'application/xml'},
			body	: findTag
		}, function (err, resp, body) {

			logger.verbose('API Tag Identification Response Body: ' + body);

			if (err) {
				res.sendStatus(200);
				return logger.error('Request to API not sent: ', err);
			}
			else if (body.includes('faultCode')) {
				logger.error('Tag ID Not Retrieved');
				res.sendStatus(200);
			}
			else {
				
				let parsedBody = body.split('<value><i4>')[1].split('</i4></value>')[0];
				req.body.tagId = parsedBody;
				logger.info('Tag Info Retrieved and Added to Request Body');
				next();
			}
		});
	},
	applyReferralTag 	: function (req, res) {

		// Build API URL path for the record query
		apiURL = "https://" + req.body.toAccount + ".infusionsoft.com/api/xmlrpc/";

		// Get the Infusionsoft API access key associated with the account this request is coming from
		let keyBuild = accounts[req.body.toAccount].key;

		// Populate the variables into the API submission string
		let updateBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>ContactService.addToGroup</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><int>' + req.body.newContactId + '</int></value></param><param><value><int>' + req.body.tagId + '</int></value></param></params></methodCall>';
		
		// Send the request to the Infussionsoft API
		request ({
			method	: 'POST',
			url		: apiURL,
			headers	: {'Content-Type' : 'application/xml'},
			body	: updateBody
		}, function (err, resp, body) {

			logger.verbose('API Apply Tag Response Body: ' + body);

			if (err) {
				res.sendStatus(200);
				return logger.error('Request to API not sent: ', err);
			}
			else if (body.includes('faultCode')) {
				logger.error('Tag Not Applied to ' + req.body.newContactId);
				res.sendStatus(200);
			}
			else {

				body.includes('<boolean>1') ? logger.info('Tag ID ' + req.body.tagId + ' applied to contact ' + req.body.newContactId) : logger.info('Tag ID ' + req.body.tagId + ' already exists on contact ' + req.body.newContactId); //jshint ignore:line
				res.sendStatus(200);
			}
		});
	}
};

module.exports = tagController;