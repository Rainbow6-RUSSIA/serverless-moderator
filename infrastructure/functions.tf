data "git_repository" "info" {
  path = "../${path.root}"
}

resource "yandex_function" "entrypoint" {
  depends_on = [
    yandex_iam_service_account.deployer
  ]
  name               = "r6mod-entrypoint-${terraform.workspace}"
  description        = "serverless bot entrypoint"
  user_hash          = substr(data.git_repository.info.commit_sha, 0, 7)
  runtime            = "nodejs16"
  entrypoint         = "index.handler"
  memory             = "128"
  execution_timeout  = "500"
  service_account_id = yandex_iam_service_account.deployer.id

  environment = {
    "DISCORD_PUBLIC_KEY"   = var.DISCORD_PUBLIC_KEY
    "DISCORD_TOKEN"        = var.DISCORD_TOKEN
    "DISCORD_GUILD"        = var.DISCORD_GUILD
    "HIGHLIGHT_WEBHOOK"    = var.HIGHLIGHT_WEBHOOK
    "HIGHLIGHT_FORUM_POST" = var.HIGHLIGHT_FORUM_POST
    "NODE_ENV"             = "production"
  }

  content {
    zip_filename = "../dist/bundle.zip"
  }
}

resource "yandex_function_iam_binding" "entrypoint-admin" {
  function_id = yandex_function.entrypoint.id
  members     = ["serviceAccount:${yandex_iam_service_account.deployer.id}"]
  role        = "serverless.functions.admin"
}
