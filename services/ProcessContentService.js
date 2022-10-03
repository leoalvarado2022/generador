'use strict';
var fs = require("fs");
var path = require("path");
const { STATUS_DELIVERY_OK, STATUS_DELIVERY_ERROR, EMAIL_CERTIFICATES_SUBJECT
  , EMAIL_CERTIFICATES_DEFAULT, EXT_PDF, SMS_DEFAULT_PART_TEXT } = require("../configuration/constants");
const additionalPlaceHoldersHtml = require("../models/AdditionalPlaceHolersHtml").additionalPlaceHoldersHtml;
const { MSU, LAS, SMS, MBO } = require("../models/TemplatePreference").templatePreference;

const URL_WALLET = process.env.URL_WALLET
const util = require("../configuration/utils");

let emailService = require("./EmailService");
let azureService = require("./AzureService");
let awsService = require("./AwsService");
let mysql = require("../services/MysqlService");
module.exports.readContentFile = async (template) => {
  /**
   * Load template for email
   */
  let htmlContent = "";
  try {
    htmlContent = fs.readFileSync(
      path.resolve(`resources/${template}`),
      "utf8"
    );
  } catch (error) {
    console.log("Error  readContentFile " + error);
  }
  return htmlContent;
};


module.exports.sendEmailContent = async (certificateCode, xertifyInit, templateObject, defaultValues, emission) => {


  // let dynamicValues = JSON.parse(person.dynamicValues);
  // console.log("MAZDA======2=========")
  // if (await util.verifyEmptyValue(dynamicValues)) {
  //   mapHtml = util.mergeData(await util.extractPlaceHolders(html), dynamicValues);
  // }

  // if (await util.verifyEmptyValue(defaultValues)) {
  //   mapHtml = util.mergeData(mapHtml, defaultValues);
  // }
  // console.log("MAZDA======3=========")

  // if (await util.verifyEmptyValue(branchInfo.dynamicParametersGroup)) {
  //   mapHtml = util.mergeData(mapHtml, branchInfo.dynamicParametersGroup);
  // }

  // if (await util.verifyEmptyValue(branchInfo.dynamicParametersBranch)) {
  //   mapHtml = util.mergeData(mapHtml, branchInfo.dynamicParametersBranch);
  // }

  // let staticValues = JSON.parse(person.staticValues);
  // if (await util.verifyEmptyValue(staticValues)) {
  //   mapHtml = util.mergeData(mapHtml, staticValues);
  //   mapHtml[additionalPlaceHoldersHtml.usernames] = await util.processEmptyValue(staticValues.firstname) + await util.processEmptyValue(staticValues.lastname);
  // }

  console.log("MAZDA======4=========");

  const Codes = certificateCode;
  let fileAzure = [];
  let sended = {};
  let mapHtml;
  let fromEmail;
  let html = "";
  let subject = "";
  let bcc = null;
  for (var i = 0; i < templateObject.length; i++) {

    console.log("MAZDA======1=========")
    let templateProperties = templateObject[i].jsonValues;
    
    if (await util.verifyEmptyValue(templateProperties[MBO])) {
      html = templateProperties[MBO];
    } else {
      html = await this.readContentFile("email/default-email.html");
    }

    mapHtml = xertifyInit.data;


    mapHtml[additionalPlaceHoldersHtml.companyName] = xertifyInit.get("companyName");
    mapHtml[additionalPlaceHoldersHtml.companyImg] = xertifyInit.get("companyImg");
    mapHtml[additionalPlaceHoldersHtml.codigo] = Codes[i];
    mapHtml[additionalPlaceHoldersHtml.code] = Codes[i];
    mapHtml[additionalPlaceHoldersHtml.tiedocsCode] = Codes[i];
    mapHtml[additionalPlaceHoldersHtml.eventName] = templateObject[i].NAME;
    mapHtml[additionalPlaceHoldersHtml.tiedocsCodeLink] = URL_WALLET + Codes[i];

    

    if (await util.verifyEmptyValue(templateProperties[MSU])) {
      subject = templateProperties[MSU];
    } else {
      subject = branchInfo.companyName + EMAIL_CERTIFICATES_SUBJECT;
    }
    console.log("MAZDA======5=========")
    fromEmail = templateProperties[LAS] == undefined || templateProperties[LAS] == null ? EMAIL_CERTIFICATES_DEFAULT : templateProperties[LAS];
    console.log("MAZDA======0========= " + Codes[i])
    const _tmpFileA = await azureService.dowloadFile(Codes[i]);
    console.log("MAZDA======X=========")
    if(!!_tmpFileA) fileAzure.push(_tmpFileA);
    

    
    if (emission.EMAIL_COPY != null && emission.EMAIL_COPY != undefined) {
      let arrayEmails = emission.EMAIL_COPY.split(",");
      bcc = [];
      for (let indexEmails = 0; indexEmails < arrayEmails.length; indexEmails++) {
        bcc.push({
          email: arrayEmails[indexEmails]
        });
      }

    }
    console.log("MAZDA======6=========");
  }

  const attachment = [];
  fileAzure.forEach( (_fileA,b) =>{
    console.log("_fileA::> ",_fileA);
    if(!!_fileA) {
      attachment.push({
        name: xertifyInit.get("title") + EXT_PDF,
        content: _fileA.toString('base64')
      });
    }
  });

  console.log("Email to " + xertifyInit.get("email"));
  console.log("MAZDA======7=========",mapHtml);
  sended =  emailService.send(mapHtml, fromEmail, xertifyInit.get("email"), xertifyInit.get("companyName"), html, attachment, subject,bcc);

  console.log("MAZDA======8========="+JSON.stringify(sended))
  

  sended["mapHtml"] = mapHtml;
  return sended;

};

module.exports.processSms = async (person, branchInfo, certificateCode, templateObject, mapHtml) => {

  let textSms = "";
  let link = URL_WALLET + certificateCode;
  let mapSms = {};
  let templateProperties = templateObject.jsonValues;
  
  if (await util.verifyEmptyValue(templateProperties[SMS])) {
    mapSms = await util.extractPlaceHolders(templateProperties[SMS]);
    mapSms = util.mergeData(mapSms, mapHtml);
    mapSms[additionalPlaceHoldersHtml.linkCertificate] = link;
    textSms = branchInfo.companyName + " - " + templateProperties[SMS];
  } else {
    textSms = branchInfo.companyName + SMS_DEFAULT_PART_TEXT + link;
  }

  let smsId = "";
  let staticValues = JSON.parse(person.staticValues);
  //mapSms[additionalPlaceHoldersHtml.companyName] = branchInfo.companyName;
  //mapSms[additionalPlaceHoldersHtml.companyImg] = branchInfo.companyImg;
  mapSms[additionalPlaceHoldersHtml.codigo] = certificateCode;
  mapSms[additionalPlaceHoldersHtml.code] = certificateCode;
  mapSms[additionalPlaceHoldersHtml.tiedocsCode] = certificateCode;
  //mapSms[additionalPlaceHoldersHtml.eventName] = templateObject.NAME;
  mapSms[additionalPlaceHoldersHtml.tiedocsCodeLink] = URL_WALLET + certificateCode;
  if (await util.verifyEmptyValue(staticValues)) {
    if (await util.verifyEmptyValue(staticValues.phone)) {
      smsId = await awsService.sendSms(textSms, staticValues.phone, mapSms);
    } else {
      console.log("Phone not found:: Not phone asociated " + person.email);
    }
  } else {
    console.log("Phone not found:: staticValues empty " + person.email);
  }

  return smsId;

};

module.exports.processStatusDelivery = async (emailMessageId, smsMessageId, codeCertificate) => {
  let statusDeliveryEmail = await util.verifyEmptyValue(emailMessageId);
  smsMessageId = await util.processEmptyValue(smsMessageId);

  try {

    console.log('VENECIA--1----'+JSON.stringify(statusDeliveryEmail))
    console.log('VENECIA--2----'+JSON.stringify(smsMessageId))
    if (statusDeliveryEmail) {
      /*
      await mysql.query(`UPDATE T_RECORD_CERTIFICATE SET SMS_ID='${smsMessageId}', EMAIL_ID='${emailMessageId}' ` +
          ` WHERE CODE ='${codeCertificate}'`);*/

      await mysql.query(`UPDATE T_RECORD_CERTIFICATE SET SMS_ID='${smsMessageId}', EMAIL_ID='${emailMessageId}' ` +
        `, STATE='${STATUS_DELIVERY_OK}' WHERE CODE ='${codeCertificate}'`);

      console.log('VENECIA--3----')

    } else {

      await mysql.query(`UPDATE T_RECORD_CERTIFICATE SET ` +
        ` STATE='${STATUS_DELIVERY_ERROR}' WHERE CODE ='${codeCertificate}'`);

      console.log('VENECIA--5----')
    }
  } catch (error) {
    console.log("Error updateding status delivery:: " + error);
  }

};




