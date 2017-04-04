'use strict';

const request = require('request');

const configVars = require('../config/configVars.json');
const accounts = require('../data/accounts.json');

let apiURL = "";

const stageController = {

	opportunityId	: function (req, res) {

		if (req.body.accessKey == configVars.accessKey) {

			// Build API URL path for the record query
			apiURL = "https://" + configVars.sourceAcct + ".infusionsoft.com/api/xmlrpc/";

			// Get the Infusionsoft API access key associated with the account this request is coming from
			let keyBuild = accounts[configVars.sourceAcct].key;

			let opportunityBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>DataService.query</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><string>Lead</string></value></param><param><value><int>5</int></value></param><param><value><int>0</int></value></param><param><value><struct><member><name>ContactID</name><value><string>' + req.body.contactId + '</string></value></member></struct></value></param><param><value><array><data><value><string>Id</string></value></data></array></value></param><param><value><string>ContactID</string></value></param><param><value><boolean>1</boolean></value></param></params></methodCall>';

			request ({
				method	: 'POST',
				url		: apiURL,
				headers	: {'Content-Type' : 'application/xml'},
				body	: opportunityBody
			}, function (err, resp, body) {

				if (err) {
					res.sendStatus(200);
					return console.log('Request to API not sent: ', err);
				}
				else {

					console.log(body);
					res.sendStatus(200);
				}
			});
		}
		else {

			console.log('POST Request Declined from IP: ' + req.ip);
			res.sendStatus(401);
		}
	}
};

module.exports = stageController;