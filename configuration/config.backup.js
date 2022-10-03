process.env.PROFILE = process.env.PROFILE || "dev";

global.config_  = global.config_ || {
    connectionDatabase:{
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        connectTimeout  : process.env.MYSQL_CONNECT_TIMEOUT,
        acquireTimeout  : process.env.MYSQL_ACQUIRE_TIMEOUT,
        timeout         : process.env.MYSQL_TIMEOUT
    },
    aws:{
        awsKey:process.env.AWS_CREDENTIALS_KEY,
        awsSecret:process.env.AWS_CREDENTIALS_SECRET,
        urlProcessData: process.env.SQS_URL_NOTIFICATIONS,
        arnProcessData: process.env.SQS_ARN_NOTIFCATIONS
    },
    azure: {
        azureUrl:process.env.AZURE_URL,
        azureContainer:process.env.AZURE_CONTAINER,
        azureKey:process.env.AZURE_KEY,
        azureAccount:process.env.AZURE_ACCOUNT,
        azureFullUrl:process.env.AZURE_FULL_URL,
    }
};