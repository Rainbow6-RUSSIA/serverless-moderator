import { aws } from "dynamoose";
import { region, accessKeyId, secretAccessKey, endpoint } from "../env.js";

aws.sdk.config.update({
    accessKeyId,
    secretAccessKey,
    region,
    dynamodb: { endpoint },
});
