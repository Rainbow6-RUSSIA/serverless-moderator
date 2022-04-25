resource "yandex_iam_service_account" "deployer" {
  name        = "r6mod"
  description = "service account to manage r6mod resources"
}

