resource "yandex_iam_service_account" "deployer" {
  name        = "r6mod-${terraform.workspace}"
  description = "service account to manage r6mod resources"
}

