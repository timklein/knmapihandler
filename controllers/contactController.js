'use strict';

const request = require('request');

const logger = require('../utils/logger.js');

const configVars = require('../config/configVars.json');
const accounts = require('../config/accounts.json');

let apiURL = "";

const contactController = {

	// Retrieve contact information for the incoming request and add it to req.body
	retrieveForReferral	: function (req,res, next) {

		// Build API URL path for the record query
		apiURL = "https://" + configVars.masterAcct + ".infusionsoft.com/api/xmlrpc";

		// Confirm the incoming request has the assigned access key
		if (req.body.accessKey == configVars.accessKey) {
		
			// Get the Infusionsoft API access key associated with the account this request is coming from
			let keyBuild = accounts[configVars.masterAcct].key;

			// Populate the variables into the API submission string
			let searchBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>ContactService.load</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><int>' + req.body.contactId + '</int></value></param><param><value><array><data><value><string>FirstName</string></value><value><string>LastName</string></value><value><string>Email</string></value><value><string>Phone1</string></value><value><string>Phone2</string></value><value><string>StreetAddress1</string></value><value><string>City</string></value><value><string>State</string></value><value><string>PostalCode</string></value><value><string>Country</string></value></data></array></value></param></params></methodCall>';

			// Send the request to the Infussionsoft API
			request ({
				method	: 'POST',
				url		: apiURL,
				headers	: {'Content-Type' : 'application/xml'},
				body	: searchBody
			}, function (err, resp, body) {

				logger.verbose('API Load Contact Response Body: ' + body);

				if (err) {
					res.sendStatus(200);
					return logger.error('Request to API not sent: ', err);
				}
				else if (body.includes('faultCode')) {
					logger.error('Contact Info Not Retrieved');
					res.sendStatus(200);
				}
				else {

					let parsedBody = body.split('<name>');

					for (var i = parsedBody.length - 1; i > 0; i--) {
						
						let fieldName = parsedBody[i].split('</name><value>')[0];
						let fieldValue = parsedBody[i].split('</name><value>')[1].split('</value>')[0];

						switch (fieldName) {
							case 'FirstName' :
								req.body.FirstName = fieldValue;
								break;
							case 'LastName' :
								req.body.LastName = fieldValue;
								break;
							case 'Email' :
								req.body.Email = fieldValue;
								break;
							case 'Phone1' :
								req.body.Phone1 = fieldValue;
								break;
							case 'Phone2' :
								req.body.Phone2 = fieldValue;
								break;
							case 'StreetAddress1' :
								req.body.StreetAddress1 = fieldValue;
								break;
							case 'City' :
								req.body.City = fieldValue;
								break;
							case 'State' :
								req.body.State = fieldValue;
								break;
							case 'PostalCode' :
								req.body.PostalCode = fieldValue;
								break;
							case 'Country' :
								req.body.Country = fieldValue;
								break;
						}
					}
				logger.info('Contact Info Retrieved and Request Body Built');
				next();
				}
			});
		}
		else {
			logger.warn('POST Request Declined from IP: ' + req.ip);
			res.sendStatus(401);
		}
	},
	createContact	: function (req, res, next) {

		// Build API URL path for the record query
		apiURL = "https://" + req.body.toAccount + ".infusionsoft.com/api/xmlrpc/";

		let FirstName		= req.body.FirstName || "";
		let LastName 		= req.body.LastName || ""; 
		let Email			= req.body.Email || ""; 
		let Phone1 			= req.body.Phone1 || ""; 
		let Phone2 			= req.body.Phone2 || ""; 
		let StreetAddress1	= req.body.StreetAddress1 || ""; 
		let City 			= req.body.City || ""; 
		let State 			= req.body.State || ""; 
		let PostalCode 		= req.body.PostalCode || ""; 
		let Country			= req.body.Country || "";
		let customField1	= accounts[req.body.toAccount].customField1;
		let customValue1	= req.body.contactId; 

		// Get the Infusionsoft API access key associated with the account this request is coming from
		let keyBuild = accounts[req.body.toAccount].key;

		// Populate the variables into the API submission string
		let submissionBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>ContactService.addWithDupCheck</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><struct><member><name>FirstName</name><value><string>' + FirstName + '</string></value></member><member><name>LastName</name><value><string>' + LastName + '</string></value></member><member><name>Email</name><value><string>' + Email + '</string></value></member><member><name>Phone1</name><value><string>' + Phone1 + '</string></value></member><member><name>Phone2</name><value><string>' + Phone2 + '</string></value></member><member><name>StreetAddress1</name><value><string>' + StreetAddress1 + '</string></value></member><member><name>City</name><value><string>' + City + '</string></value></member><member><name>State</name><value><string>' + State + '</string></value></member><member><name>PostalCode</name><value><string>' + PostalCode + '</string></value></member><member><name>Country</name><value><string>' + Country + '</string></value></member><member><name>' + customField1 + '</name><value><string>' + customValue1 + '</string></value></member></struct></value></param><param><value><string>Email</string></value></param></params></methodCall>';

		// Send the request to the Infusionsoft API
		request ({
			method	: 'POST',
			url		: apiURL,
			headers	: {'Content-Type' : 'application/xml'},
			body	: submissionBody
		}, function (err, resp, body) {

			logger.verbose('API Add Contact with Dup Check Response Body: ' + body);

			if (err) {
				res.sendStatus(200);
				return logger.error('Request to API not sent: ', err);
			}
			else if (body.includes('faultCode')) {
				logger.error('Database Error - Contact Record Not Loaded');
				res.sendStatus(200);
			}
			else {

				let newId = body.split('<value><i4>')[1].split('</i4></value>')[0];
				req.body.newContactId = newId;
				logger.info('Contact Record ' + newId + ' Created/Updated');
				next();
			}
		});
	}
};

module.exports = contactController;