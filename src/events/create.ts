import { httpWrap } from '@helpers';
import { APIGatewayEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient({ apiVersion: '2012-10-08' });

export default httpWrap<APIGatewayEvent>(async event => {
  console.info('Creating item: ', event.body);

  try {
    const dynamoResponse = await dynamo
      .put({
        TableName: process.env.ORGANIZATIONS_TABLE_NAME,
        Item: JSON.parse(event.body)
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify(dynamoResponse.$response.data)
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: { error: e }
    };
  }
});

import { Organization } from '@types';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export const handleCreate = (client: DocumentClient, table: string, organization: Organization): Promise<any> => {
  console.info('Creating item: ', JSON.stringify(organization));

  return client
    .put({
      TableName: table,
      Item: organization
    })
    .promise();
};
