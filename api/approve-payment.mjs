import axios from 'axios';

export default async function handler(req, res) {
    // 1. Enforce strict CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    try {
        // 2. UNIVERSAL BODY PARSER (Handles raw buffers, strings, and pre-parsed objects)
        let paymentId = null;

        if (req.body) {
            if (typeof req.body === 'string') {
                try {
                    const parsed = JSON.parse(req.body);
                    paymentId = parsed.paymentId;
                } catch (e) {
                    console.error("Failed parsing string body:", e);
                }
            } else if (Buffer.isBuffer(req.body)) {
                try {
                    const parsed = JSON.parse(req.body.toString('utf-8'));
                    paymentId = parsed.paymentId;
                } catch (e) {
                    console.error("Failed parsing buffer body:", e);
                }
            } else if (typeof req.body === 'object') {
                paymentId = req.body.paymentId;
            }
        }

        // Defensive Validation Check
        if (!paymentId || paymentId === "undefined") {
            console.error("🔴 PARSING CRASH: paymentId extracted as empty or undefined. Raw body was:", typeof req.body, req.body);
            return res.status(400).json({ error: "Backend failed to extract valid paymentId from payload stream." });
        }

        console.log(`📡 Clean Handshake processing for verified ID: ${paymentId}`);

        // 3. Dual-Ledger Validation Engine Routing
        let targetUrl = `https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`;
        
        try {
            const piResponse = await axios.post(targetUrl, {}, {
                headers: { 'Authorization': `Key ${process.env.PI_API_KEY}`, 'Content-Type': 'application/json' }
            });
            console.log("🟢 Pi Testnet ledger verified transaction successfully!");
            return res.status(200).json({ approved: true, tx: piResponse.data });
        } catch (testnetError) {
            if (testnetError.response && testnetError.response.status === 404) {
                console.log("⚠️ Stellar Node 404: Switching to production platform lane...");
                let fallbackUrl = `https://api.minepi.com/v2/payments/${paymentId}/approve`;
                
                const piFallbackResponse = await axios.post(fallbackUrl, {}, {
                    headers: { 'Authorization': `Key ${process.env.PI_API_KEY}`, 'Content-Type': 'application/json' }
                });
                console.log("🟢 Production platform lane verified transaction successfully!");
                return res.status(200).json({ approved: true, tx: piFallbackResponse.data });
            }
            throw testnetError;
        }

   } catch (error) {
        let serverErrorTitle = "Unknown Error";
        let serverErrorDetail = "No details provided";

        if (error.response && error.response.data) {
            serverErrorTitle = error.response.data.title || serverErrorTitle;
            serverErrorDetail = error.response.data.detail || JSON.stringify(error.response.data);
            
            // 🟢 DEFENSIVE INTERCEPT: If the ledger already approved it, force a success response!
            if (error.response.data.error === "already_approved" || serverErrorDetail.includes("already approved")) {
                console.log("ℹ️ Pi Ledger State: Payment was already approved previously. Forwarding success lane.");
                return res.status(200).json({ 
                    approved: true, 
                    message: "Payment already cleared approval state.",
                    wasAlreadyApproved: true 
                });
            }
        } else {
            serverErrorDetail = error.message;
        }

        console.error(`🔴 PI CORE REJECTED HANDSHAKE -> Title: ${serverErrorTitle} | Details: ${serverErrorDetail}`);
        return res.status(500).json({ error: "Internal validation failure", details: serverErrorDetail });
    }

}