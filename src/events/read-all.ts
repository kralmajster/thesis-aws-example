import { httpWrap } from '@helpers';
import { APIGatewayEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });

export default httpWrap<APIGatewayEvent>(async () => {
  console.info('Listing all items');

  try {
    const dynamoResponse = await dynamo
      .scan({
        TableName: process.env.ORGANIZATIONS_TABLE_NAME
      })
      .promise();
    if (dynamoResponse.Items) {
      return {
        statusCode: 200,
        body: JSON.stringify(dynamoResponse.Items)
      };
    }
    return {
      statusCode: 204,
      body: { message: 'Table empty' }
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: { error: e }
    };
  }
});
