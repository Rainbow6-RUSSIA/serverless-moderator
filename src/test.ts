import {Router} from "express";
const test = Router()

test.get("*", (req, res) => {
    console.log(req)
    res.send({ hello: "world" })
})

export default test