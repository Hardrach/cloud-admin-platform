output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "location" {
  value = azurerm_resource_group.main.location
}

output "vnet_name" {
  value = azurerm_virtual_network.main.name
}

output "subnet_name" {
  value = azurerm_subnet.main.name
}

output "nsg_name" {
  value = azurerm_network_security_group.main.name
}

output "public_ip" {

  value = azurerm_public_ip.main.ip_address
}

output "vm_name" {

  value = azurerm_linux_virtual_machine.main.name
}