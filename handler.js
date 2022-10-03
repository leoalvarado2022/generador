const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const mustache = require("mustache");
const moment = require("moment");
const Crypto = require("crypto");
const QRCode = require('qr-image');
const Utils = require('./configuration/utils');
const AWS = require('./services/AwsService');
const RequestService = require('./services/RequestService');
const Azure = require("./services/AzureService");
const mysql = require('./services/MysqlService');
const processContentService = require("./services/ProcessContentService");
const blockcert = require('./configuration/blockcerts.json');
const PROCEDURE_DATA_JSON = require('./configuration/PROCEDURE_DATA.json');
const T_BLOCKCHAIN_JSON = require('./configuration/T_BLOCKCHAIN_DEFAULT.json');
const xertifyData = require("./models/xertifyData");
const CodeGenerator = require("./models/Code");
const certificateEmail = require("./models/CertificateEmail").certificateEmail;

mustache.tags = [ '${', '}' ];
moment.locale('es');
const BRC_default = fs.readFileSync(path.resolve(__dirname, './configuration/blockchainDefault.html'), 'utf8');


module.exports.initXertifyData = (resDataJson,resProcBranch) => {
	const StaticValues = JSON.parse(resDataJson.staticValues);
	const DynamicValues = JSON.parse(resDataJson.dynamicValues);
	console.log("DynamicValues ::> ",DynamicValues);
	console.log("StaticValues ::> ",StaticValues);
	let xertifyInit = new xertifyData({
		code: resDataJson.code, //Verification Code
		codigo: resDataJson.code,
		cvId: resDataJson.cvId,
		accId: resDataJson.accId,
		apellidos: StaticValues.lastname, 
		nombres: StaticValues.firstname,
		countryparam: StaticValues.companyCountryId, //País
		companyname: resProcBranch.companyName, //Nombre empresa
		companyName: resProcBranch.companyName, //Nombre empresa
		paramCompanyName: resProcBranch.companyName,
		countrycompanyparam: "", //País empresa
		companyDocName: "", //Tipo doc. empresa
		companyDocNumber: "", //Num doc. empresa
		paramA: "", //Género
		paramB: "", //Descripción
		paramC: "", //Nombre del Evento
		paramD: "", //Ubicación
		paramE: "", //WEB
		paramF: "", //Fecha de inicio
		paramG: "", //Fecha Fin
		branch: "", //Branch name
		Ciu: "", //Ciudad
		correodire: "", //Correo director
		nomdirect: "", //Nombre director
		Nomreso: "", //Nombre resolución
		reso: "", //Resolucion
		logoCoordi: "", //logoCoordinador
		logoDirect: "", //logoDirector
		eventName: resProcBranch.title, //Course name
		title: resProcBranch.title, //Course name
		paramCourseName: resProcBranch.title,
		nombreEvento: resProcBranch.title,
		eventDescription: resProcBranch.description, //Course description
		blockchainEmail: resProcBranch.blockchainEmail,
		companyImg: resProcBranch.companyImg,
		horasTotal: "", //Horas total
		Nivel: "", //Niveles
		DateISO8601: moment().toISOString(),
		DateISO: moment(),
		DateA:moment().format("DD [of] MMMM [de] YYYY"), //30 of July de 2020
		FechaA: moment().format("DD [of] MMMM [de] YYYY"), //30 of July de 2020
		DateB:moment().format("[a los] DD [días del mes de] MMMM [de] YYYY"), //a los 30 días del mes de julio de 2020
		FechaB: moment().format("[a los] DD [días del mes de] MMMM [de] YYYY"), //a los 30 días del mes de julio de 2020
		DateC:moment().format("DD/MM/YYYY"), //30/07/2020
		FechaC: moment().format("DD/MM/YYYY"), //30/07/2020
		DateD:moment().format("MMMM DD [de] YYYY"), //julio 30 de 2020
		FechaD: moment().format("MMMM DD [de] YYYY"), //julio 30 de 2020
		DateE:moment().format("YYYY-MM-DD"), //2020-07-30
		FechaE: moment().format("YYYY-MM-DD"), //2020-07-30
		DateF:moment().format("YYYY-MM-DD HH:mm:ss.SSS"), //2020-07-30 12:27:35.388
		FechaF: moment().format("YYYY-MM-DD HH:mm:ss.SSS"), //2020-07-30 12:27:35.388
		DateF:moment().format("YYYY-MM-DD HH:mm"), //2020-07-30 12:27
		FechaG: moment().format("YYYY-MM-DD HH:mm"), //2020-07-30 12:27
		dateExpiration_formatA: moment().format("[Fecha de expiración] DD/MM/YYYY"), //Fecha de expiración dd/MM/YYYY
		dateExpiration_formatB: moment().format("[Fecha de expiración] MM/DD/YYYY") //Fecha de expiración MM/dd/YYYY
	});

	/**
	 * Validar que existan datos
	 */
	if(DynamicValues!= null && dynamicValues != undefined){
		if(Object.keys(DynamicValues).length > 0){
			Object.keys(DynamicValues).forEach((a,b) => {
				const _value = Object.values(DynamicValues)[b];
				if(!!_value) xertifyInit.set(a,_value);
			});
		}
	}

	if(Object.keys(StaticValues).length > 0){
		Object.keys(StaticValues).forEach((a,b) => {
			const _value = Object.values(StaticValues)[b];
			if(!!_value) xertifyInit.set(a,_value);
		});
	}

	return xertifyInit;
}

module.exports.getTemplatesAWS = async(arrTemplates,acc_id) => {
	const templatesLoaded = [];
	// console.log("getTemplatesAWS ::> arrTemplates ::> ",arrTemplates);
	await Utils.asyncForEach(arrTemplates, async (__Template,index) => {
		sqlTempl = `SELECT * FROM T_TEMPLATE WHERE TEMPLATE_ID = '${__Template.T_ID}'`;
		
		const resTempl = await mysql.query(sqlTempl);

		const ext = resTempl[0].TYPE_FILE.toLowerCase();
		if(ext == "pptx") {
			templatesLoaded.push({T_ID:__Template.T_ID,TYPE:"PPTX",name:`pptx${__Template.T_ID}`,resTempl:resTempl[0],Bucket:"leonardotesting",Key:`templatesNew/${acc_id}/${__Template.T_ID}.pptx`,pdfHash:"",code:""});
			templatesLoaded.push({T_ID:__Template.T_ID,TYPE:"JSONPPTX",name:`jsonPptx${__Template.T_ID}`,resTempl:resTempl[0],Bucket:"leonardotesting",Key:`templatesNew/${acc_id}/${__Template.T_ID}.json`,pdfHash:"",code:""});
		}else if(ext == "html") {
			templatesLoaded.push({T_ID:__Template.T_ID,TYPE:"HTML",name:`jsonHtml${__Template.T_ID}`,resTempl:resTempl[0],Bucket:"leonardotesting",Key:`templatesNew/${acc_id}/${__Template.T_ID}.json`,pdfHash:"",code:""});
		}
	});
	// console.log("antes del AWS.getFiles");
	const templatesFiles = await AWS.getFiles(templatesLoaded);
	// console.log("despues del AWS.getFiles::> ",templatesFiles);
	return [templatesFiles,templatesLoaded];
}

module.exports.convertQrData = (arrQRs) => {
	const QrsData = [];
	for(const _qr of arrQRs.split(",")){
	  QrsData[_qr.split(":")[0]] = _qr.split(":")[1];
	}
	return QrsData;
}

module.exports.parserQRData = (qrData,T_ID) => {
	const qrMetadata = qrData[T_ID].split("|");
	return {
		"x": qrMetadata[0],
		"y": qrMetadata[1],
		"h": qrMetadata[2],
		"w": qrMetadata[3],
		"replace": qrMetadata[4]
	}
}

//TODO
/**
  * Validar que solo acepte los valores de estatus correspondientes
  * el listado de estatus aceptados esta en Discord enviado por Jhezir
*/
module.exports.changeGenerationStatus = async(event) => {
	const _json = JSON.parse(event.body);
	const newStatus = _json.status;
	const generation_id = _json.generation_id;
	const sqlStatus = `UPDATE T_CERTIFICATES_GENERATION SET  STATUS = '${newStatus}' WHERE CERTIFICATES_GENERATION_ID = '${generation_id}'`;
	const resStatus = await mysql.query(sqlStatus);
	console.log("resStatus::> ",resStatus[0].affectedRows);
	const response = {
    statusCode: 200,
    body: JSON.stringify({"changed":true})
  };
  return response;
}

/**
 * @method
 * @desc Process the request for Xertify
 * @param {Array<...,Records:Array<messageAttributes:Object<stringValue:string>>>} event
 * @return {void}
 **/

module.exports.processTemplate = async (event) => {
	console.log("empezo processTemplate");
	// console.time("processTemplate");
	var acc_id;
	var CV_ID;
	var jsonData;
	var resDataJson;
	var generation_id;
	var prod_id
	var staff_id;
	var xertifyInit = {};
	var Codes = [];
	var qtyTemplates = {A:0,B:0,C:0,D:0};
	var templatesLoaded;
	var T_BLOCKCHAIN_DATA;
	var qrParam;

	const _generation = event.Records[0].messageAttributes.generation_id.stringValue;
	console.log("generation before async ForEach::> ",_generation);
	const sqlStatus = `SELECT COUNT(*) AS existe FROM T_CERTIFICATES_GENERATION WHERE STATUS = 'R' AND CERTIFICATES_GENERATION_ID = '${_generation}'`;
	console.log("sqlStatus::> ",sqlStatus);
	const resStatus = await mysql.query(sqlStatus);
	const statusActual = resStatus[0].existe;
	if(statusActual == 0) {
		console.log(`EL GENERATION ID ${generation_id} NO ESTA EN PROCESO, PROCESS TEMPLATE`);
		return;
	}

	let JSONsFolder = "certificates_jsons_pre";

	await Utils.asyncForEach(event.Records, async (record,R_index) => {

		console.log("record::> ",record)

		jsonData = record.messageAttributes;

		console.log("jsonData::> ",jsonData);

		CV_ID = jsonData.CV_ID.stringValue;
		console.log("CV_ID::> ",CV_ID);
		var arrTemplates = [];


		for(const arrT of jsonData.arrTemplates.stringValue.split(",")){
			arrTemplates.push({T_ID:arrT});
		} 

		console.log("arrTemplates::> ",arrTemplates);
		generation_id = jsonData.generation_id.stringValue;
		console.log("generation_id::> ",generation_id);
		acc_id = jsonData.acc_id.stringValue;
		console.log("acc_id::> ",acc_id);
		prod_id = jsonData.prod_id.stringValue;
		console.log("prod_id::> ",prod_id);
		staff_id = jsonData.staff_id.stringValue;
		console.log("staff_id::> ",staff_id);
		qrParam = jsonData.arrQrData.stringValue;
		console.log("qrParam::> ",qrParam);

		const tmpTempl = await this.getTemplatesAWS(arrTemplates,acc_id);

		var templatesFiles = tmpTempl[0];
		templatesLoaded = tmpTempl[1];

		console.log("templatesLoaded::> ",templatesLoaded);
		
		const sqlPlan = `SELECT (TYPE_A_TOTAL - TYPE_A_SPENT) as A,(TYPE_B_TOTAL - TYPE_B_SPENT) as B,(TYPE_C_TOTAL - TYPE_C_SPENT) as C,(TYPE_D_TOTAL - TYPE_D_SPENT) as D,ON_DEMAND FROM T_PLAN_CUSTOMER WHERE ACC_ID = '${acc_id}'`;
		const sqlCVID = `SELECT COUNT(*) AS existe FROM T_COMPANY_GROUP_CUSTOMER CGC INNER JOIN T_CODE C ON C.ACC_ID = CGC.ACC_ID WHERE CGC.CV_ID = '${CV_ID}'`;
		const sqlCallProcedureCBGI = `SELECT generationCompanyBranchAndGroupInformation('${prod_id}') as gCBAGI`;
		const sqlBlockchain = `SELECT * FROM T_BLOCKCHAIN where ACC_ID = '${acc_id}'`;
		const sqlDigitalSignature = `SELECT COUNT(*) as hayfirma FROM T_DIGITAL_SIGNATURE WHERE ACC_ID = '${acc_id}'`;

		

		console.log("entrando a las consultas MYSQL");

		const __sqls = [];
		__sqls.push(await mysql.query(sqlCVID));
		console.log("mysql.query(sqlCVID)::> ",__sqls[0][0]);
		__sqls.push(await mysql.query(sqlCallProcedureCBGI));
		console.log("mysql.query(sqlCallProcedureCBGI)::> ",__sqls[1][0]);
		__sqls.push(await mysql.query(sqlBlockchain));
		console.log("mysql.query(sqlBlockchain)::> ",__sqls[2][0]);
		__sqls.push(await mysql.query(sqlDigitalSignature));
		console.log("mysql.query(sqlDigitalSignature)::> ",__sqls[3][0]);
		__sqls.push(await mysql.query(sqlPlan));
		console.log("mysql.query(sqlPlan)::> ",__sqls[4][0]);
		// __sqls.push(await mysql(sqlInsertGenerationChild));
		// console.log("mysql.query(sqlGeneration)::> ",__sqls[4][0]);
			
		console.log("entro a las consultas MYSQL");

		const _resDigitalSignature = __sqls[3];
		const resBlockchain = __sqls[2];
		const _resPlan = __sqls[4];

		var _resProcBranch = __sqls[1];
		
		var objCode;
		var digitalSignature = _resDigitalSignature[0]["hayfirma"];
		
		var StaticValues;
		var DynamicValues;
		var qrbase64 = "";
		var BCR_for_JSON;
		var qrParsed;
		
		if(!!resBlockchain[0]){
			T_BLOCKCHAIN_DATA = resBlockchain[0]; //valores de la Base de datos 
		}else {
			T_BLOCKCHAIN_DATA = T_BLOCKCHAIN_JSON; //valores por default si no hay nada en la BD
		}

		if(T_BLOCKCHAIN_DATA.MAINNET == 1){
			JSONsFolder = "certificates_jsons_main";
		}
		
		if(_resPlan[0].B > 0 || _resPlan[0].ON_DEMAND == 1) {

			console.log("entro a la validacion por el plan del clienteeeee");

			const sqlGCVReport = `SELECT generationCVsIdsReport('${CV_ID}') as cvData`;
			const resReport = await mysql.query(sqlGCVReport);
				
			resDataJson = JSON.parse(resReport[0]["cvData"])[0];
			StaticValues = JSON.parse(resDataJson.staticValues);
			DynamicValues = JSON.parse(resDataJson.dynamicValues);

			xertifyInit = this.initXertifyData(resDataJson,JSON.parse(_resProcBranch[0]["gCBAGI"]));
			objCode = new CodeGenerator(resDataJson.code);
			// console.log("xertifyInit::> ",xertifyInit.data);

			const qr_code = new QRCode.imageSync(`https://wallet.xertify.co/certificates/${xertifyInit.get('code')}`);

			qrbase64 = Buffer.from(qr_code).toString('base64');
			qrParsed = this.convertQrData(qrParam);
			await Utils.asyncForEach(templatesLoaded, async (__Template,index) => {

				console.log("entrando al foreach de templatesLoaded");


				console.log("trabajando en la plantilla __Template.TYPE",__Template.TYPE);
				
				
				if(__Template.TYPE == "PPTX") {

					if(index > 0) {
						const __nextCode = objCode.getNext().get();
						xertifyInit.set("code",__nextCode);
						xertifyInit.set("codigo",__nextCode);
					}

					Codes.push(xertifyInit.get("code"));

					console.log("codigo actual PPTX::> ",xertifyInit.get("code"));

					const generation_childrenPPTX = uuidv4();
					const sqlInsertGenerationChild = `INSERT INTO T_CERTIFICATES_GENERATION_CHILDREN(T_CERTIFICATES_GENERATION_CHILDREN_ID,T_CERTIFICATES_GENERATION_ID,STATUS,CV_ID,TEMPLATE_ID,CODECERTIFICATE,DATE_GENERATION) VALUES('${generation_childrenPPTX}','${generation_id}','P','${CV_ID}','${__Template.T_ID}','${xertifyInit.get("code")}',NOW())`;

					const resChildren = await mysql.query(sqlInsertGenerationChild);
					console.log("resChildren::> ",resChildren);


					templatesLoaded[index].code = xertifyInit.get("code");

					qtyTemplates[__Template.resTempl.TYPE]++;

					const qrMetadata = this.parserQRData(qrParsed,__Template.T_ID);
					console.log("qrMetadata PPTX::> ",qrMetadata);
					
					const pptxTemplate = Buffer.from(templatesFiles[__Template.name].Body).toString('base64');
					let jsonPPTX = JSON.parse(Buffer.from(templatesFiles[`jsonPptx${__Template.T_ID}`].Body).toString('utf8'));
					jsonPPTX = jsonPPTX[jsonPPTX.defaultLanguage];
					const _bcr = jsonPPTX.BCR || BRC_default;
					const _soc = jsonPPTX.SOC;

					let resPPTX;
					try{
						resPPTX = await RequestService.fillPPTXPlaceHolders({
							pptxTemplate: pptxTemplate,
							xertifyInit: xertifyInit,
							qrbase64: qrbase64,
							qrMetadata: qrMetadata
						});
					}catch(e) {
						console.log("error doing Placeholders::> ",e);
						// throw new Error("error doing Placeholders");
						return;
					}

					const PPTX = resPPTX.data.pptx;
					let file;
					try{
						const resPost = await RequestService.ConvertPPTXToPDF(PPTX);
						let pdfData = resPost.data;

						console.log("pdfData::> ",pdfData);

						url = pdfData.Files[0].Url;

						const buf = await axios.get(url, {responseType: 'arraybuffer'});
						file = Buffer.from(buf.data).toString('base64');
						const ProcData = JSON.parse(_resProcBranch[0]["gCBAGI"]);
						let sha256Pdf;
						if(digitalSignature >= 1) {
							const dataSign = await RequestService.signPDF(file,acc_id,ProcData.companyName);
							const fileSigned = dataSign.data.fileResult;
							await Azure.saveFile(xertifyInit.get("code"),fileSigned);
							sha256Pdf = Crypto.createHash('sha256').update(fileSigned).digest("hex");
							templatesLoaded[index].pdfHash = sha256Pdf;
						}else{
							sha256Pdf = Crypto.createHash('sha256').update(file).digest("hex");
							templatesLoaded[index].pdfHash = sha256Pdf;
							await Azure.saveFile(xertifyInit.get("code"),file);
						}
						
					}catch(e) {
						console.log("error doing convertion PPTX to PDF",e);
						// throw new Error("error doing convertion PPTX to PDF");
						return;
					}

					

					const JSON_FILE = await Utils.processJsonFile(blockcert,_bcr,xertifyInit,T_BLOCKCHAIN_DATA,qrbase64);
					const upFile = await AWS.uploadFile({Type:"json",Bucket:"leonardotesting",Key:`${JSONsFolder}/${acc_id}/${generation_id}/${xertifyInit.get("code")}.json`},JSON_FILE);
					console.log("upFile::> JSON_FILE",upFile);
					console.log("el soc PPTX::> ",_soc);
					let SOC_IMAGE;
					if(!!_soc) {
						SOC_IMAGE = await Utils.processSOC(_soc,xertifyInit);
					}else {
						const resSoc = await RequestService.ConvertPDFToImage(file);
    					SOC_IMAGE = resSoc.data.result;
					}
					AWS.uploadFile({Type:"base64",Bucket:"leonardotesting",Key:`certificates_images/${xertifyInit.get("code")}.jpg`},SOC_IMAGE);
					

				} else if(__Template.TYPE == "HTML") {

					if(index > 0) {
						const __nextCode = objCode.getNext().get();
						xertifyInit.set("code",__nextCode);
						xertifyInit.set("codigo",__nextCode);
					}

					Codes.push(xertifyInit.get("code"));

					console.log("codigo actual HTML::> ",xertifyInit.get("code"));

					const generation_childrenHTML = Utils.uuidv4();
					const sqlInsertGenerationChild = `INSERT INTO T_CERTIFICATES_GENERATION_CHILDREN(T_CERTIFICATES_GENERATION_CHILDREN_ID,T_CERTIFICATES_GENERATION_ID,STATUS,CV_ID,TEMPLATE_ID,CODECERTIFICATE,DATE_GENERATION) VALUES('${generation_childrenHTML}','${generation_id}','P','${CV_ID}','${__Template.T_ID}','${xertifyInit.get("code")}',NOW())`;

					const resChildren = await mysql.query(sqlInsertGenerationChild);
					console.log("resChildren::> ",resChildren);

					templatesLoaded[index].code = xertifyInit.get("code");
					qtyTemplates[__Template.resTempl.TYPE]++;

					const htmlTemplate = JSON.parse(Buffer.from(templatesFiles[__Template.name].Body).toString('utf8'));

					const qrMetadata = this.parserQRData(qrParsed,__Template.T_ID);
					console.log("qrMetadata HTML::> ",qrMetadata);
					
					const jsonTemplate = htmlTemplate[htmlTemplate.defaultLanguage];
					const _html = jsonTemplate.HTA;
					const _bcr = jsonTemplate.BCR || BRC_default;
					const _soc = jsonTemplate.SOC;
					const jsonReplaced = xertifyInit.data;
					let htmlReplaced = mustache.render(_html,jsonReplaced);
					let pdfBase64;
					htmlReplaced = htmlReplaced.replace(qrMetadata.replace,`<img style="width: ${qrMetadata.w}px; height: ${qrMetadata.h}px" src="data:image/png;base64,${qrbase64}" />`);
					try{
						resPost = await RequestService.ConvertHTMLToPDF(htmlReplaced);
						pdfBase64 = resPost.data.pdf;
						const ProcData = JSON.parse(_resProcBranch[0]["gCBAGI"]);
						let sha256Pdf;
						if(digitalSignature >= 1) {
							const dataSign = await RequestService.signPDF(pdfBase64,acc_id,ProcData.companyName)
							const fileSigned = dataSign.data.fileResult;
							await Azure.saveFile(xertifyInit.get("code"),fileSigned);
							sha256Pdf = Crypto.createHash('sha256').update(fileSigned).digest("hex");
							templatesLoaded[index].pdfHash = sha256Pdf;
						}else{
							await Azure.saveFile(xertifyInit.get("code"),pdfBase64);
							sha256Pdf = Crypto.createHash('sha256').update(pdfBase64).digest("hex");
							templatesLoaded[index].pdfHash = sha256Pdf;
						}

					}catch(e) {
						console.log("error doing convertion HTML to PDF",e);
						// throw new Error("error doing convertion HTML to PDF");
						return;
					};
					
					const JSON_FILE = await Utils.processJsonFile(blockcert,_bcr,xertifyInit,T_BLOCKCHAIN_DATA,qrbase64);
					const upFile = await AWS.uploadFile({Type:"json",Bucket:"leonardotesting",Key:`${JSONsFolder}/${acc_id}/${generation_id}/${xertifyInit.get("code")}.json`},JSON_FILE);
					console.log("upFile::> JSON_FILE",upFile);
					console.log("el soc HTML::> ",_soc);
					let SOC_IMAGE = "";
					if(!!_soc) {
						SOC_IMAGE = await Utils.processSOC(_soc,xertifyInit);
					}else {
						const resSoc = await RequestService.ConvertPDFToImage(pdfBase64);
    					SOC_IMAGE = resSoc.data.result;
					}
					AWS.uploadFile({Type:"base64",Bucket:"leonardotesting",Key:`certificates_images/${xertifyInit.get("code")}.jpg`},SOC_IMAGE);
				}
			
				const SQLupdateChildrenFinish = `UPDATE T_CERTIFICATES_GENERATION_CHILDREN SET STATUS = 'E' WHERE CV_ID = '${CV_ID}' AND TEMPLATE_ID = '${__Template.T_ID}' AND CODECERTIFICATE = '${xertifyInit.get("code")}'`;

			});
		}
	});
	
	const __paramSQS = {
		MessageBody: 'SQS Services for Notification email,sms,whatsapp',
		DelaySeconds: 5,
		MessageAttributes: {
			"accId": {
				DataType: "String",
				StringValue: acc_id
			},
			"cvId": {
				DataType: "String",
				StringValue: CV_ID
			},
			"templatesId": {
				DataType: "String",
				StringValue: jsonData.arrTemplates.stringValue,
			},
			"certificateCode": {
				DataType: "String",
				StringValue: Codes.join(",")
			},
			"generationId": {
				DataType: "String",
				StringValue: generation_id
			},
			"prodId": {
				DataType: "String",
				StringValue: prod_id
			}
		},
		QueueUrl: "https://sqs.us-east-1.amazonaws.com/908717545587/NotificationSQS"
	}
	try{
		const dataQueue = await AWS.callSQS(__paramSQS);
		console.log("dataQueue Enviada ",dataQueue);
	}catch( err) {
		console.log("error al enviar la cola::> ",err);
	}

	const procedureParams = {
		generation_id: generation_id,
		staffId: staff_id,
		prodId: prod_id,
		acc_idCompany: acc_id,
		folder: JSONsFolder,
		bucket: 'leonardotesting',
		CV_ID: CV_ID
	};

	const _PROCEDURE_DATA_JSON = Utils.processProcedureData(procedureParams,PROCEDURE_DATA_JSON,xertifyInit,qtyTemplates,templatesLoaded);
	console.log("_PROCEDURE_DATA_JSON::> ",_PROCEDURE_DATA_JSON);
	
	const lastProcedure = `SELECT generationCertificatesNewStorage('${JSON.stringify(_PROCEDURE_DATA_JSON)}')`;
	const sqlLast = await mysql.query(lastProcedure);

	console.log("lastProcedure::> ",lastProcedure);
	console.log("sqlLast::> ",sqlLast);

	console.log("termino processTemplate");
}


/**
 * @method
 * @desc Process the request for Xertify
 * @param {Array<{...,body:{arrCVs:string,generation_id:string,acc_id:string,prod_id:string,arrTemplates:string}}>} _event
 * @return {void}
 **/

module.exports.processData = async (_event) => {

	var errors = [];
	var success = [];

	// console.log("_event PROCESS_DATA::> ",_event);
	var __jsonData = JSON.parse(_event.body);
	// console.log("_event.body PROCESS_DATA::> ",_event.body);

	console.log("__jsonData PROCESS_DATA::> ",__jsonData);
	
	console.log("empezo processData");
	// console.time("processData");
	console.log("__jsonData.arrCVs::> ",__jsonData.arrCVs);
	var arrCVs = __jsonData.arrCVs;
	console.log("__jsonData.generation_id::> ",__jsonData.generation_id);
	var generation_id = __jsonData.generation_id;
	console.log("__jsonData.acc_id::> ",__jsonData.acc_id);
	var acc_id = __jsonData.acc_id;
	console.log("__jsonData.prod_id::> ",__jsonData.prod_id);
	var prod_id = __jsonData.prod_id;
	console.log(" __jsonData.staff_id::> ",__jsonData.staff_id);
	var staff_id =  __jsonData.staff_id;
	var notifications = JSON.stringify(__jsonData.notifications);
	var name =  __jsonData.name;

	console.log("__jsonData.arrTemplates::> ",__jsonData.arrTemplates);
	var _template = __jsonData.arrTemplates.map(a => a.T_ID).join(",");
	var _QRTemplate = __jsonData.arrTemplates.map(a => (`${a.T_ID}:${a.QR.x}|${a.QR.y}|${a.QR.h}|${a.QR.w}|${a.QR.replace}`)).join(",");

	if(!!generation_id){
		const sqlStatus = `SELECT COUNT(*) AS existe FROM T_CERTIFICATES_GENERATION WHERE STATUS = 'R' AND CERTIFICATES_GENERATION_ID = '${generation_id}'`;
		const resStatus = await mysql.query(sqlStatus);
		const statusActual = resStatus[0].existe;
		if(statusActual == 0) {
			console.log(`EL GENERATION ID ${generation_id} NO ESTA EN PROCESO PROCESS DATA`);
			const response = {
        statusCode: 400,
        body: JSON.stringify({"processed":false})
	    };
	    return response;
		}
	}

	const sqlPlan = `SELECT (TYPE_A_TOTAL - TYPE_A_SPENT) as A,(TYPE_B_TOTAL - TYPE_B_SPENT) as B,(TYPE_C_TOTAL - TYPE_C_SPENT) as C,(TYPE_D_TOTAL - TYPE_D_SPENT) as D,ON_DEMAND FROM T_PLAN_CUSTOMER WHERE ACC_ID = '${acc_id}'`;
	resPlan = await mysql.query(sqlPlan);
	
	if(resPlan[0].B > 0 || resPlan[0].ON_DEMAND == 1) {
		const _generation_id = generation_id || uuidv4();
		let sqlInsGeneration = "";
		if(!generation_id) {
			const pending_records = parseInt(arrCVs.length) * parseInt(__jsonData.arrTemplates.length);
			console.log("pending_records::> ",pending_records);
			const _template1 = __jsonData.arrTemplates[0].T_ID;
			sqlInsGeneration = `INSERT INTO T_CERTIFICATES_GENERATION(CERTIFICATES_GENERATION_ID,PENDING_RECORDS,STATUS,DATE_EXECUTION,COMPANY_STAFF_ACCOUNT,DATE_CREATION,NAME,PROD_ID,TEMPLATE_ID,NOTIFICATIONS_NEW) 
			VALUES('${_generation_id}','${pending_records}','R',NOW(),'${staff_id}',NOW(),'${name}','${prod_id}','${_template1}','${notifications}')`;	
			console.log("sqlInsGeneration::> ",sqlInsGeneration);
			const resGeneration = await mysql.query(sqlInsGeneration);
			console.log("resGeneration::> ",resGeneration);
		}

		await Utils.asyncForEach(arrCVs, async (__CompanyGC,index) => {

			const __paramSQS = {
				MessageBody: 'SQS Services for process Template',
				DelaySeconds: 5,
				MessageAttributes: {
					"CV_ID": {
						DataType: "String",
						StringValue: __CompanyGC.CV_ID
					},
					"arrTemplates": {
						DataType: "String",
						StringValue: _template,
					},
					"arrQrData": {
						DataType: "String",
						StringValue: _QRTemplate,	
					},
					"acc_id": {
						DataType: "String",
						StringValue: acc_id
					},
					"generation_id": {
						DataType: "String",
						StringValue: _generation_id
					},
					"prod_id": {
						DataType: "String",
						StringValue: prod_id
					},
					"staff_id": {
						DataType: "String",
						StringValue: staff_id
					},
				},
				QueueUrl: "https://sqs.us-east-1.amazonaws.com/908717545587/firstSQS"
			}
			try {
				const dataSQS = await AWS.callSQS(__paramSQS);
				success.push("Cola firstSQS enviaada con exito "+dataSQS.MessageId);
				console.log("dataSQS enviada con exito::> ",dataSQS);
			}catch(error) {
				errors.push("error en firstSQS::> "+error);
				console.log("error en firstSQS::> ",error);
			}

			// const __params = [];
			// __params.Records = [];
			// __params.Records.push(__paramSQS);

			// await this.processTemplate(__params);
		});
		console.log("termino processData");
		// console.timeEnd("processData");
		// resolve(true);
	}
	const response = {
    statusCode: 200,
    body: JSON.stringify({"processed":true})
  };
  return response;
}

module.exports.sendCertificates = async (event) => {

	console.log("INIT PROCESS::::::::::::::::::::::::::::::::::::");
	//event.Records.forEach(async (record) => {
	var indexCheck = 0;
	var defaultValues;
	for (const record of event.Records) {	
		console.log("entro indexCheck "+indexCheck+" veces");
		indexCheck++;

		console.log("INIT PROCESS::::::::::::::::::::::::::::::::::::"+event.Records.length);
		console.log("Message Id: " + record.messageId);
		console.log("Attributes:::::" + JSON.stringify(record.messageAttributes));
		let resultPerson = [];
		let emission = [];
		let sms = false;
		let email = false;
		let whatsapp = false;
		try {
			resultPerson = await mysql.query(`select generationCVsIdsReport('${record.messageAttributes[certificateEmail.cvId].stringValue}') as person`);
			emission = await mysql.query(`SELECT * FROM T_CERTIFICATES_GENERATION WHERE CERTIFICATES_GENERATION_ID='${record.messageAttributes[certificateEmail.generationId].stringValue}'`);
		} catch (error) {
			console.log("Error getting customer and Emission " + error);
		}


		if (emission[0].NOTIFICATIONS_NEW != null && emission[0].NOTIFICATIONS_NEW != "") {
			let values = JSON.parse(emission[0].NOTIFICATIONS_NEW);
			console.log('sms---------------------->'+values.sms)
			console.log('email---------------------->'+values.email)
			console.log('whatsapp---------------------->'+values.whatsapp)
			if (values.sms == 1 || '1'== values.sms) {
				sms = true;
			}
			if (values.email == 1 || '1'== values.email) {
				email = true;
			}
			if (values.whatsapp == 1 || '1'== values.whatsapp) {
				whatsapp = true;
			}
		} else if (emission[0].NOTIFICATIONS) {
			sms = true;
			email = true;
		}

		console.log('BARCELONA---------------------->'+whatsapp)

		if (resultPerson.length > 0) {

			// console.log("SAMSUNG====A===="+resultPerson.length)
			/**
			* Code for certificates
			*/
			let arrCodeCertificates = await record.messageAttributes[certificateEmail.certificateCode].stringValue.split(",");

			// let currentCertificate = arrCodeCertificates;

			let responseEmail = {};
			let responseSms = {};
			// try {

				/**
			 * Branch
			 */
				let resultBranchInfo = await mysql.query(`select generationCompanyBranchAndGroupInformation('${record.messageAttributes[certificateEmail.prodId].stringValue}') as branchInfo`);

				console.log("SAMSUNG====B===="+JSON.stringify(resultBranchInfo))
				/**
				 * Templates
				 */
				// let idTemplateCondition = await (await Utils.buildInClause(record.messageAttributes[certificateEmail.templatesId].stringValue.split(",")));
				// let listTemplatesID = await mysql.query(`SELECT tem.NAME,tem.DESCRIPTION,tem.ACC_ID as accId,pref.TEMPLATE_ID, JSON_OBJECTAGG(pref.CPRE_DES,pref.CPRE_VALUE) as jsonValues , JSON_OBJECTAGG(pref.CPRE_DES,pref.PARAMETERS) as jsonParameters from T_TEMPLATE_PREFERENCE pref left join T_TEMPLATE tem on tem.TEMPLATE_ID=pref.TEMPLATE_ID where pref.LANGUAGE=tem.DEFAULT_LANG and pref.TEMPLATE_ID in (${idTemplateCondition}) group by pref.TEMPLATE_ID`);
		

				let listTemplatesID = [];
		
				const arrTemplates = [];
				for(const arrT of record.messageAttributes[certificateEmail.templatesId].stringValue.split(",")){
					arrTemplates.push({T_ID:arrT});
				} 
				const tmpTempl = await this.getTemplatesAWS(arrTemplates,record.messageAttributes[certificateEmail.accId].stringValue);
				var templatesFiles = tmpTempl[0];
				var templatesLoaded = tmpTempl[1];

				templatesLoaded.forEach( (__template,index) => {
				
					//validamos solo las que son JSON
					let jsonData;
					if(__template.TYPE == "JSONPPTX") {
						jsonData = JSON.parse(Buffer.from(templatesFiles[__template.name].Body).toString('utf8'));
						listTemplatesID.push({"NAME":jsonData.templateName,"jsonValues":jsonData[jsonData.defaultLanguage]});
					}else if(__template.TYPE == "HTML") {
						jsonData = JSON.parse(Buffer.from(templatesFiles[__template.name].Body).toString('utf8'));
						listTemplatesID.push({"NAME":jsonData.templateName,"jsonValues":jsonData[jsonData.defaultLanguage]});
					}			
					
				});

				console.log("listTemplatesID::> ",listTemplatesID);

				/**
				 * Convert string to json
				 */
				let personCertificate = JSON.parse(resultPerson[0].person);
				/**
				 * Iterate templates
				 */

				let branchInfoJson = JSON.parse(resultBranchInfo[0].branchInfo);
				console.log("branchInfoJson::> ",branchInfoJson.accId);
				const _defaultValues = await mysql.query(`select JSON_OBJECTAGG(tcp.KEY_PREF ,tcp.DEFAULT_VALUE) as defaultValues from T_CUST_PREF tcp where ACC_ID='${branchInfoJson.accId}' and DEFAULT_VALUE is not null and DEFAULT_VALUE <>''`);
				defaultValues = JSON.parse(_defaultValues[0].defaultValues);
				console.log("SAMSUNG====C===="+personCertificate[0])

				const xertifyInit = this.initXertifyData(personCertificate[0],branchInfoJson);
				console.log("email======== "+email)
				if(email) {
					try {
						responseEmail = await processContentService.sendEmailContent(arrCodeCertificates, xertifyInit, listTemplatesID, defaultValues,emission[0]);
						console.log("Email result messageId::" + JSON.stringify(responseEmail.mapHtml));
					}catch(e) {
						console.log("Error sending email::> ",e);
					}
				}

				for (var i = 0; i < listTemplatesID.length; i++) {
					// currentCertificate = arrCodeCertificates[i];

					console.log("SAMSUNG====D===="+listTemplatesID.length)	
					
					console.log("defaultValues::> ",defaultValues);					

					let staticValues = JSON.parse(personCertificate[0].staticValues); 
					console.log("Email firstname::" + JSON.stringify(staticValues));

					if(sms) {
						responseSms = await processContentService.processSms(personCertificate[0], branchInfoJson, arrCodeCertificates[i], listTemplatesID[i], responseEmail.mapHtml);
						console.log("SMS ID::" + responseSms.MessageId);
						await processContentService.processStatusDelivery(responseEmail.messageId, responseSms.MessageId, arrCodeCertificates[i]);
					}

					if (whatsapp) {
						try{
							console.log("before whatsapp:::> ",branchInfoJson.companyName, arrCodeCertificates[i], staticValues);

							await this.requestSendWhatsapp(branchInfoJson.companyName, arrCodeCertificates[i], staticValues);
						}catch (errorss) {
								console.log("Error processing message WHATSAPP " + errorss);
						}
					}

				}
			// } catch (error) {
			// 	console.log("Error processing message " + error);
			// 	await processContentService.processStatusDelivery(responseEmail.messageId, responseSms.MessageId, currentCertificate);
			// }

			console.log("End Message Id: " + record.messageId);
		}


	}//);

	console.log("FINISH PROCESS::::::::::::::::::::::::::::::::::::");
	return {};
};

module.exports.requestSendCertificates = async (event) => {
	console.log("Http Rest Message Id ");
	return await this.sendCertificates(JSON.parse(event.body));
};

module.exports.requestSendWhatsapp = async (companyName, codeCertificates, staticValues) => {
	console.log("Http requestSendWhatsapp ");
	let codePhone = staticValues.phone.replace(/ /g, "");
	if (!codePhone.startsWith('+')) {
		codePhone = '+57' + codePhone;
	}
	var _request = require('request');


	let bodyTxt='Estimado(a) ' + staticValues.firstname + ' ' + staticValues.lastname + ', ' + companyName +
			' te ha emitido un certificado a través de Xertify el cual puede ser consultado en el siguiente link https://wallet.xertify.co/certificates/' + codeCertificates;

	if(companyName.includes("Vacuna")){
		bodyTxt="Hola, MiVacunaDigital te ha emitido tu credencial digital a través de la plataforma Xertify la cual puede ser consultada en el siguiente link https://wallet.xertify.co/certificates/"+codeCertificates+" . Recuerda que esto es una iniciativa privada independiente de cualquier gobierno. Cualquier inquietud por favor escribir al siguiente whatsapp +573227499638 https://wa.me/+573227499638 o al correo electrónico admin@mivacunadigital.com ."
	}

	var options = {
		'method': 'POST',
		'url': 'https://api.twilio.com/2010-04-01/Accounts/AC35d123303b3df8704f80d40f509506e4\n/Messages.json',
		'headers': {
			'Authorization': 'Basic QUMzNWQxMjMzMDNiM2RmODcwNGY4MGQ0MGY1MDk1MDZlNDo0ZjJjZjlmOGIzNDA5MTM0NjdiOTYwMDFkOGJhODQ5Mg==',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		form: {
			'From': 'whatsapp:+12169254102',
			'Body': bodyTxt,
			'To': 'whatsapp:'+ codePhone
		}
	};

	console.log('DOMINICAN REPUBLIC-------------->'+bodyTxt)

	_request(options, function (error, response) {
		if (error) { 
			// throw new Error(error);
			console.log("error requestSendWhatsapp::>",error);
		}
		console.log(response.body);
	});
};

module.exports.getCountries = async () => {
	var _request = require('request');
	var options = {
		'method': 'GET',
		'url': 'https://restcountries.eu/rest/v2/all?fields=callingCodes;name;alpha3Code',
		'headers': {
			'Content-Type': 'application/json'
		},
		body: ''
	};
	_request(options, function (error, response) {
		if (error){ 
			//throw new Error(error);
			console.log("error getCountries::>",error);
		}
		// console.log('::::::::::::::::::::::::::::::::', response.body);
	});
};


//TODO
/**
 * HACER EL MESSAGE BATCH CON MAS DE 10 COLAS PARA PROBAR SU FUNCIONAMIENTO
*/