import azure.functions as func
import logging
import os
import json
from azure.identity import DefaultAzureCredential
from azure.mgmt.compute import ComputeManagementClient

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

SUBSCRIPTION_ID = os.environ.get("AZURE_SUBSCRIPTION_ID", "d9ed69ab-886c-40cc-b8b6-0efa4e1049ba")
RESOURCE_GROUP = os.environ.get("RESOURCE_GROUP", "rg-cloud-admin-platform")
VM_NAME = os.environ.get("VM_NAME", "vm-cloud-admin")

@app.route(route="start-vm", methods=["POST", "GET"])
def start_vm_function(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Azure Serverless Function received Start VM request.')

    try:
        credential = DefaultAzureCredential()
        compute_client = ComputeManagementClient(credential, SUBSCRIPTION_ID)

        # Trigger non-blocking async start operation
        async_vm_start = compute_client.virtual_machines.begin_start(
            resource_group_name=RESOURCE_GROUP,
            vm_name=VM_NAME
        )

        response_payload = {
            "success": True,
            "status": "Starting",
            "message": f"Serverless Function successfully triggered start sequence for VM '{VM_NAME}'.",
            "vm": VM_NAME,
            "resource_group": RESOURCE_GROUP
        }

        return func.HttpResponse(
            json.dumps(response_payload),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )

    except Exception as e:
        logging.error(f"Error starting VM via Azure Function: {str(e)}")
        error_payload = {
            "success": False,
            "error": str(e),
            "message": f"Failed to start VM '{VM_NAME}' via Serverless Function."
        }
        return func.HttpResponse(
            json.dumps(error_payload),
            status_code=500,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )
