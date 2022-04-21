resource "yandex_function" "test_function" {
  depends_on = [
    data.yandex_iam_service_account.deployer
  ]
  name               = "some-name"
  description        = "any description"
  user_hash          = "any_user_defined_string"
  runtime            = "nodejs12"
  entrypoint         = "hello.handler"
  memory             = "128"
  execution_timeout  = "3"
  service_account_id = data.yandex_iam_service_account.deployer.id
  tags               = ["my_tag"]
  content {
    zip_filename = "../hello.zip"
  }
}
