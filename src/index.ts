import express from "express";
import serverless from "serverless-http";
import testRoute from "./test";

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use("/test", testRoute)

const handler = serverless(app)
module.exports.handler = handler