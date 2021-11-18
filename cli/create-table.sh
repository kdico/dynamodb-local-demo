aws dynamodb create-table \
  --table-name DemoTable \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --endpoint-url http://dynamodb-local:8000 \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --global-secondary-indexes file://gsi.json
