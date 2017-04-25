'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const logger = require('./utils/logger.js');

const contact = require('./controllers/contactController.js');
const tag = require('./controllers/tagController.js');
const stage = require('./controllers/stageController.js');
const form = require('./controllers/formController.js');
const query = require('./controllers/queryController.js');
const notes = require('./controllers/notesController.js');

const app = express();

app.set('trust proxy', 'loopback');

app.use(bodyParser.urlencoded({ extended:false }));
app.use(morgan(':remote-addr [:date[clf]] ":method :url" status :status :res[content-length] bytes :response-time[2] ms', {"stream": logger.stream}));

// Create Contact Route - Find source data, create contact record in referral account, find & apply referral tag to new record
app.post('/incoming/cc', contact.retrieveForReferral, contact.createContact, notes.retrieveNotes, notes.appendNotes, tag.referralTagId, tag.applyReferralTag);

// Stage Move Route - Locate Opportunity record in master account, update stage
app.post('/incoming/sm', stage.opportunityId, stage.updateStage);

// Form Processing Route - Retrieve custom form fields from source contact record, update master contact record
app.post('/incoming/fp', form.retrieveFormData, query.findContactByEamil, form.updateMaster);

const port = 3000;
const server = app.listen(port, function() {
	logger.info('Express server listening on port ' + server.address().port);
});