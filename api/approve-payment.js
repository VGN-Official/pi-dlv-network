import axios from 'axios';

export default async function handler(req, res) {
    // 1. Keep your clean CORS matrix intact
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentId, txid } = req.body; // <-- Extract txid forwarded by the client
    const apikey = "elxmo3sqnogqovzsgmwu95s4j7ne4x9q8hxszi7fihfkgncokrvgbzv0aw2uszhw";

    if (!paymentId) {
        return res.status(400).json({ error: "Missing parameter: paymentId" });
    }

    try {
        // 2. DYNAMIC LOOKUP: Switch endpoints depending on transaction progress
        // If a blockchain txid exists, we MUST use 'complete' to resolve it on the ledger.
        // If no txid exists yet, we call 'approve' to advance/clear it.
        const endpoint = (txid && txid !== "mock_sandbox_txid") ? "complete" : "approve";
        const postData = endpoint === "complete" ? { txid: txid } : {};

        console.log(`[Vercel Serverless] Handling stuck ledger path via /${endpoint} for ID: ${paymentId}`);

        const response = await axios.post(
            `https://api.platform.minepi.com/v2/payments/${paymentId}/${endpoint}`,
            postData,
            {
                headers: {
                    // FIX: Changed 'Key' to 'Bearer' so the Pi API authenticates securely
                    Authorization: `Bearer ${PI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.status(200).json({ success: true, cleared: true, data: response.data });
    } catch (error) {
        console.error(`[Vercel Serverless] Handshake failure:`, error.response?.data || error.message);
        return res.status(500).json({ 
            error: "Blockchain sync timeout", 
            details: error.response?.data || error.message 
        });
    }
}