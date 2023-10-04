resource "yandex_message_queue" "queue" {
  name = "r6mod-queue-${terraform.workspace}"

  message_retention_seconds  = 600
  visibility_timeout_seconds = 5
  depends_on = [
    yandex_iam_service_account.deployer
  ]
}
