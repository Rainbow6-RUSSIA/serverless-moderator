resource "yandex_api_gateway" "gateway" {
  name        = "r6mod-gateway"
  description = "any description"
  labels = {
    label       = "label"
    empty-label = ""
  }
  spec = templatefile("openapi.yaml", {
    function_id : yandex_function.entrypoint.id,
    service_account_id : yandex_iam_service_account.deployer.id
  })
}
