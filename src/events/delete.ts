import { httpWrap } from '@helpers';
import { APIGatewayEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });

export default httpWrap<APIGatewayEvent>(async event => {
  console.info('Deleting item with key: ', JSON.stringify(JSON.parse(event.body)));

  try {
    const dynamoResponse = await dynamo
      .delete({
        TableName: process.env.ORGANIZATIONS_TABLE_NAME,
        Key: JSON.parse(event.body)
      })
      .promise();
    if (dynamoResponse.$response.data) {
      return {
        statusCode: 200,
        body: JSON.stringify(dynamoResponse.$response.data)
      };
    }
    return {
      statusCode: 204,
      body: { message: 'Item not found' }
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: { error: e }
    };
  }
});
