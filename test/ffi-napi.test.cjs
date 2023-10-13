new (require("worker_threads").Worker)(`
  require("fs").writeFileSync("./test/dump.json",
    require("ffi-napi")
      .Library("./lib/libr6dissect-windows-amd64.dll",
        { dissect_read: ["string", ["string"]] }
      ).dissect_read("./test/Match-2023-09-23_12-03-31-55-R07.rec")
  )`,
  { eval: true }
)