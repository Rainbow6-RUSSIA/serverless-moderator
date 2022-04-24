resource "yandex_function" "test_function" {
  depends_on = [
    data.yandex_iam_service_account.deployer
  ]
  name        = "index"
  description = "serverless bot entrypoint"
  # user_hash          = "any_user_defined_string"
  runtime            = "nodejs16"
  entrypoint         = "bundle.index"
  memory             = "128"
  execution_timeout  = "30"
  service_account_id = data.yandex_iam_service_account.deployer.id
  tags               = ["my_tag"]
  content {
    zip_filename = "../bundle.zip"
  }
}
