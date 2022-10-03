"use strict";

const constants = require('../configuration/constants');
const axios = require('axios');

module.exports.fillPPTXPlaceHolders = async (jsonParams) => {
	const jsonRequest = {
		"pptx": jsonParams.pptxTemplate,
		"replacements": {
			"${code}": jsonParams.xertifyInit.get("code"),
			"${cvId}": jsonParams.xertifyInit.get("cvId"),
			"${accId}": jsonParams.xertifyInit.get("accId"),
			"${couId}": jsonParams.xertifyInit.get("couId"),
			"${email}": jsonParams.xertifyInit.get("email"),
			"${phone}": jsonParams.xertifyInit.get("phone"),
			"${lastname}": jsonParams.xertifyInit.get("lastname"),
			"${firstname}": jsonParams.xertifyInit.get("firstname"),
			"${idnum}": jsonParams.xertifyInit.get("idnum"),
			"${salary}": jsonParams.xertifyInit.get("salary"),
			"${average}": jsonParams.xertifyInit.get("average"),
			"${children}": jsonParams.xertifyInit.get("children"),
			"${dategrad}": jsonParams.xertifyInit.get("dategrad"),
			"${location}": jsonParams.xertifyInit.get("location"),
			"${nationalit}": jsonParams.xertifyInit.get("nationalit")
		},
		"replacementsText": [
			{
				"text": "Código: ",
				"position_X": 160,
				"position_Y": 350,
				"height": 50,
				"width": 80,
				"size": 12,
				"font_name": "Calibri",
				"colour_R": 100,
				"colour_G": 100,
				"colour_B": 100,
	      	},
	    	{
				"text": jsonParams.xertifyInit.get("code"),
				"position_X": 250,
				"position_Y": 350,
				"height": 50,
				"width": 50,
				"size": 12,
				"font_name": "Calibri",
				"colour_R": 100,
				"colour_G": 100,
				"colour_B": 100,
				"line": 5,
				"href": `https://wallet.xertify.co/certificates/${jsonParams.xertifyInit.get("code")}`
	      	}
	   	],
		"replacementsImages": [
	      	{
				"position_X": 5,
		        "position_Y": 340,
		        "height": 42,
		        "width": 122,
				"base64": "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"
			},
			{
				"position_X": parseInt(jsonParams.qrMetadata.x),
		        "position_Y": parseInt(jsonParams.qrMetadata.y),
		        "height": parseInt(jsonParams.qrMetadata.h),
		        "width": parseInt(jsonParams.qrMetadata.w),
		        "base64": jsonParams.qrbase64
		    }
		]
	};

	return axios.request({
		url: constants.fillPPTXPlaceHolders,
		method: 'GET',
		data: jsonRequest
	});
};

module.exports.ConvertPPTXToPDF = async(base64Data) => {
	const pdfRequest = {
	    "Parameters": [
	        {
	            "Name": "File",
	            "FileValue": {
	                "Name": "test.pptx",
	                "Data": base64Data
	            } 
	        },
	        {
            	"Name": "StoreFile",
	            "Value": true
	        }
	    ]
	};

	return axios.request({
		url: constants.ConvertPPTXToPDF,
		method: "POST",
		data: pdfRequest,
		headers: {"Content-Type": "application/json"}
	});
}

module.exports.ConvertHTMLToPDF = async(_html) => {	
	const _req = {
		"html": _html
	}
	return axios.request({
		url: constants.ConvertHTMLToPDF,
		method: "POST",
		data: _req,
		headers: {"Content-Type": "application/json"}
	})
}

module.exports.ConvertPDFToImage = async(pdfBase64) => {
	return axios.request({
	    url: constants.ConvertPDFToImage,
	    method: "POST",
	    data: {
	        "fileData":pdfBase64,
	        "height":1024,
	        "width":1024
	    },
	    headers: {"Content-Type": "application/json"}
	})
}

module.exports.signPDF = async(base64File,accId,companyName) => {
	const _req = {
		fileData: base64File,
		accId: accId,
		companyName: companyName
	}
	return axios.request({
		url: constants.SignPDF,
		method: "POST",
		data: _req,
		headers: {"Content-Type": "application/json"}
	});
}