"use strict";
const { v4: uuidv4 } = require('uuid');
const constants = require('./constants');
const mustache = require("mustache");
const axios = require('axios');
const Request = require('../services/RequestService');
mustache.tags = [ '${', '}' ];

module.exports.asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 * @method
 * @desc Process JSON FILE for BLOCKCHAIN
 * @param {JSON} blockcert default json to replace data
 * @param {string} BCR is a HTML for the JSON FILE
 * @param {JSON} xertifyInit - data from database
 * @param {JSON} T_BLOCKCHAIN_DATA - blockchain information
 * @return {JSON}
 **/

module.exports.processJsonFile = async (blockcert,BCR,xertifyInit,T_BLOCKCHAIN_DATA,qrbase64) => {
  const uuidBC = "urn:uuid:"+uuidv4();
  const _bcrReplace = xertifyInit.data;
  let _BCR = mustache.render(BCR,_bcrReplace);

  _BCR = _BCR.replace(/qr_xertify_120_120/g,`<img style="width: 120px; height: 120px" src="data:image/png;base64,${qrbase64}" />`);
  var imageBase64;

  const buf = await axios.get(xertifyInit.get("companyImg"), {responseType: 'arraybuffer'});
  imageBase64 = Buffer.from(buf.data).toString('base64');

  blockcert.displayHtml = _BCR;
  blockcert.issuedOn = xertifyInit.get("DateISO");
  blockcert.id = uuidBC;
  blockcert.recipient.identity = xertifyInit.get("email");
  blockcert.recipientProfile.name = xertifyInit.get("firstname") + " " + xertifyInit.get("lastname");
  blockcert.recipientProfile.publicKey = xertifyInit.get("email");
  
  blockcert.badge.id = uuidBC;
  blockcert.badge.name = xertifyInit.get("eventName");
  blockcert.badge.description = xertifyInit.get("eventDescription");
  blockcert.badge.image = `data:image/png;base64,${imageBase64}`;

  blockcert.badge.issuer.id = T_BLOCKCHAIN_DATA.URL_PUBLIC;
  blockcert.badge.issuer.name = xertifyInit.get("companyName");
  blockcert.badge.issuer.url = T_BLOCKCHAIN_DATA.URL_PUBLIC;
  blockcert.badge.issuer.email = xertifyInit.get("blockchainEmail");
  blockcert.badge.issuer.image = `data:image/png;base64,${imageBase64}`;
  blockcert.badge.issuer.revocationList = T_BLOCKCHAIN_DATA.URL_REVOKATION;

  blockcert.verification.publicKey = T_BLOCKCHAIN_DATA.PUBLIC_KEY;
  
  return blockcert;
}

module.exports.processProcedureData = (jsonParams,PROCEDURE_DATA_JSON,xertifyInit,qtyTemplates,templatesLoaded) => {

  const __Templates = [];

  PROCEDURE_DATA_JSON.certificateGenerationId = jsonParams.generation_id;
  PROCEDURE_DATA_JSON.certificateGenerationName = xertifyInit.get("eventName");
  PROCEDURE_DATA_JSON.requestApiId = "";
  PROCEDURE_DATA_JSON.staffId = jsonParams.staffId;
  PROCEDURE_DATA_JSON.prodId = jsonParams.prodId;
  PROCEDURE_DATA_JSON.accId = jsonParams.acc_idCompany;
  PROCEDURE_DATA_JSON.numberOfCertificates = Object.values(qtyTemplates).reduce((a, b) => a + b);
  PROCEDURE_DATA_JSON.targetFolder = jsonParams.folder;
  PROCEDURE_DATA_JSON.awsBucket = jsonParams.bucket;
  PROCEDURE_DATA_JSON.qtyA = qtyTemplates.A;
  PROCEDURE_DATA_JSON.qtyB = qtyTemplates.B;
  PROCEDURE_DATA_JSON.qtyC = qtyTemplates.C;
  PROCEDURE_DATA_JSON.qtyD = qtyTemplates.D;
  for(const _Templates of templatesLoaded){
    if(["HTML","PPTX"].includes(_Templates.TYPE)){
      __Templates.push(
        {
          "privacy": "U",
          "pdfHash": _Templates.pdfHash,
          "email": xertifyInit.get("email"),
          "awsIdImage": "",
          "templateId": _Templates.T_ID,
          "code": _Templates.code,
          "cvId": jsonParams.CV_ID,
          "accId": xertifyInit.get("accId"),
          "expirationDateParam": "EMPTY",
          "codeToken": "eyJiZWdpbiI6IjIwMjEtMTAtMzAgMTE6MDg6MDUiLCJlbmQiOiIyMDI2LTEwLTMwIDExOjA4OjA1IiwiY2VydGlmaWNhdGVfY29kZSI6IkE0NUY4QjJCQTAwMSJ9",
          "blockcertsPath": `${jsonParams.folder}/${jsonParams.acc_idCompany}/${jsonParams.generation_id}/${_Templates.code}.json`,
          "certificateType": "AC" //viene del procedure revisar de cual, de todas formas tambien lo obtengo en el JSON del templateFile de AWS
        }
      );
    }
  }
  PROCEDURE_DATA_JSON.finalResultArray = __Templates;
  return PROCEDURE_DATA_JSON;
}



module.exports.processSOC = async (SOC,xertifyInit) => {
  const _socReplace = xertifyInit.data;

  const _SOC = mustache.render(SOC,_socReplace);
  let SOC_IMAGE = "";
  const convertPdf = await Request.ConvertHTMLToPDF(_SOC);
  const pdfBase64 = convertPdf.data.pdf;
  console.log("PDFtoIMAGE::> ",constants.ConvertPDFToImage);
  try{
    const res = await Request.ConvertPDFToImage(pdfBase64);
    SOC_IMAGE = res.data.result;
    return SOC_IMAGE;
  }catch(e) {
    console.log("error processSOC");
    return;
  }
}

module.exports.processEmptyValue = async (value) => {
  return value == undefined || value == null
    ? ''
    : value;
};

module.exports.verifyEmptyValue = async (value) => {
  return value != undefined || value != null;
};

module.exports.buildInClause = async (value) => {
  const quote = "'";
  const comma = ",";
  let finalClause = "";
  for (let i = 0; i < value.length; i++) {
    finalClause += quote + value[i] + quote;
    if (i < value.length - 1) {
      finalClause += comma;
    }
  }


  return finalClause;
};

module.exports.mergeData = (fromData, toData) => {
  for (var attrName in toData) {
    fromData[attrName] = toData[attrName];
  }

  return fromData;
};

module.exports.extractPlaceHolders = async (text) => {
  //var regex = /(?<=\\$\\{)([^\\}]+)(?=\\})/g;
  var regex = /\$\{(\w+)\}/g;
  ;
  var result = {};
  let match = [];
  while (match = regex.exec(text)) {
    result[match[1]] = match[1];
  }

  return result;
}

module.exports.uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}