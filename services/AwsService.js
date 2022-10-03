"use strict";

require('../configuration/config');
const AWS_SDK = require('aws-sdk');
var Mustache = require("mustache");
const Utils = require('../configuration/utils');
const { CODE_AREA_DEFAULT, SENDER_ID_DEFAULT, MAX_PRICE, SMS_TYPE } = require("../configuration/constants");


AWS_SDK.config.update({
	accessKeyId: global.config_.aws.awsKey,
	secretAccessKey: global.config_.aws.awsSecret,
	region: "us-east-1"
});

const s3 = new AWS_SDK.S3();
const sqs = new AWS_SDK.SQS({apiVersion: '2012-11-05'});

module.exports.setKeys = (__params) => {
	AWS_SDK.config.update({
		accessKeyId: __params.awsKey,
		secretAccessKey: __params.awsSecret,
	});
}


module.exports.callSQS = async (__params) => {
	return sqs.sendMessage(__params).promise();
}

module.exports.uploadFile = async (ObjectParams,file) => {

	let options;

	if(ObjectParams.Type == "json") {
		options = { Bucket: ObjectParams.Bucket, Key: ObjectParams.Key, Body: JSON.stringify(file), ContentType: "application/json;charset=utf-8"};
	}else if(ObjectParams.Type == "base64") {
		const _body = new Buffer.from(file,'base64');
		options = { 
			Bucket: ObjectParams.Bucket, 
			Key: ObjectParams.Key,
			Body: _body,
			ContentEncoding: 'base64', 
			ContentType: 'image/jpeg'
		};
		console.log("entro por las opciones de base64::> ",options);
	}else{
		options = { Bucket: ObjectParams.Bucket, Key: ObjectParams.Key, Body: file};
	}

	try{
		return await s3.putObject(options).promise();
	}catch (e){
		throw "Error uploading S3 Files "+e;
	}
}

module.exports.getFiles = async (BucketParams) => {

	/*
		folder_name/ACC_ID/TEMPLATE_ID.extension
	*/
	
	return new Promise( async (resolve,rejected) => {
		let _Files = [];
		try{
			await Utils.asyncForEach(BucketParams, async (_json,index) => {
				const name = _json.name;

				_Files[name] = await s3.getObject({
					Bucket: _json.Bucket,
					Key: _json.Key
				}).promise();
			});
			resolve(_Files);
		}catch(e) {
			throw "Error resolving S3 Files "+e;
		}
	})
}

module.exports.sendSms = async (message, phone, params) => {

    var customTags = ['${', '}'];
    message = Mustache.render(message, params, {}, customTags);

    let attributes = {
        "AWS.SNS.SMS.SenderID": {
            StringValue: SENDER_ID_DEFAULT,
            DataType: "String"
        },
        "AWS.SNS.SMS.MaxPrice": {
            StringValue: MAX_PRICE,
            DataType: "Number"
        },
        "AWS.SNS.SMS.SMSType": {
            StringValue: SMS_TYPE,
            DataType: "String"
        }
    }
    let paramsSms = {
        Message: message, /* required */
        PhoneNumber: await processPhone(phone),
        MessageAttributes: attributes
    };
    return await new AWS_SDK.SNS({ apiVersion: '2010-03-31' }).publish(paramsSms).promise();
};

module.exports.deleteMessage = async(urlSqs,receipt)=>{
    let paramsSqsDelete = {
        QueueUrl:urlSqs,
        ReceiptHandle: receipt
    }

    return await new AWS_SDK.SQS({apiVersion: '2012-11-05'}).deleteMessage(paramsSqsDelete).promise();
};

async function processPhone(phone) {
    if (!phone.startsWith("+")) {
        phone = CODE_AREA_DEFAULT + phone;
    }
    return phone;
}