import axios from 'axios';

export default async function handler(req, res) {
    // Enable CORS handling so the Pi Browser can talk to your backend safely
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            const { paymentId } = req.body;
            
            // Your Pi Network Platform API Secret Key
         const apiKey = process.env.PI_API_KEY;

            // 1. Submit approval request directly to Pi Blockchain Core
            const response = await axios.post(
                `https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`,
                {},
                {
                    headers: { Authorization: `Key ${process.env.PI_API_KEY}` }
                }
            );

            // 2. Return success status back to your frontend app.js
            return res.status(200).json(response.data);

        } catch (error) {
            console.error("Backend Handshake Error:", error.response?.data || error.message);
            return res.status(500).json({ error: "Blockchain handshake authentication failed." });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}