const fillPPTXPlaceHolders = "https://x9fozg39v5.execute-api.us-east-1.amazonaws.com/default/powerpointfunctionok";
const ConvertPPTXToPDF = "https://v2.convertapi.com/convert/pptx/to/pdf?Secret=REneMrkr9t92WcsD";
const ConvertHTMLToPDF = "http://preprod.xertify.co:40008/dynamicReportController/convertHTMLToPDF";
const ConvertPDFToImage = "http://preprod.xertify.co:40008/dynamicReportController/convertPDFToImage";
const SignPDF = "http://preprod.xertify.co:40008/dynamicReportController/signPDF";
const SMTP = "https://api.sendinblue.com/v3/smtp/email";
const SENDING_BLUE_KEY = "";
const EMAIL_CERTIFICATES_SUBJECT=" - Entrega de certificado Xertify";
const SMS_DEFAULT_PART_TEXT = " - Entrega de certificado ";
const EMAIL_CERTIFICATES_DEFAULT="admin@xertify.co";
const CODE_AREA_DEFAULT = "+57";
const SENDER_ID_DEFAULT = "mySenderID";
const MAX_PRICE ="0.50";
const SMS_TYPE = "Promotional";
const STATUS_DELIVERY_OK="OK";
const STATUS_DELIVERY_ERROR="F";
const STATUS_EMAIL_ERROR="EF";
const STATUS_SMS_ERROR="SMSF";
const EXT_PDF = ".pdf";

module.exports = {
	fillPPTXPlaceHolders,
	ConvertPPTXToPDF,
	ConvertHTMLToPDF,
	SignPDF,
    ConvertPDFToImage,
	SMTP:SMTP,
    SENDING_BLUE_KEY:SENDING_BLUE_KEY,
    EXT_PDF:EXT_PDF,
    EMAIL_CERTIFICATES_SUBJECT:EMAIL_CERTIFICATES_SUBJECT,
    EMAIL_CERTIFICATES_DEFAULT:EMAIL_CERTIFICATES_DEFAULT,
    CODE_AREA_DEFAULT:CODE_AREA_DEFAULT,
    SENDER_ID_DEFAULT:SENDER_ID_DEFAULT,
    MAX_PRICE:MAX_PRICE,
    SMS_TYPE:SMS_TYPE,
    SMS_DEFAULT_PART_TEXT:SMS_DEFAULT_PART_TEXT,
    STATUS_DELIVERY_OK:STATUS_DELIVERY_OK,
    STATUS_DELIVERY_ERROR:STATUS_DELIVERY_ERROR,
    STATUS_EMAIL_ERROR:STATUS_EMAIL_ERROR,
    STATUS_SMS_ERROR:STATUS_SMS_ERROR
}