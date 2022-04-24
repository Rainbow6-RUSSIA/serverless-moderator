data "git_repository" "info" {
  path = "../${path.root}"
}

resource "yandex_function" "entrypoint" {
  depends_on = [
    data.yandex_iam_service_account.deployer
  ]
  name               = "r6mod-entrypoint"
  description        = "serverless bot entrypoint"
  user_hash          = substr(data.git_repository.info.commit_sha, 0, 7)
  runtime            = "nodejs16"
  entrypoint         = "index.handler"
  memory             = "128"
  execution_timeout  = "30"
  service_account_id = data.yandex_iam_service_account.deployer.id
  tags               = ["my_tag"]
  content {
    zip_filename = "../dist/bundle.zip"
  }
}
