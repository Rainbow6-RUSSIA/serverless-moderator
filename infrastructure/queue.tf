resource "yandex_message_queue" "queue" {
  name = "r6mod-queue-${terraform.workspace}"

  message_retention_seconds  = 600
  visibility_timeout_seconds = 5
  access_key                 = yandex_iam_service_account_static_access_key.deployer.access_key
  secret_key                 = yandex_iam_service_account_static_access_key.deployer.secret_key

  depends_on = [
    yandex_iam_service_account.deployer
  ]
}

resource "yandex_function_trigger" "trigger" {
  name = "r6mod-trigger-${terraform.workspace}"
  message_queue {
    queue_id           = yandex_message_queue.queue.id
    service_account_id = yandex_iam_service_account.deployer.id
    batch_size         = 1
    batch_cutoff       = 0
  }
  function {
    id = yandex_function.entrypoint.id
  }
}
