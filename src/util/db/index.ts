import dynamoose from "dynamoose";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { env } from "../../env.js";

export const ddb = new DynamoDB({
  credentials: {
    accessKeyId: env.DDB_ACCESS_KEY_ID,
    secretAccessKey: env.DDB_SECRET_ACCESS_KEY,
  },
  region: env.DDB_REGION,
  endpoint: env.DDB_ENDPOINT,
});

dynamoose.aws.ddb.set(ddb);
