'use strict';

const request = require('request');

const logger = require('../utils/logger.js');

const configVars = require('../config/configVars.json');
const accounts = require('../config/accounts.json');

let apiURL = "";

const queryController = {

	findContactByEamil : function (req, res, next) {

		if (req.body.toId) {
			next();
		}
		else {

			logger.info('Master Contact ID not on original record! Attempting to match by email...');

			// Build API URL path for the record query
			apiURL = "https://" + configVars.masterAcct + ".infusionsoft.com/api/xmlrpc/";

			// Get the Infusionsoft API access key associated with the account this request is coming from
			let keyBuild = accounts[configVars.masterAcct].key;

			let queryBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>ContactService.findByEmail</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><string>' + req.body.email + '</string></value></param><param><value><array><data><value><string>Id</string></value></data></array></value></param></params></methodCall>';

			request ({
					method	: 'POST',
					url		: apiURL,
					headers	: {'Content-Type' : 'application/xml'},
					body	: queryBody
				}, function (err, resp, body) {

					if (body.includes('<array><data/></array>')) {

						logger.error('Unable to match email address ' + req.body.email + ' - Record Update Not Completed!');

						res.sendStatus(200);
					}
					else {

						let fieldValue = body.split('<value><i4>')[1].split('</i4></value>')[0];

						req.body.toId = fieldValue;

						logger.info('Contact ID Added to Request Body');

						next();					
					}
				}
			);
		}
	}
};

module.exports = queryController;