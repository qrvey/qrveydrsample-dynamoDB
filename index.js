const https = require("https");
const DynamoDBDAO = require("./DynamoDBDAO");
const config = require("./config.json");

//use scan or query structure.
//Scan documentation: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
//Query documentation: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
const dynamoDBParams = {
  TableName: config.tableName,
  Select: "ALL_ATTRIBUTES",
};

//Change this variable to false to use query
const isScanTable = true;

let result;
let keepQuerying = true;

const run = async () => {
  while (keepQuerying) {
    if (isScanTable) result = await DynamoDBDAO.scanTable(dynamoDBParams);
    else result = await DynamoDBDAO.queryTable(dynamoDBParams);
    if (result.Items) {
      await sendDataToDataRouter(result.Items);
      if (result.LastEvaluatedKey) {
        dynamoDBParams.ExclusiveStartKey = result.LastEvaluatedKey;
      } else {
        keepQuerying = false;
      }
    } else {
      keepQuerying = false;
    }
  }
};

//Loading data via postdata API.
const sendDataToDataRouter = async (data) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "POST",
      hostname: config.postdataurl,
      path: "/Prod/dataload/v1/postdata",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apikey,
      },
      port: 443,
    };
    var req = https.request(options, function (res) {
      var chunks = [];
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log("the jobid body" + body.toString());
        return resolve(body.toString());
      });
      res.on("error", (error) => {
        console.error("Error post data:", error);
        return reject(error);
      });
      console.log("POST Call Status:", res.statusCode);
    });
    var postData = JSON.stringify([
      {
        metadataId: config.metadataId,
        data: data,
      },
    ]);
    req.write(postData);
    req.end();
  });
};
run();
