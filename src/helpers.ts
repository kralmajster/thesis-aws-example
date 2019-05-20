import { Callback, Context, Handler } from 'aws-lambda';

interface AWSResponse {
  body: AWSResponseBody;
  statusCode: number;
  isBase64Encoded?: boolean;
  headers?: { [header: string]: string };
}

type AWSResponseBody = string | object | any[];

function asyncWrap<Event = any, Returned = any>(
  asyncFn: (event: Event, context: Context, callback: Callback) => Returned | Promise<Returned>,
  handleResult: (result: any, callback: Callback<any>) => void,
  handleError: (error: any, callback: Callback<any>) => void
): Handler {
  return (event: Event, context: Context, callback: Callback) => {
    try {
      const returned = asyncFn(event, context, callback);

      if (returned && returned instanceof Promise) {
        returned
          .then(result => {
            handleResult(result, callback);
          })
          .catch(error => {
            handleError(error, callback);
          });
      } else {
        handleResult(returned, callback);
      }
    } catch (error) {
      handleError(error, callback);
    }
  };
}

export function wrap<Event = any, Returned = any>(
  asyncFn: (event: Event, context: Context, callback: Callback) => Returned | Promise<Returned>
): Handler {
  return asyncWrap(asyncFn, handleCallbackResult, handleCallbackError);
}

export function httpWrap<Event = any, Returned = AWSResponse>(
  asyncFn: (event: Event, context: Context, callback: Callback) => Returned | Promise<Returned>
): Handler {
  return asyncWrap(asyncFn, handleHttpResult, handleCallbackError);
}

export function corsWrap<Event = any, Returned = AWSResponse>(
  asyncFn: (event: Event, context: Context, callback: Callback) => Returned | Promise<Returned>
): Handler {
  return asyncWrap(asyncFn, handleCorsResult, handleCallbackError);
}

function handleCallbackResult(result: any, callback: Callback) {
  callback(null, result);
}

function handleCallbackError(error: any, callback: Callback) {
  console.error(error);
  callback(error);
}

function handleHttpResult(lambdaResult: any, callback: Callback) {
  const { body, statusCode, isBase64Encoded, headers } = lambdaResult;
  callback(null, {
    statusCode,
    body: typeof body === 'object' ? JSON.stringify(body) : body,
    isBase64Encoded: isBase64Encoded || false,
    headers: headers || {}
  });
}

function handleCorsResult(lambdaResult: any, callback: Callback) {
  const { body, statusCode, isBase64Encoded, headers } = lambdaResult;
  callback(null, {
    statusCode,
    body: typeof body === 'object' ? JSON.stringify(body) : body,
    isBase64Encoded: isBase64Encoded || false,
    headers: {
      'Access-Control-Allow-Headers': `Content-Type,X-Amz-Date,Authorization,X-Api-Key`,
      'Access-Control-Allow-Methods': `*`,
      'Access-Control-Allow-Origin': `*`,
      ...headers
    }
  });
}
