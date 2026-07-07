resource "azurerm_public_ip" "main" {

  name                = var.public_ip_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  allocation_method = "Static"

  sku = "Standard"

  tags = local.common_tags
}

resource "azurerm_network_interface" "main" {

  name                = var.nic_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {

    name = "internal"

    subnet_id = azurerm_subnet.main.id

    private_ip_address_allocation = "Dynamic"

    public_ip_address_id = azurerm_public_ip.main.id
  }

  tags = local.common_tags
}

resource "azurerm_linux_virtual_machine" "main" {

  name = var.vm_name

  location = azurerm_resource_group.main.location

  resource_group_name = azurerm_resource_group.main.name

  size = var.vm_size

  admin_username = var.admin_username

  disable_password_authentication = true

  network_interface_ids = [
    azurerm_network_interface.main.id
  ]

  admin_ssh_key {

    username = var.admin_username

    public_key = file("C:/Users/yassi/.ssh/id_ed25519.pub")
  }

  os_disk {

    caching = "ReadWrite"

    storage_account_type = "Standard_LRS"
  }

  source_image_reference {

    publisher = "Canonical"

    offer = "ubuntu-24_04-lts"

    sku = "server"

    version = "latest"
  }

  computer_name = "cloud-admin"

  tags = local.common_tags
}