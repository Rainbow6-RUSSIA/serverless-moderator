resource "yandex_ydb_database_serverless" "storage" {
  name = "r6mod-storage"
  lifecycle {
    prevent_destroy = true
  }
}
