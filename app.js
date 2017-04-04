'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const contactController = require('./controllers/contactController.js');
const tagController = require('./controllers/tagController.js');
const stageController = require('./controllers/stageController.js');

const app = express();

app.use(bodyParser.urlencoded({ extended:false }));

// Create Contact Route - Find source data, create contact record in referral account, find & apply referral tag to new record
app.post('/incoming/cc', contactController.retrieveForReferral, contactController.createContact, tagController.referralTagId, tagController.applyReferralTag);

// Stage Move Route -
app.post('/incoming/sm', stageController.opportunityId, stageController.updateStage);

const port = 3000;
const server = app.listen(port, function() {
	console.log('Express server listening on port ' + server.address().port);
});