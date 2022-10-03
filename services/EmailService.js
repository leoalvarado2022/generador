"use strict";

/**
 * Libraries
 */
var Mustache = require("mustache");
const constants_ = require("../configuration/constants");
var SibApiV3Sdk = require("sib-api-v3-sdk");
/**
 * Constants
 */
const got = require("got");
const sendinblue_key = constants_.SENDING_BLUE_KEY;

/**
 * Configure API key authorization: api-key
 */
var defaultClient = SibApiV3Sdk.ApiClient.instance;
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = sendinblue_key;

module.exports.send = async (
  parametersTemplate,
  emailSubject,
  emailDestinatary,
  companyName,
  htmlContent,
  files,
  subject,
  bcc
) => {
  
  /**
   * Process  html
  Code for chage delimiters*/

  var customTags = [ '${', '}' ];
  subject = Mustache.render(subject, parametersTemplate,{},customTags);
  let emailContent = Mustache.render(htmlContent, parametersTemplate,{},customTags);
  
  emailContent = emailContent.replace(/&#x2F;/g, "/");

  /**
   * Prepare send email
   */

  /*
  if(emailDestinatary.includes("xertifyprueba")){
    emailSubject="info@xertify.co";
    emailContent="HELLO THIS IS A TEST";
  }
  */


  var emailBody = {
    sender: {
      name: companyName,
      email: emailSubject,
    },
    to: [
      {
        email: emailDestinatary,
        name: companyName,
      },
    ],
    //bcc: bcc,
    htmlContent: emailContent,
    subject: subject,
    replyTo: {
      name: companyName,
      email: emailSubject,
    },
    attachment: files
  };

  if(emailDestinatary.includes("xertifyprueba")){
    emailBody = {
      sender: {
        name: companyName,
        email: emailSubject,
      },
      to: [
        {
          email: emailDestinatary,
          name: companyName,
        },
      ],
      //bcc: bcc,
      htmlContent: emailContent,
      subject: subject,
      replyTo: {
        name: companyName,
        email: emailSubject,
      }
    };
  }


  console.log("MAZDA 15 ========"+ JSON.stringify(emailBody));
  let copy;
  if(bcc!=null && bcc!=undefined){
    if (bcc[0].email != '') {
      console.log("MAZDA COPY ========" + bcc[0].email);
      copy = bcc;
    }
  }
  try {
    const { body } = await got.post(constants_.SMTP, {
      json: emailBody = {
        sender: {
          name: companyName,
          email: emailSubject,
        },
        to: [
          {
            email: emailDestinatary,
            name: companyName,
          },
        ],
        bcc: copy,
        htmlContent: emailContent,
        subject: subject,
        replyTo: {
          name: companyName,
          email: emailSubject,
        },
        attachment: files
      },
      responseType: "json",
      headers: {
        "api-key": sendinblue_key, // <--Very important!!!
      },
      retry: 0,
    });
    console.log("MAZDA 16 ========"+ JSON.stringify(body));
    return body;
  } catch (err) {
    console.log("Error processing email----" + err);
  }

  return {};
};


