import { httpWrap } from '@helpers';
import { APIGatewayEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });

export default httpWrap<APIGatewayEvent>(async event => {
  const body = JSON.parse(event.body);
  console.info('Updating item with key: ', JSON.stringify(body.key));

  const params = {
    TableName: process.env.ORGANIZATIONS_TABLE_NAME,
    Key: body.key,
    UpdateExpression: 'set info.rating = :r, orgId=:o, name=:n, address=:a, revenue=:r',
    ExpressionAttributeValues: {
      ':o': body.new.orgId,
      ':n': body.new.name,
      ':a': body.new.address,
      ':r': body.new.revenue ? body.new.revenue : ''
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    const dynamoResponse = await dynamo.update(params).promise();
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
