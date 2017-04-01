'use strict';

const request = require('request');

const configVars = require('../config/configVars.json');
const accounts = require('../data/accounts.json');

let apiURL = ""

const apiController = {

	// Retrieve contact information for the incoming request and add it to req.body
	retrieveForReferral	: function (req,res, next) {

		// Build API URL path for the record query
		apiURL = "https://" + configVars.sourceAcct + ".infusionsoft.com/api/xmlrpc/"

		// Confirm the incoming request has the assigned access key
		if (req.body.accessKey == configVars.accessKey) {
		
			// Get the Infusionsoft API access key associated with the account this request is coming from
			let keyBuild = accounts[configVars.sourceAcct].key;

			// Populate the variables into the API submission string
			let searchBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>ContactService.load</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><int>' + req.body.contactId + '</int></value></param><param><value><array><data><value><string>FirstName</string></value><value><string>LastName</string></value><value><string>Email</string></value><value><string>Phone1</string></value><value><string>Phone2</string></value><value><string>StreetAddress1</string></value><value><string>City</string></value><value><string>State</string></value><value><string>PostalCode</string></value><value><string>Country</string></value></data></array></value></param></params></methodCall>'

			// Send the request to the Infussionsoft API
			request ({
				method	: 'POST',
				url		: apiURL,
				headers	: {'Content-Type' : 'application/xml'},
				body	: searchBody
			}, function (err, resp, body) {
				
				if (err) {
					return console.log('Request to API not sent: ', err);
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
				}

				next();
			});
		}
		else {
			console.log('POST Request Declined from IP: ' + req.ip);
			res.sendStatus(401);
		}
	}
};

module.exports = apiController;