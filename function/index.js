const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { Chance } = require('chance');
const { v1: uuidv1 } = require('uuid');

const TABLE_NAME = 'DemoTable';
const DELIMITER = '#';

const BOOK_PREFIX = 'Book';
const AUTHOR_PREFIX = 'Author';

const MIN_SUFFIX = 1;
const MAX_SUFFIX = 200;

const MARSHALL_OPTIONS = Object.freeze({
  convertEmptyValues: true,
  removeUndefinedValues: true
});

const DYNAMODB_CLIENT_CONFIG = (endpoint => {
  if (endpoint) {
    return { endpoint };
  }
})(process.env.DYNAMODB_ENDPOINT);

function pkfy(prefix, ...seeds) {
  const suffix = new Chance(...seeds)
    .natural({
      min: MIN_SUFFIX,
      max: MAX_SUFFIX
    });

  return [prefix, suffix].join(DELIMITER);
}

async function send(command) {
  const client = new DynamoDBClient(DYNAMODB_CLIENT_CONFIG);

  try {
    console.info('Command:', JSON.stringify(command));

    const response = await client.send(command);
    console.info('Response:', JSON.stringify(response));

    return response;
  } catch (error) {
    console.error('Send Failed:', JSON.stringify(error));

    throw error;
  } finally {
    client.destroy();
  }
}

async function handler(event, context) {
  console.info('Event:', JSON.stringify(event));
  console.info('Context:', JSON.stringify(context));

  try {
    if (event.Item) {
      const command = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: marshall(
          {
            ...event.Item,
            PK: pkfy(BOOK_PREFIX, event.Item.ISBN10),
            SK: [event.Item.ReleaseDate, event.Item.ISBN10].join(DELIMITER),
            GSI1PK: pkfy(AUTHOR_PREFIX, event.Item.Author),
            GSI1SK: [event.Item.Author, uuidv1()].join(DELIMITER)
          },
          MARSHALL_OPTIONS
        ),
        ConditionExpression: 'attribute_not_exists(PK)'
      });

      const response = await send(command);

      return { code: response.$metadata.httpStatusCode };
    }

    return { code: 400, message: 'Item is required.' };
  } catch (error) {
    return { code: 500 };
  }
}

module.exports = {
  handler
};
