"use strict";

let mysql_ = require("mysql");
require('../configuration/config');
/**
 * Connection object for Mysql database
 */
let getObjectConnection = () => {
  return {
    host: global.config_.connectionDatabase.host,
    user: global.config_.connectionDatabase.user,
    password: global.config_.connectionDatabase.password,
    database: global.config_.connectionDatabase.database,
    connectTimeout  : parseFloat(global.config_.connectionDatabase.connectTimeout),
    // acquireTimeout  : parseFloat(global.config_.connectionDatabase.acquireTimeout),
    // timeout         : parseFloat(global.config_.connectionDatabase.timeout)
  };
};

module.exports.handleConnection = () => {
  const objConn = getObjectConnection();
  const connectionMysql = mysql_.createConnection(objConn);

  connectionMysql.connect( (err) => {
    if(err) {
      console.log("error on db::> ",err);
      setTimeout(function(){
        this.handleConnection()
      },2000);
    }
  });

  connectionMysql.on('error', function(err) {
    console.log('db error::> ', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      this.handleConnection();                         
    } else {                                      
      throw err;                                  
    }
  });

  return connectionMysql;
}

/**
 * This function execute a  query
 * @param {Query for execute} sql
 */
module.exports.query = async (sql) => {
  
  return new Promise( (resolve,rejected) => {
    const connectionMysql = this.handleConnection();

    connectionMysql.query(sql, function (error, results, fields) {
      if (error){ 
        console.log("error de MYSQL::> ",error);
        rejected(error);
      }
      resolve(results);
    });

    connectionMysql.end();
  });
};
