'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const contactController = require('./controllers/contactController.js');
const tagController = require('./controllers/tagController.js');
const queryController = require('./controllers/queryController.js');

const app = express();

app.use(bodyParser.urlencoded({ extended:false }));

// Create Contact Route - Find source data, create contact record in referral account, find & apply referral tag to new record
app.post('/incoming/cc', queryController.retrieveForReferral, contactController.createContact, queryController.referralTagId, tagController.applyReferralTag);

// Stage Move Route -
app.post('/incoming/sm', queryController.opportunityId);

const port = 3000;
const server = app.listen(port, function() {
	console.log('Express server listening on port ' + server.address().port);
});