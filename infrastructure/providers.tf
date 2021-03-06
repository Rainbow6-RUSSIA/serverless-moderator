terraform {
  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = "0.74.0"
    }
    git = {
      source  = "innovationnorway/git"
      version = "0.1.3"
    }
  }
}

provider "yandex" {
  token     = var.token
  cloud_id  = var.cloud_id
  folder_id = var.folder_id
  zone      = var.zone
}
