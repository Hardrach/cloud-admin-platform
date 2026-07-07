resource "azurerm_network_security_group" "main" {
  name                = "nsg-cloud-admin"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = local.common_tags
}

resource "azurerm_network_security_rule" "ssh" {

  name = "Allow-SSH"

  priority = 100

  direction = "Inbound"

  access = "Allow"

  protocol = "Tcp"

  source_port_range = "*"

  destination_port_range = "22"

  source_address_prefix = "*"

  destination_address_prefix = "*"

  resource_group_name = azurerm_resource_group.main.name

  network_security_group_name = azurerm_network_security_group.main.name

}

resource "azurerm_subnet_network_security_group_association" "main" {

  subnet_id = azurerm_subnet.main.id

  network_security_group_id = azurerm_network_security_group.main.id

}