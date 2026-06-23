const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// The Pi Core Network automatically pings this endpoint when a payment is created
app.post('/api/approve-payment', async (req, res) => {
    const { paymentId } = req.body;
    
    if (!paymentId) {
        return res.status(400).json({ error: "Missing paymentId parameters" });
    }

    try {
        console.log(`[Pi-DLV Backend] Submitting approval for Payment ID: ${paymentId}`);
        
        // Handshake directly with the official Pi Blockchain Engine
        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${process.env.PI_API_KEY}`, // Your Developer Passphrase
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log("[Pi-DLV Backend] Network server response:", data);
        return res.json({ success: true, data });

    } catch (error) {
        console.error("[Pi-DLV Backend] Approval handshake failed:", error);
        return res.status(500).json({ error: "Internal Matrix Sync Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[Pi-DLV Core] Backend Server processing on port ${PORT}`));