resource "yandex_ydb_database_serverless" "storage" {
  name = "r6mod-storage-${terraform.workspace}"
  lifecycle {
    prevent_destroy = true
  }
}
