import axios from 'axios';

export default async function handler(req, res) {
    // 1. Enforce CORS headers to satisfy the sandbox webview
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // 2. Safely parse the payment identifier from the incoming frame body
        let bodyData = req.body;
        if (typeof bodyData === 'string') {
            bodyData = JSON.parse(bodyData);
        }

        const { paymentId } = bodyData;

        // Defensive Check: Ensure the variable didn't slip through blank
        if (!paymentId || paymentId === "undefined") {
            console.error("🔴 Backend blocked: paymentId variable arrived blank or undefined.");
            return res.status(400).json({ error: "Missing valid paymentId identifier string." });
        }

        console.log(`📡 Handshaking with Pi Testnet Ledger for Payment ID: ${paymentId}`);

        // 3. Post the validation token straight to the Pi Testnet Network Engine
        const piResponse = await axios.post(
            `https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`,
            {}, // The approve endpoint requires an empty post body
            {
                headers: {
                    'Authorization': `Key ${process.env.PI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("🟢 Pi Testnet verified transaction authenticity successfully:", piResponse.data);
        
        // Return clear verification signature back to your phone terminal screen
        return res.status(200).json({ approved: true, tx: piResponse.data });

    } catch (error) {
        const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error("🔴 Server Handshake Exception Error Trace:", errorDetails);
        
        return res.status(500).json({
            error: "Internal validation failure",
            details: errorDetails
        });
    }
}