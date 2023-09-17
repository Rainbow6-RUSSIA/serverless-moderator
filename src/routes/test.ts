import { Router } from "express";

export default function () {
  const router = Router();
  router.get("/", async (_, res) => res.send({ hello: "get" }));
  router.post("/", async (_, res) => res.send({ hello: "post" }));
  return router;
}
