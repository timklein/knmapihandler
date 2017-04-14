'use strict';

const request = require('request');

const logger = require('../utils/logger.js');

const configVars = require('../config/configVars.json');
const accounts = require('../config/accounts.json');

let apiURL = "";

const formController = {

	retrieveFormData	: function (req, res, next) {

		// Confirm the incoming request has the assigned access key
		if (req.body.accessKey == configVars.accessKey) {

			// Build API URL path for the record query
			apiURL = "https://" + req.body.fromAccount + ".infusionsoft.com/api/xmlrpc/";

			// Get the Infusionsoft API access key associated with the account this request is coming from
			let keyBuild = accounts[req.body.fromAccount].key;

			// Retrieve Contact.Id for master account from this account's custom field
			let toId = accounts[req.body.fromAccount].customField1;

			// Populate the variables into the API submission string
			let retrieveBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>DataService.query</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><string>Contact</string></value></param><param><value><int>5</int></value></param><param><value><int>0</int></value></param><param><value><struct><member><name>Id</name><value><string>' + req.body.contactId + '</string></value></member></struct></value></param><param><value><array><data><value><string>' + toId + '</string></value><value><string>Email</string></value><value><string>_WhatTypeofProcedureWasThis</string></value><value><string>_LotNumber</string></value><value><string>_PackNumber</string></value><value><string>_NucleatedCellCount</string></value><value><string>_PercentCellViability</string></value><value><string>_HowWereCellsCounted</string></value><value><string>_ProcedureDate</string></value></data></array></value></param><param><value><string>Id</string></value></param><param><value><boolean>0</boolean></value></param></params></methodCall>';

			// Send the request to the Infussionsoft API
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
								req.body.email = fieldValue;
								break;
							case '_HowWereCellsCounted' :
								req.body.how = fieldValue;
								break;
							case '_WhatTypeofProcedureWasThis' :
								req.body.type = fieldValue;
								break;
							case '_LotNumber' :
								req.body.lot = fieldValue;
								break;
							case '_PackNumber' :
								req.body.pack = fieldValue;
								break;
							case '_NucleatedCellCount' :
								req.body.count = fieldValue;
								break;
							case '_PercentCellViability' :
								req.body.viability = fieldValue;
								break;
							case '_ProcedureDate' :
								req.body.date = fieldValue;
								break;
							case toId :
								req.body.toId = fieldValue;
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

		// Build API URL path for the record update
		apiURL = "https://" + configVars.masterAcct + ".infusionsoft.com/api/xmlrpc/";

		// Get the Infusionsoft API access key associated with the update account
		let keyBuild = accounts[configVars.masterAcct].key;

		let toId		= req.body.toId || "";
		let lot 		= req.body.lot || ""; 
		let email		= req.body.email || ""; 
		let pack 		= req.body.pack || ""; 
		let count 		= req.body.count || ""; 
		let how 		= req.body.how || ""; 
		let type 		= req.body.type || ""; 
		let viability 	= req.body.viability || ""; 
		let date 		= req.body.date || "";

		// Populate the variables into the API submission string
		let updateBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>ContactService.update</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><int>' + toId + '</int></value></param><param><value><struct><member><name>_ProcedureType</name><value><string>' + type + '</string></value></member><member><name>_HowWereCellsCounted</name><value><string>' + how + '</string></value></member><member><name>Email</name><value><string>' + email + '</string></value></member><member><name>_LotNumber</name><value>' + lot + '</value></member><member><name>_PackNumber</name><value>' + pack + '</value></member><member><name>_NucleatedCellCount</name><value>' + count + '</value></member><member><name>_PercentCellViability</name><value>' + viability + '</value></member><member><name>_ProcedureDate</name><value>' + date + '</value></member></struct></value></param></params></methodCall>';

		// Send the request to the Infussionsoft API
		request ({
				method	: 'POST',
				url		: apiURL,
				headers	: {'Content-Type' : 'application/xml'},
				body	: updateBody
			}, function (err, resp, body) {

				logger.verbose('API Contact Procedure Form Update Body: ' + body);

				if (err) {
					res.sendStatus(200);
					return logger.error('Request to API not sent: ', err);
				}
				else if (body.includes('faultCode')) {
					logger.error('Update for Contact ' + toId + ' Not Processed');
					res.sendStatus(200);
				}
				else {

					body.includes('<i4>' + toId) ? logger.info('Contact Record ' + toId + ' Updated') : logger.error('Unknown Response'); //jshint ignore:line
					res.sendStatus(200);
				}
			}
		);
	}
};

module.exports = formController;