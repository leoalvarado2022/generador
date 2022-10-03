process.env.PROFILE = process.env.PROFILE || "dev";

const _configJSON = require("./connection.dev.json");

global.config_  = global.config_ || {
    connectionDatabase:{
        host: _configJSON.host,
        user: _configJSON.user,
        password: _configJSON.password,
        database: _configJSON.database,
        connectTimeout  : _configJSON.connectTimeout,
        acquireTimeout  : _configJSON.acquireTimeout,
        timeout         : _configJSON.timeout
    },
    aws:{
        awsKey:_configJSON.awsKey,
        awsSecret:_configJSON.awsSecret,
        urlProcessData: _configJSON.urlSQSProcessData,
        arnProcessData: _configJSON.arnSQSProcessData,
        awsBucket:_configJSON.awsBucket,
        awsKeyTemplate:_configJSON.awsKeyTemplate,
        awsKeySOCimage:_configJSON.awsKeySOCimage
    },
    azure: {
        azureUrl:_configJSON.azureUrl,
        azureContainer:_configJSON.azureContainer,
        azureKey:_configJSON.azureKey,
        azureAccount:_configJSON.azureAccount,
        azureFullUrl:_configJSON.azureFullUrl,
    }
};