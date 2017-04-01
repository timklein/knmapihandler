'use strict';

const request = require('request');

const configVars = require('../config/configVars.json');
const accounts = require('../data/accounts.json');

let apiURL = ""
const blank = ""

const contactController = {

	createContact	: function (req, res) {

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
		let customField1	= configVars.customField1;
		let customValue1	= req.body.contactId; 

		// Get the Infusionsoft API access key associated with the account this request is coming from
		let keyBuild = accounts[req.body.toAccount].key;

		// Populate the variables into the API submission string
		let submissionBody = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>ContactService.addWithDupCheck</methodName><params><param><value><string>' + keyBuild + '</string></value></param><param><value><struct><member><name>FirstName</name><value><string>' + FirstName + '</string></value></member><member><name>LastName</name><value><string>' + LastName + '</string></value></member><member><name>Email</name><value><string>' + Email + '</string></value></member><member><name>Phone1</name><value><string>' + Phone1 + '</string></value></member><member><name>Phone2</name><value><string>' + Phone2 + '</string></value></member><member><name>StreetAddress1</name><value><string>' + StreetAddress1 + '</string></value></member><member><name>City</name><value><string>' + City + '</string></value></member><member><name>State</name><value><string>' + State + '</string></value></member><member><name>PostalCode</name><value><string>' + PostalCode + '</string></value></member><member><name>Country</name><value><string>' + Country + '</string></value></member><member><name>' + customField1 + '</name><value><string>' + customValue1 + '</string></value></member></struct></value></param><param><value><string>Email</string></value></param></params></methodCall>'

		// Send the request to the Infussionsoft API
		request ({
			method	: 'POST',
			url		: apiURL,
			headers	: {'Content-Type' : 'application/xml'},
			body	: submissionBody
		}, function (err, resp, body) {

			if (err) {
				return console.log('Request to API not sent: ', err);
				res.sendStatus(200);
			}

			else {
				console.log(body);
			}
		});

		res.sendStatus(200);
	}
};

module.exports = contactController;