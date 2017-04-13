'use strict';

const request = require('request');

const logger = require('../utils/logger.js');

const configVars = require('../config/configVars.json');
const accounts = require('../data/accounts.json');

let apiURL = "";

const formController = {

	retrieveFormData	: function (req, res, next) {

		// Confirm the incoming request has the assigned access key
		if (req.body.accessKey == configVars.accessKey) {

			// Build API URL path for the record query
			apiURL = "https://" + req.body.fromAccount + ".infusionsoft.com/api/xmlrpc/";

			// Get the Infusionsoft API access key associated with the account this request is coming from
			let keyBuild = accounts[req.body.fromAccount].key;

			let retrieveBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>DataService.query</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><string>Contact</string></value></param><param><value><int>5</int></value></param><param><value><int>0</int></value></param><param><value><struct><member><name>Id</name><value><string>' + req.body.contactId + '</string></value></member></struct></value></param><param><value><array><data><value><string>Email</string></value><value><string>_WhatTypeofProcedureWasThis</string></value><value><string>_LotNumber</string></value><value><string>_PackNumber</string></value><value><string>_NucleatedCellCount</string></value><value><string>_PercentCellViability</string></value><value><string>_HowWereCellsCounted</string></value><value><string>_ProcedureDate</string></value></data></array></value></param><param><value><string>Id</string></value></param><param><value><boolean>0</boolean></value></param></params></methodCall>';

			request ({
				method	: 'POST',
				url		: apiURL,
				headers	: {'Content-Type' : 'application/xml'},
				body	: retrieveBody
			}, function (err, resp, body) {

				logger.verbose('API Retrieve Custom Form Fields Response Body: ' + body);

				if (err) {
					res.sendStatus(200);
					return logger.error('Request to API not sent: ', err);
				}
				else if (body.includes('faultCode')) {
					logger.error('Custom Fields for Contact ' + req.body.contactId + ' Not Retrieved');
					res.sendStatus(200);
				}
				else {

					let parsedBody = body.split('<name>');

					for (var i = parsedBody.length - 1; i > 0; i--) {
						
						let fieldName = parsedBody[i].split('</name><value>')[0];
						let fieldValue = parsedBody[i].split('</name><value>')[1].split('</value>')[0];

						switch (fieldName) {
							case 'Email' :
								req.body.Email = fieldValue;
								break;
							case '_HowWereCellsCounted' :
								req.body.How = fieldValue;
								break;
							case '_WhatTypeofProcedureWasThis' :
								req.body.Type = fieldValue;
								break;
							case '_LotNumber' :
								req.body.Lot = fieldValue;
								break;
							case '_PackNumber' :
								req.body.Pack = fieldValue;
								break;
							case '_NucleatedCellCount' :
								req.body.Count = fieldValue;
								break;
							case '_PercentCellViability' :
								req.body.Viability = fieldValue;
								break;
							case '_ProcedureDate' :
								req.body.Date = fieldValue;
								break;
						}
					}

					logger.info('Form Data Retrieved and Request Body Built');
					next();
				}
			});
		}
		else {

			logger.warn('POST Request Declined from IP: ' + req.ip);
			res.sendStatus(401);
		}
			
	},
	updateMaster	: function (req, res) {

		console.log(req.body);
		res.sendStatus(200);
	}
};

module.exports = formController;