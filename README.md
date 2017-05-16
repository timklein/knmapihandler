# KNM API Documentation
Documentation for the KNM Infusionsoft API handler.

## Installation
Clone repository to the desired server location. `cd` into the installation directory and run `npm install`

Remove `.sample` extension from both `config/configVars.json.sample` and `config/accounts.json.sample` and replace the descriptions with valid configuration values. Addtional accounts can be added to the `accounts.json` file as needed.

## Create a New Contact Record on Referral
### Sending Account (from) Side
1. http POST (required) - To address must include the path `/incoming/cc`
    * `contactId` = Infusionsoft Merge Field Code `~Contact.Id~`
    * `accessKey` = Access Key for KNM API Server. Must match key in `config/configVars.json`
    * `toLocation` = Infusionsoft account name for the account where this record will be created. The value comes from a custom field that's on the master account's Referral Form. The value of the incoming account name must match one of the `referralId` array values in `config/accounts.json` exactly.

### Receiving Account (to) Side
1. Receiving account must have a custom field created to accept the sending account's Contact ID number. This allows for simplified record updating later in the case that any information on either contact record changes.
2. Record the field name for this custom field in the `config/accounts.json` file as the value for the `customField1` key, ensuring an underscore character (`_`) is added to the beginning of the field name.
3. Receiving account must have a tag to apply with a unique name that is loaded as the value for the `referTagName` key in `config/configVars.json`

## Update Stage Moves in Master Account
### Sending (Affiliate) Account Side
1. http POST (required) - To address must include the path `/incoming/sm`
* `contactId` = Infusionsoft Merge Field Code for the custom field created to hold the master Contact ID number. The value should look like `~Contact.[FieldName]~` where FieldName matches the `customField1` key in `config/accounts.json`
* `accessKey` = Access Key for KNM API Server. Must match key in `config/configVars.json`
* `toStage` = Signifier for which stage the record is moving to. Valid values are `booked`, `complete`, `not_interested` or `in_progress`.

### Receiving (Master) Account Side
No additional setup required.

## Update Processed Form Values in Master Account
### Sending (Affiliate) Account Side
1. http POST (required) - To address must include the path `/incoming/fp`
* `contactId` = Infusionsoft Merge Field Code `~Contact.Id~`
* `accessKey` = Access Key for KNM API Server. Must match key in `config/configVars.json`
* `fromAccount` = Infusionsoft account identifier for the account where this record is coming from (i.e. `op132`, `ag362`)

### Receiving (Master) Account Side
No additional setup required.

## Trigger API Goal with http POST
### Triggering Account
1. http POST (required) - To address must include the path `/incoming/tr`
* `contactId` = Infusionsoft Merge Field Code for contact. `~Contact.Id~` if this transaction is to trigger a goal in the this same account. If it is going back to the Master Account, use the merge field that hold that original contact ID.
* `accessKey` = Access Key for KNM API Server. Must match key in `config/configVars.json`
* `integration` = Infusionsoft account identifier for the account where the goal is being triggered as specified in the goal configuration (i.e. `op132`, `ag362`).
* `callName` = The Call Name for the goal being triggered as specified in the goal configuration.

### Account Goal Being Triggered
1. Configured API Goal in a campaign (required)
* `Integration` = The application identifier. This field is typically populated automatically (i.e. `op132`, `ag362`).
* `Call Name` = A text identifier (no spaces). Can be any text you want. It will be called by the triggering http POST.

## Current Status
* Production Monitoring through Loggly

## ToDo
* ~~Create Option to Trigger API Goals Through the App~~
* ~~Ensure Marketing Opt In Status is Set Set for New Contact~~
* ~~Carry Notes Across with Contact Information~~
* ~~Web Front End for Admin and Error Log Review~~
* ~~Error Logging~~
* ~~Contact Lookup if Master ContactId Doesn't Exist~~
