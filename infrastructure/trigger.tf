resource "yandex_function_trigger" "trigger" {
  name = "r6mod-trigger-${terraform.workspace}"
  message_queue {
    queue_id           = yandex_message_queue.queue.id
    service_account_id = yandex_iam_service_account.deployer.id
  }
  function {
    id = yandex_function.entrypoint.id
  }
}
