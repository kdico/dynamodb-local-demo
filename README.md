# DynamoDB Local Demo

A minimal template repository about AWS tools for working with a local DynamoDB, NoSQL Workbench, and a Lambda function.

This is part of the Medium article [AWS NoSQL Workbench & DynamoDB Local](https://medium.com/gecogeco/aws-nosql-workbench-dynamodb-local-d47cea1e7234?source=friends_link&sk=542fc087e07321721d47ca2d81ca344a) which you can view for free.

## Requirements

* Docker Compose
* AWS NoSQL Workbench (Optional)
* AWS CLI (Optional)
* A reasonable amount of free disk space for Docker images.

## Docker Compose Services

* `dynamodb-local`
  * This is the local DynamoDB service without pre-existing data.
  * Accessible from the endpoint `http://localhost:8000` when using the AWS CLI or SDK.
  * For the rest of the services, the endpoint is `http://dynamodb-local:8000`.
  * Uses `amazon/dynamodb-local:1.17.0` from October 12, 2021 as the base image. See [amazon/dynamodb-local](https://hub.docker.com/r/amazon/dynamodb-local/tags).
* `cli`
  * This service creates a table in the `dynamodb-local` service using `./cli/create-table.sh` along with a GSI defined in `./cli/gsi.json`.
  * After `./cli/create-table.sh` executes, this service exits.
  * Uses `amazon/aws-cli:2.3.6` from November 12, 2021 as the base image. See [amazon/aws-cli](https://hub.docker.com/r/amazon/aws-cli/tags).
* `function`
  * A Lambda function you can `POST` to from `http://localhost:9000/2015-03-31/functions/function/invocations`. See [Invoke Lambda Function](#invoke-lambda-function).
  * Written in Node.js.

## Setup

Provided you've got Docker installed and running, spin up the services from `docker-compose.yml`.
```
cd ./dynamodb-local-demo/
docker-compose up
```

The following events should happen.
1. `dynamodb-local` service starts.
2. `cli` service creates the `DemoTable` and `GSI1Index`.
3. `cli` service exits gracefully.
4. `function` service starts.

## Invoke Lambda Function

The function can be invoked using `curl` as below.
```
curl --location --request POST 'http://localhost:9000/2015-03-31/functions/function/invocations' \
--header 'Content-Type: application/json' \
--data-raw '{
    "Item": {
        "Title": "Hello, world.",
        "Author": "John Doe, Jane Doe",
        "ReleaseDate": "2021/11/18",
        "ISBN10": "1234567890",
        "Version": "2"
    }
}'
```

If you get a `200` response, you can verify the new item you've added by from the *Operation builder* menu of the NoSQL Workbench.

For `DemoTable` and with the way the `function` service was written, a book's uniqueness depends on its `ISBN10` and `ReleaseDate` values.
If a combination of these values were already submitted, the function should return a `500` response with a `ConditionalCheckFailedException` message.
See [Error Handling with DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html).

Books are suffixed by `Book` and are automatically prefixed with a number inclusively between 1 and 200.
This numeric prefix is computed from the `ISBN10` value for partitioning.
See [Using Write Sharding to Distribute Workloads Evenly](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-sharding.html).
