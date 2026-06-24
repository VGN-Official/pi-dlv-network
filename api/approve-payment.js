import axios from 'axios';

export default async function handler(req, res) {
    // Enable CORS headers so your frontend can call it safely
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle the preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentId } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    if (!paymentId) {
        return res.status(400).json({ error: "Missing parameter: paymentId" });
    }

    try {
        console.log(`[Vercel Serverless] Approving Payment ID: ${paymentId}`);

        const response = await axios.post(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            {},
            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.status(200).json(response.data);
    } catch (error) {
        console.error(`[Vercel Serverless] Handshake failure:`, error.response?.data || error.message);
        return res.status(500).json({ 
            error: "Blockchain sync timeout", 
            details: error.response?.data || error.message 
        });
    }
}