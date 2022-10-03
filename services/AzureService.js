"use strict";

require('../configuration/config');
const { BlobServiceClient,StorageSharedKeyCredential } = require('@azure/storage-blob');

const blobServiceClient = BlobServiceClient.fromConnectionString(global.config_.azure.azureFullUrl);
const containerName = global.config_.azure.azureContainer;
const containerClient = blobServiceClient.getContainerClient(containerName);
const AZURE_KEY = global.config_.azure.azureKey;
const AZURE_CONTAINER = global.config_.azure.azureContainer;
const AZURE_ACCOUNT = global.config_.azure.azureAccount;



module.exports.saveFile = async (name,file) => {
	const blobName = name;
	const blockBlobClient = containerClient.getBlockBlobClient(blobName);
	const fileUpload = Buffer.from(file,'base64');
	const uploadBlobResponse = await blockBlobClient.upload(fileUpload, fileUpload.byteLength);
	console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);
}

module.exports.dowloadFile = async (nameFile) => {
    const sharedKeyCredential = new StorageSharedKeyCredential(
        AZURE_ACCOUNT,
        AZURE_KEY,
    );
    const blobServiceClient = new BlobServiceClient(
        // When using AnonymousCredential, following url should include a valid SAS or support public access
        `https://${AZURE_ACCOUNT}.blob.core.windows.net`,
        sharedKeyCredential,
    );
    // Instance the container
    const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER);
    const blobClient = containerClient.getBlobClient(nameFile);


    // Archive the blob - Log the error codes
    try {
        /**
         * Buffer limit : 1gb
         */
        return await blobClient.downloadToBuffer();
    } catch (err) {
        // BlobArchived  Conflict (409)  This operation is not permitted on an archived blob.
        console.log(
            `requestId - ${err.details.requestId}, statusCode - ${err.statusCode}, errorCode - ${err.details.errorCode}`,
        );
        console.log(`error message - ${err.details.message}\n`);
    }


    return null;
};