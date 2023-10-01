variable "YC_TOKEN" {
  type      = string
  sensitive = true
}
variable "YC_CLOUD_ID" { type = string }
variable "YC_FOLDER_ID" { type = string }
variable "YC_ZONE" { type = string }

variable "NODE_ENV" {
  type    = string
  default = "production"
}

variable "DISCORD_PUBLIC_KEY" { type = string }
variable "DISCORD_TOKEN" {
  type      = string
  sensitive = true
}
variable "DISCORD_GUILDS" {
  type    = string
  default = null
}

variable "HIGHLIGHT_WEBHOOK" {
  type      = string
  sensitive = true
}
variable "HIGHLIGHT_FORUM_POST" {
  type    = string
  default = null
}
