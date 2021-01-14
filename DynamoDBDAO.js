const AWS = require("aws-sdk");
const config = require("./config.json");

// Set the region and credential
AWS.config.update({ region: config.AWS_REGION, accessKeyId: config.ACCESS_KEY_ID, secretAccessKey: config.SECRET_ACCESS_KEY });

// Prepare dynamoDB client
const dynamoDBClient = new AWS.DynamoDB.DocumentClient();

class DynamoDBDAO {
  static async scanTable(params) {
    try {
      return await dynamoDBClient.scan(params).promise();
    } catch (e) {
      throw e;
    }
  }

  static async queryTable(params) {
    try {
      return await dynamoDBClient.query(params).promise();
    } catch (e) {
      throw e;
    }
  }
}

module.exports = DynamoDBDAO;
