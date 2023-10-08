import { SQS } from "@aws-sdk/client-sqs";
import { env } from "../../env.js";

export const sqs = new SQS({
  credentials: {
    accessKeyId: env.SQS_ACCESS_KEY_ID,
    secretAccessKey: env.SQS_SECRET_ACCESS_KEY,
  },
  region: env.SQS_REGION,
  endpoint: env.SQS_ENDPOINT,
});
