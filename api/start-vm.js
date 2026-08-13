const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || "0aa23530-bf26-4354-9ec0-1c612fead745";
  const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || "0a2303db-54ae-4801-888c-473dcae9cadb";
  const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET || process.env.REACT_APP_AZURE_CLIENT_SECRET;
  const AZURE_SUBSCRIPTION_ID = process.env.AZURE_SUBSCRIPTION_ID || "d9ed69ab-886c-40cc-b8b6-0efa4e1049ba";
  const AZURE_RESOURCE_GROUP = "rg-cloud-admin-platform";
  const vmName = req.body?.name || "vm-cloud-admin";

  try {
    // 1. Get OAuth Token from Azure AD
    const tokenUrl = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", AZURE_CLIENT_ID);
    params.append("client_secret", AZURE_CLIENT_SECRET);
    params.append("scope", "https://management.azure.com/.default");

    const tokenRes = await axios.post(tokenUrl, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const accessToken = tokenRes.data.access_token;

    // 2. Trigger Start VM on Azure Management REST API
    const azureApiUrl = `https://management.azure.com/subscriptions/${AZURE_SUBSCRIPTION_ID}/resourceGroups/${AZURE_RESOURCE_GROUP}/providers/Microsoft.Compute/virtualMachines/${vmName}/start?api-version=2023-09-01`;

    await axios.post(azureApiUrl, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    return res.status(200).json({
      success: true,
      via: "vercel_serverless_function",
      message: `Vercel Serverless Function successfully triggered Start for Azure VM '${vmName}'. The VM will be Running in 1-2 minutes.`
    });

  } catch (error) {
    console.error("Vercel Serverless Start Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
      message: "Failed to trigger Azure VM Start via Vercel Serverless Function."
    });
  }
};
