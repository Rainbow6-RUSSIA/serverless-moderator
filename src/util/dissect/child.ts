import ffi from "ffi-napi";
import { env } from "../../env.js";

const reply = process.send?.bind(process);
if (!reply) throw new ReferenceError("Not a fork process");

const dissect = ffi.Library(env.DISSECT_LIB, {
  dissect_read: ["string", ["string"]],
});
console.log("INFO Loaded dissect lib at %s", env.DISSECT_LIB, dissect);

// TODO: idle exit
// FIXME:
// 02 окт. 04:14:48.195 Child closed null
// 02 окт. 04:14:48.194 Child disconnected
// 02 окт. 04:14:46.076 Sending read task via IPC
process.on("message", (file) => {
  console.log("DEBUG Reading at %s", file);
  if (typeof file !== "string") {
    console.log("WARN %s is not a string", file);
    return reply(null);
  }
  const res = dissect.dissect_read(file);
  if (!res) {
    console.log("WARN Empty data, returning %s", res);
    return reply(res);
  }
  return reply(JSON.parse(res));
});
