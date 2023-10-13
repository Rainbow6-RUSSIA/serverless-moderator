new (require("worker_threads").Worker)(`
  require("fs").writeFileSync("./test/dump.json",
    require("koffi")
      .load("./lib/libr6dissect-windows-amd64.dll")
      .cdecl("dissect_read", "str", ["str"])
      ("./test/Match-2023-09-23_12-03-31-55-R07.rec")
  )`,
  { eval: true }
)