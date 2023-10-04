resource "yandex_iam_service_account" "deployer" {
  name        = "r6mod-${terraform.workspace}"
  description = "service account to manage r6mod resources"
}

resource "yandex_iam_service_account_static_access_key" "deployer" {
  service_account_id = yandex_iam_service_account.deployer.id
}
