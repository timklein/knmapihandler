'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const logger = require('./utils/logger.js');

const contactController = require('./controllers/contactController.js');
const tagController = require('./controllers/tagController.js');
const stageController = require('./controllers/stageController.js');

const app = express();

app.set('trust proxy', 'loopback');

app.use(bodyParser.urlencoded({ extended:false }));
app.use(morgan(':remote-addr [:date[clf]] ":method :url" status :status :res[content-length] bytes :response-time[2] ms', {"stream": logger.stream}));

// Create Contact Route - Find source data, create contact record in referral account, find & apply referral tag to new record
app.post('/incoming/cc', contactController.retrieveForReferral, contactController.createContact, tagController.referralTagId, tagController.applyReferralTag);

// Stage Move Route -
app.post('/incoming/sm', stageController.opportunityId, stageController.updateStage);

const port = 3000;
const server = app.listen(port, function() {
	logger.info('Express server listening on port ' + server.address().port);
});