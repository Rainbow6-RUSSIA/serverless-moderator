export const isDev = process.env.NODE_ENV === "development";

export const discordPublicKey = process.env.DISCORD_PUBLIC_KEY;

export const accessKeyId = process.env.DB_ACCESS_KEY_ID;
export const secretAccessKey = process.env.DB_SECRET_ACCESS_KEY;
export const region = process.env.DB_REGION ?? "ru-central1";
export const endpoint = process.env.DB_ENDPOINT;
