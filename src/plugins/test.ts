import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get("/", (_, res) => void res.send({ hello: "get" }));
  fastify.post("/", (_, res) => void res.send({ hello: "post" }));
}
