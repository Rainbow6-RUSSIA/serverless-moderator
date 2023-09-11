import { aws } from "dynamoose";
import { region, accessKeyId, secretAccessKey, endpoint } from "../env.js";

export const ddb = new aws.ddb.DynamoDB({
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    region,
    endpoint
});
