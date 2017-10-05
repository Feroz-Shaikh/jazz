/**
    List Users from cognito
    @module: listusers.js
    @description: list users functions for user management 
    @author: Somanchi
    @version: 1.0
**/
const AWS = require('aws-sdk');
const logger = require("./components/logger.js"); //Import the logging module.

module.exports = (service_data, onComplete) => {

	//logger.init(event, context);

	var upId = "us-east-1_gqEVRPowS";
	var region = "us-east-1";

    AWS.config.region = 'us-east-1';
	
	var params = {
	  UserPoolId: upId
	};
	
	logger.info("started working on the user mgmt");
	logger.info(JSON.stringify(params));
	
	const COGNITO_CLIENT = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-19', region: 'us-east-1' });
	logger.info("created COGNITO_CLIENT");
	
	COGNITO_CLIENT.listUsers(params, function(err, data) {
	
	  logger.info("called listUsers");
	  if (err) {
            onComplete({
                "result": "COGNITOError",
                "message": "Error adding Item to dynamodb " + err.message
            }, null);
	  } else {
            // Success!!
            onComplete(null, {
                "result": "success",
                "userlist": data
            });
	  }
	});
	
};
