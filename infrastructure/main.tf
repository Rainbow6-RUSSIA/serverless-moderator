# module "service-account" {
#   source = "./account"
# }

# module "gateway" {
#   source = "./gateway"
# }

# module "functions" {
#   depends_on         = [module.service-account]
#   source             = "./functions"
#   service_account_id = module.service-account.service_account_id
# }

variable "token" { type = string }
variable "cloud_id" { type = string }
variable "folder_id" { type = string }
variable "zone" { type = string }

