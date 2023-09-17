terraform {
  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = "0.98.0"
    }
    git = {
      source  = "innovationnorway/git"
      version = "0.1.3"
    }
  }
}

provider "yandex" {
  token     = var.YC_TOKEN
  cloud_id  = var.YC_CLOUD_ID
  folder_id = var.YC_FOLDER_ID
  zone      = var.YC_ZONE
}
