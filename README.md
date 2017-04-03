# KNM API Documentation
Documentation for the KNM Infusionsoft API handler.

## Installation
Clone repository to the desired server location. `cd` into the installation directory and run `npm install`

Remove `.sample` extension from both `config/configVars.json.sample` and `config/accounts.json.sample` and replace the descriptions with valid configuration values. Addtional accounts can be added to the `accounts.json` file as needed.

## Create a New Contact Record on Referral
### Sending Account (from) Side
1. http POST (required)
  * contactId = Infusionsoft Merge Field Code ~Contact.Id~
  * accessKey = Access Key for KNM API Server. Must match key in `config/configVars.json`
  * toAccount = Infusionsoft account identifier for the account where this record will be created (i.e. op132, ag362)

### Receiving Account (to) Side
1. Receiving account must have a custom field created to accept the sending account's Contact ID number. This allows for simplified record updating later in the case that any information on either contact record changes.
2. Record the field name for this custom field in the `data/accounts.json` file as the value for the `customField1` key.
3. Receiving account must have a tag to apply with a unique name that is loaded as the value for the `referTagName` key in `config.configVars.json` 

## Current Status
* Development and Testing

## ToDo
* Error Logging
* Web Front End for Admin and Error Log Review
