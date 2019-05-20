import { httpWrap } from '@helpers';
import { APIGatewayEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });

export default httpWrap<APIGatewayEvent>(async event => {
  try {
    const dynamoResponse = await dynamo
      .get({
        TableName: process.env.ORGANIZATIONS_TABLE_NAME,
        Key: JSON.parse(event.body)
      })
      .promise();
    if (dynamoResponse.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(dynamoResponse.Item)
      };
    }
    return {
      statusCode: 204,
      body: { message: 'item not found' }
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: { error: e }
    };
  }
});
