variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}

variable "location" {
  description = "Azure Region"
  type        = string
  default     = "germanywestcentral"
}

variable "resource_group_name" {
  description = "Resource Group Name"
  type        = string
  default     = "rg-cloud-admin-platform"
}

variable "vm_name" {
  default = "vm-cloud-admin"
}

variable "vm_size" {
  default = "Standard_D2s_v3"
}

variable "admin_username" {
  default = "azureuser"
}

variable "public_ip_name" {
  default = "pip-cloud-admin"
}

variable "nic_name" {
  default = "nic-cloud-admin"
}