'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const queryController = require('./controllers/queryController.js');
const contactController = require('./controllers/contactController.js');

const app = express();

app.use(bodyParser.urlencoded({ extended:false }));

// Create Contact Route - Find source data, create contact record in referral account, apply referral tag to new record
app.post('/incoming/cc', queryController.retrieveForReferral, contactController.createContact);

const port = 3000;
const server = app.listen(port, function() {
	console.log('Express server listening on port ' + server.address().port);
});