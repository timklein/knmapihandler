# KNM API Documentation
Documentation for the KNM Infusionsoft API handler.

## Installation
Clone repository to the desired server location. `cd` into the installation directory and run `npm install`

Remove `.sample` extension from both `config/configVars.json.sample` and `config/accounts.json.sample` and replace the descriptions with valid configuration values. Addtional accounts can be added to the `accounts.json` file as needed.

## Create a New Contact Record on Referral
### Sending Account (from) Side
1. http POST (required)
    * `contactId` = Infusionsoft Merge Field Code `~Contact.Id~`
    * `accessKey` = Access Key for KNM API Server. Must match key in `config/configVars.json`
    * `toLocation` = Infusionsoft account name for the account where this record will be created. The value of the incoming account name must match the `name` value in `config/accounts.json` exactly.

### Receiving Account (to) Side
1. Receiving account must have a custom field created to accept the sending account's Contact ID number. This allows for simplified record updating later in the case that any information on either contact record changes.
2. Record the field name for this custom field in the `config/accounts.json` file as the value for the `customField1` key, ensuring an underscore character (`_`) is added to the beginning of the field name.
3. Receiving account must have a tag to apply with a unique name that is loaded as the value for the `referTagName` key in `config/configVars.json`

## Update Stage Moves in Master Account
### Sending (Affiliate) Account Side
1. http POST (required)
* `contactId` = Infusionsoft Merge Field Code for the custom field created to hold the master Contact ID number. The value should look like `~Contact.[FieldName]~` where FieldName matches the `customField1` key in `config/accounts.json`
* `accessKey` = Access Key for KNM API Server. Must match key in `config/configVars.json`
* `toStage` = Signifier for which stage the record is moving to. Valid values are `booked`, `complete`, `not_interested` or `in_progress`.

### Receiving (Master) Account Side
No additional setup required.

## Update Processed Form Values in Master Account
### Sending (Affiliate) Account Side
1. http POST (required)
* `contactId` = Infusionsoft Merge Field Code `~Contact.Id~`
* `accessKey` = Access Key for KNM API Server. Must match key in `config/configVars.json`
* `fromAccount` = Infusionsoft account identifier for the account where this record is coming from (i.e. `op132`, `ag362`)

### Receiving (Master) Account Side
No additional setup required.

## Current Status
* Production Monitoring through Loggly

## ToDo
* ~~Web Front End for Admin and Error Log Review~~
* ~~Error Logging~~
* ~~Contact Lookup if Master ContactId Doesn't Exist~~
