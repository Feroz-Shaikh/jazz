/**
Nodejs User Management 
@author: Somanchi
@version: 1.0
 **/

const errorHandlerModule = require("./components/error-handler.js"); //Import the error codes module.
const responseObj = require("./components/response.js"); //Import the response module.
const configObj = require("./components/config.js"); //Import the environment data.
const logger = require("./components/logger.js"); //Import the logging module.
const secretHandlerModule = require("./components/secret-handler.js"); //Import the secret-handler module.
const AWS = require('aws-sdk');


module.exports.handler = (event, context, cb) => {

  //Initializations
  var errorHandler = errorHandlerModule();
  var config = configObj(event);
  var secretHandler = secretHandlerModule();
  logger.init(event, context);

  var upId = config.USER_POOL_ID;
  var clntId = config.USER_CLIENT_ID;
  var region = config.REGION;//"us-east-1";
 
  
  try {

	 // event.method cannot be empty, throw error
	if (event === undefined || event.method === undefined) {
		cb(JSON.stringify(errorHandler.throwInputValidationError("method cannot be empty")));
	}

	// throw bad request error if id not specified for PUT/DELETE
	if (!(event.method === 'POST') ) {
		cb(JSON.stringify(errorHandler.throwInputValidationError("Service operations not supported")));
	}

    var sampleResponse = {};

	if (event.method === 'POST' ) {
		logger.info('User registration......');
		var service_data = event.body;

		AWS.config.region = 'us-east-1';
		logger.info('User Reg Request::' + JSON.stringify(service_data));
		
		var required_fields = ['userid', 'userpassword', 'usercode'];
		var field;

		for (var i = required_fields.length - 1; i >= 0; i--) {
			field = required_fields[i];
			var value = service_data[field];
			if (value === undefined || value === null || value === "") {
				cb(JSON.stringify(errorHandler.throwInternalServerError(field + " cannot be empty")));
			}
		}

		//UserPoolId: upId,

		var params = {
		  ClientId: clntId,
		  Username: service_data['userid'],
		  Password: service_data['userpassword'],
		  UserAttributes: [
		  ],
		  ValidationData: [
		  ]
		};
		
		logger.info("AWS Cognito - request::" + JSON.stringify(params));
		
		const COGNITO_CLIENT = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-19', region: 'us-east-1' });
		logger.info("created COGNITO_CLIENT");
		
		COGNITO_CLIENT.signUp(params, function(err, data) {
		  logger.info("Create User");
		  if (err) {
			  logger.info("error check it out");
			  logger.info(err, err.stack); // an error occurred
			  cb(JSON.stringify(errorHandler.throwInternalServerError("User creation error " + err.message)));
		  } else {
				logger.info("success check it out");
				logger.info(data);           // successful response

				logger.info("created USER................");
				
				var paramsConfirm = {
				  UserPoolId: upId,
				  Username: service_data['userid']
				};
				
				logger.info("CONFIRMING USER===============" + JSON.stringify(paramsConfirm));
				
				COGNITO_CLIENT.adminConfirmSignUp(paramsConfirm, function(err, data) {
				  if (err)  {
					  logger.info("adminConfirmSignUp error ");
					  logger.info(err, err.stack);
				  } else {
					  logger.info("adminConfirmSignUp success ");
					  logger.info(data);
				  }
				});

			  
		  }
		});

		
		logger.info("finished cognito call");
		
		sampleResponse.message = "User created successfully";
		cb(null, responseObj(sampleResponse, event.body));
				
	} else {
		cb(JSON.stringify(errorHandler.throwInternalServerError("Error Method not supported is only POST")));
	}
	

  } catch (e) {
	logger.error('Error : ', e.message);
	cb(JSON.stringify(errorHandler.throwInternalServerError(e.message)));
  }

};
