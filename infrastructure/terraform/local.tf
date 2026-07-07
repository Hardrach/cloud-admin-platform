locals {

  project = "cloud-admin-platform"

  environment = "dev"

  common_tags = {
    Project     = local.project
    Environment = local.environment
    ManagedBy   = "Terraform"
    Owner       = "Yassine Rachid"
  }

}