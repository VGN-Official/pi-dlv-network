import axios from 'axios';
    export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    try {
    let bodyData = req.body;
        if (typeof bodyData === 'string') bodyData = JSON.parse(bodyData);
        const { paymentId } = bodyData;

    if (!paymentId || paymentId === "undefined") {
            return res.status(400).json({ error: "Missing valid paymentId identifier string." });
        }

        // 1. First, attempt validation via the explicit Testnet ledger path
        let targetUrl = `https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`;
        console.log(`📡 Handshaking with Pi Ledger for ID: ${paymentId}`);

        try {
            const piResponse = await axios.post(targetUrl, {}, {
                headers: { 'Authorization': `Key ${process.env.PI_API_KEY}`, 'Content-Type': 'application/json' }
            });
            console.log("🟢 Pi Testnet verified transaction successfully!");
            return res.status(200).json({ approved: true, tx: piResponse.data });
        } catch (testnetError) {
            // 2. Fallback: If Stellar says 404, route the request through the production endpoint
            if (testnetError.response && testnetError.response.status === 404) {
                console.log("⚠️ Testnet Stellar node threw 404. Falling back to platform endpoint...");
                
                let fallbackUrl = `https://api.minepi.com/v2/payments/${paymentId}/approve`;
                const piFallbackResponse = await axios.post(fallbackUrl, {}, {
                    headers: { 'Authorization': `Key ${process.env.PI_API_KEY}`, 'Content-Type': 'application/json' }
                });
                
                console.log("🟢 Platform endpoint verified transaction successfully!");
                return res.status(200).json({ approved: true, tx: piFallbackResponse.data });
            }
            throw testnetError; // If it's a different error (like 401 Unauthorized), pass it to main catch
        }

    } catch (error) {
        let serverErrorTitle = "Unknown Error";
        let serverErrorDetail = "No details provided";

        if (error.response && error.response.data) {
            serverErrorTitle = error.response.data.title || serverErrorTitle;
            serverErrorDetail = error.response.data.detail || JSON.stringify(error.response.data);
        } else {
            serverErrorDetail = error.message;
        }

        console.error(`🔴 PI CORE REJECTED HANDSHAKE -> Title: ${serverErrorTitle} | Details: ${serverErrorDetail}`);
        return res.status(500).json({ error: "Internal validation failure", details: serverErrorDetail });
    }
}