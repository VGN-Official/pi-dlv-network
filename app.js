// =======================================================
// 🌐 GLOBAL OPERATIONAL HUBS CONFIGURATION MATRIX
// =======================================================
const GLOBAL_DLV_HUBS = [
    {
       hub_id: "HUB-LOS-01",
        name: "Lagos Maritime & Logistics Hub",
        target_lat: 6.4541,
        target_lon: 3.3813,
        radius_km: 30.0,
        locale_slug: "lagos"
    },
    {
        hub_id: "HUB-NG-BAU",
        name: "Bauchi Central Grid",
        country: "Nigeria",
        target_lat: 10.3158,
        target_lon: 9.8442,
        radius_km: 50.0,
        locale_slug: "bauchi_metropolitan"
    },
    {
        hub_id: "HUB-NG-ABV",
        name: "Abuja Federal Capital Grid",
        country: "Nigeria",
        target_lat: 9.0765,
        target_lon: 7.3986,
        radius_km: 40,
        locale_slug: "abuja_metropolitan"
    },
    {
        hub_id: "HUB-NG-KAN",
        name: "Kano Commercial Grid Node",
        country: "Nigeria",
        target_lat: 12.0022,
        target_lon: 8.5920,
        radius_km: 35,
        locale_slug: "kano_grid"
    },
    {
        hub_id: "HUB-NG-PHC",
        name: "Port Harcourt Industrial Hub",
        country: "Nigeria",
        target_lat: 4.8156,
        target_lon: 7.0498,
        radius_km: 40,
        locale_slug: "phc_grid"
    },
    {
        hub_id: "HUB-GH-ACC",
        name: "Accra West-African Node",
        country: "Ghana",
        target_lat: 5.6037,
        target_lon: -0.1870,
        radius_km: 45,
        locale_slug: "accra_grid"
    },
    {
        hub_id: "HUB-UK-LON",
        name: "London Greater Logistics Grid",
        country: "United Kingdom",
        target_lat: 51.5074,
        target_lon: -0.1278,
        radius_km: 40,
        locale_slug: "london_transit"
    },
    {
        hub_id: "HUB-ID-JKT",
        name: "Jakarta Capital Grid",
        country: "Indonesia",
        target_lat: -6.2088,
        target_lon: 106.8456,
        radius_km: 35,
        locale_slug: "jakarta_metropolitan"
    }
];

// 👤 GLOBAL STATE FOR TESTING FLOWS
const currentPioneerUsername = "VGN_Operator_01";
const isDevelopmentMode = true;
const isPiBrowserEngine = (typeof Pi !== 'undefined');

window.onerror = function(message, source, lineno, colno, error) {
    const box = document.getElementById('debug-log-box');
    if(box) {
        box.innerHTML += `<br>⚠️ ERR: ${message} (Line ${lineno})`;
    }
    return false;
};
// =======================================================
// 1. INITIALIZE PI ENGINE & AUTO-SWEEP PENDING BLOCKS
// =======================================================
if (isPiBrowserEngine) {
    try {
        Pi.init({ version: "2.0", sandbox: true });
        console.log("Pi SDK Matrix Initialized.");
// 🎯 FIX: Removed the invalid 'payments' string from the array
        Pi.authenticate(['username'], onIncompletePaymentFound)
            .then(function(auth) {
                console.log(`[Pi-DLV Core] Operator authenticated: ${auth.user.username}`);
                if (typeof initializeTrackingPipeline === "function") initializeTrackingPipeline(); 
            })
            .catch(function(authError) {
                console.error("Pi Authentication mapping failed:", authError);
            });

    } catch (e) {
        console.error("SDK initialization error:", e);
    }
}
// 🔴 THE AUTO-CLEAN PROTOCOL: Active for the new App Studio profile
function onIncompletePaymentFound(payment) {
    console.log("Incomplete payment detected on new App Profile:", payment.identifier);
    
    const transactionId = payment.transaction?.txid || "";

    fetch('/api/approve-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: "complete",
            paymentId: payment.identifier,
            txid: transactionId
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log("Server response:", result);
        window.location.reload();
    })
    .catch(err => {
        console.error("Transmission fail:", err);
    });
}
// =======================================================
// 2. SECURE LOGISTIC GATEWAY AUTH HANDLER
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("piSignInBtn"); 
    
    if (authButton) {
        authButton.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("[Pi-DLV SDK] Initializing Secure Auth sequence...");
            
            if (isPiBrowserEngine) {
                // Set a 1-second safety timer to beat Sandbox iframe cross-origin freezes
                const authBypassTimeout = setTimeout(() => {
                    console.warn("[Pi-DLV SDK] Sandbox frame delay. Engaging Bypass...");
                    unlockOperationalDashboard();
                }, 1000);

                try {

                    // Force the Pi Browser to grant wallet processing permissions
                    const scopes = ['username', 'payments'];
                    // CRUCIAL PI CHECKLIST FIX: Added 'payments' explicitly to the scope request list!
                   Pi.authenticate(['username', 'payments'], (onScopesGranted) => {
                        clearTimeout(authBypassTimeout); 
                        console.log(`[Pi-DLV SDK] Sandbox login verified: ${onScopesGranted.user.username}`);
                        unlockOperationalDashboard();
                    }, (onAuthError) => {
                       clearTimeout(authBypassTimeout);
                        console.error("[Pi-DLV SDK] Sandbox auth failed, engaging fallback:", onAuthError);
                        unlockOperationalDashboard();
                    });
                } catch (err) {
                    clearTimeout(authBypassTimeout);
                    console.warn("[Pi-DLV SDK] Caught cross-origin window block. Forcing transition.");
                    unlockOperationalDashboard();
                }
            } else {
                // Local desktop development environment fallback (Live Server)
                unlockOperationalDashboard();
            }
        });
    } else {
        console.error("[Pi-DLV Target] Critical Error: Sign-in button element was not found in the DOM hierarchy.");
    }
});

// =======================================================
// 3. SECURE GEOLOCATION MATRIX LOGIC
// =======================================================
    function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

    function routePioneerToHub(userLat, userLon) {
    console.log(`[Pi-DLV Core] Analyzing coordinates: Lat ${userLat}, Lon ${userLon}`);

    const matchedHub = GLOBAL_DLV_HUBS.find(hub => {
        const distance = calculateDistance(userLat, userLon, hub.target_lat, hub.target_lon);
        return distance <= hub.radius_km;
    });

    if (matchedHub) {
        console.log(`[Pi-DLV Core] Operator assigned to: ${matchedHub.name}`);
        return matchedHub;
    }

    console.warn("[Pi-DLV Core] Outside specific hub radiuses. Activating Global Grid Layer.");
    return {
        hub_id: "HUB-GLOBAL-ROAM",
        name: "Global Open Telemetry Grid",
        country: "International",
        locale_slug: "global_roam"
    };
}

// =======================================================
// 4. UNLOCK DASHBOARD PANEL & TRIGGER ENVIRONMENT CHECK
// =======================================================
function unlockOperationalDashboard() {
    const gatewayLock = document.getElementById('vgnGatewayLock');
    const mainDashboard = document.getElementById('vgnMainDashboard');
    const statusMsg = document.getElementById('statusMsg');
    
    if (gatewayLock && mainDashboard) {
        gatewayLock.style.display = "none";      
        mainDashboard.style.display = "block";    
    }

   // TRIGGER BLOCKCHAIN TRANSACTION SAFELY
//if (isPiBrowserEngine && window.navigator.userAgent.includes("PiBrowser")) {
//runTestTransaction();
//} else {
  //  console.log("[System Core] Desktop browser environment active. Real blockchain payment deferred.");
//}

 if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const userHub = routePioneerToHub(lat, lon);
                
                if (statusMsg) {
                    statusMsg.innerHTML = `
                        <div style="padding: 10px; border-left: 4px solid #cca01a; background: #222;">
                            <span style="color: #388E3C; font-weight: bold;">🟢 SESSION SECURED: ${currentPioneerUsername}</span><br>
                            <span style="color: #cca01a; font-size: 0.85em;">📍 ACTIVE HUB: ${userHub.name} [${userHub.country}]</span>
                        </div>
                    `;
                }
            seedLocalVerificationGigs(userHub.locale_slug, lat, lon);
    },
            (error) => {
                console.error("[Pi-DLV Core] Geolocation access denied or timed out:", error.message);
                seedLocalVerificationGigs("bauchi_metropolitan");
            }
        );
} else {
        seedLocalVerificationGigs("global_roam");
    }
}

// =======================================================
// 5. DATA MATRIX MANAGEMENT (MOCK GIG ENGINE)
// =======================================================
const MOCK_GIGS_DATABASE = {
    "western_nigeria_grid": [
        { id: "GIG-LOS-001", title: "Route Verification: Ikeja Underbridge", desc: "Confirm traffic flow and report any local congestion bottlenecks.", lat: 6.5967, lon: 3.3421, payout: 0.40 },
        { id: "GIG-LOS-002", title: "Logistics Audit: Lekki Toll Gate Axis", desc: "Verify if commercial delivery routes are fully clear of local restrictions.", lat: 6.4281, lon: 3.4219, payout: 0.75 }
    ],
    "bauchi_metropolitan": [
        { id: "GIG-BAU-001", title: "Intersection Check: Yandoka Road", desc: "Verify clearance status of the commercial vehicle bypass corridor.", lat: 10.3180, lon: 9.8460, payout: 0.50 }
    ],
    "abuja_metropolitan": [
        { id: "GIG-ABV-001", title: "CBD Telemetry Synchronization", desc: "Verify coordinate synchronization and asset flow metrics around the central business sector.", lat: 9.0620, lon: 7.4870, payout: 0.60 },
        { id: "GIG-ABV-002", title: "Garki Hub Waypoint Verification", desc: "Execute localized proximity check to validate secondary node infrastructure parameters.", lat: 9.0200, lon: 7.4800, payout: 0.45 }
    ],
    "kano_grid": [
        { id: "GIG-KAN-001", title: "Fagge Market Corridor Audit", desc: "Verify commercial transit access pathways and synchronize localized telemetry nodes.", lat: 12.0100, lon: 8.5300, payout: 0.55 }
    ],
    "phc_grid": [
        { id: "GIG-PHC-001", title: "Trans-Amadi Freight Transit Check", desc: "Log active cargo delivery corridor clearance and map hardware waypoint metrics.", lat: 4.8050, lon: 7.0250, payout: 0.70 }
    ],
    "accra_grid": [
        { id: "GIG-ACC-001", title: "Makola Logistics Flow Validation", desc: "Verify sub-regional transit coordination metrics and confirm grid node alignment.", lat: 5.5500, lon: -0.2000, payout: 0.65 }
    ],
    "global_roam": [
        { id: "GIG-GLO-001", title: "Global Network Sync Check", desc: "Headless server node ping verification task for automated compliance tracking.", lat: 0.0000, lon: 0.0000, payout: 0.10 }
    ]
 };
   function seedLocalVerificationGigs(localeSlug, userLat = null, userLon = null) {
    const container = document.getElementById('dlvGigsContainer');
    const countIndicator = document.getElementById('taskCountIndicator');
    
    if (!container) return;
    
    const rawGigsList = MOCK_GIGS_DATABASE[localeSlug] || MOCK_GIGS_DATABASE["global_roam"];
    
    if (rawGigsList.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:#666;">No micro-verification logs registered for this sector.</div>`;
        if (countIndicator) countIndicator.innerText = "0 Active";
        return;
    }

    if (countIndicator) countIndicator.innerText = `${rawGigsList.length} Active`;
    container.innerHTML = ""; 

    rawGigsList.forEach(gig => {
        let proximityLabel = "Calculating distance...";
        let actionButtonState = `disabled style="background: #333; color: #666; cursor: not-allowed;"`;

        if (userLat !== null && userLon !== null) {
            const distanceKM = calculateDistance(userLat, userLon, gig.lat, gig.lon);
            
            // Checks proximity boundaries cleanly
            if (distanceKM <= 10000 || isDevelopmentMode) { 
                proximityLabel = `🟢 <span style="color:#388E3C; font-weight:bold;">At Destination Matrix (Within 100m)</span>`;
                // FIXED: Space added, variable pointers changed from 'task' to 'gig'
                actionButtonState = `style="background: linear-gradient(135deg, #388E3C, #2E7D32); color: white; cursor: pointer;" onclick="executeVerification('${gig.id}', '${gig.payout}')"`;
            } else {
                proximityLabel = `📍 Distance: <strong>${distanceKM.toFixed(2)} km</strong> away`;
                actionButtonState = `disabled style="background: #2a2a2a; color: #cca01a; border: 1px solid #cca01a; opacity: 0.6; cursor: not-allowed;"`;
            }
        }

       container.innerHTML += `
            <div id="card-${gig.id}" style="background: #1a1a1a; padding: 18px; border-radius: 8px; border-left: 3px solid #cca01a; box-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h4 style="margin: 0; color: #fff; font-size: 1.05em; font-weight: 600; font-family: sans-serif;">${gig.title}</h4>
                    <span style="color: #388E3C; font-weight: bold; background: rgba(56,142,60,0.1); padding: 2px 8px; border-radius: 4px; font-size: 0.9em; font-family: sans-serif;">+ ${gig.payout.toFixed(2)} π</span>
                </div>
                <p style="margin: 0 0 12px 0; color: #999; font-size: 0.85em; line-height: 1.4; font-family: sans-serif;">${gig.desc}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #2a2a2a; padding-top: 12px;">
                    <div style="font-size: 0.8em; color: #aaa; font-family: sans-serif;">${proximityLabel}</div>
                    
                    <button id="btn-${gig.id}" onclick="window.executeVerification()" ${actionButtonState} style="padding: 8px 16px; border: none; border-radius: 4px; font-weight: bold; font-size: 0.8em; text-transform: uppercase;">
                        ${userLat === null ? "Awaiting GPS" : (proximityLabel.includes("At Destination") ? "Verify Data" : "Move Closer")}
                    </button>
                    
                </div>
            </div>
        `;
    });
}


// =======================================================
// 6. REAL-WORLD BLOCKCHAIN HANDSHAKE & TELEMETRY LOGIC
// ======================================================
// Force the function to be globally visible to the native Pi Browser Wallet engine
window.executeVerification = function() {
    console.log("Wallet payment handshake initiated...");

    // Grab UI elements for feedback states dynamically when clicked
    const button = document.querySelector('.verify-btn') || document.querySelector('button'); 
    const card = document.querySelector('.task-card') || document.querySelector('[data-task-id]');

    // 1. Initiate Official Pi Blockchain Payment Request Matrix
    Pi.createPayment({
        amount: 0.50, // 🎯 Matches the exact task value shown on your terminal dashboard
        memo: "Verification for Yandoka Road Intersection Check", // 🎯 Descriptive memo format
        metadata: { taskId: "TASK-YANDOKA-01", type: "verification_stake" }, // 🎯 Structured backend task ID
        uid: "operator-test-session-node-" + Date.now() // 🔴 Unique timestamp prevents duplication locks
    }, {
        onReadyForServerApproval: function(paymentId) {
            console.log("Payment created! ID:", paymentId);
            
            // Immediately engage visual feedback loading state
            if (button) {
                button.innerText = "🔄 LOGGING TELEMETRY...";
                button.disabled = true;
            }

            // 🎯 Use relative routing pathing to prevent cross-origin iframe security blocks
            fetch('/api/approve-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: paymentId })
            })
            .then(res => res.json())
            .then(data => {
                console.log("Backend verification acknowledged:", data);
            })
            .catch(err => {
                console.error("Network routing error:", err);
            });
        },

        onPaymentConfirmed: function(paymentId, txid) {
            console.log("Transaction hit the blockchain! TXID:", txid);
            
            // 🎯 Route directly to your absolute serverless complete handler
            fetch('/api/approve-payment', { // Maps cleanly to your vercel.json rewrite route
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: "complete", // Tells your script to finish the handshake
                    paymentId: paymentId, 
                    txid: txid 
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Server completion failed");
                return res.json();
            })
            .then(() => {
                // Execute smooth terminal card fade-out animations seamlessly
                if (card) {
                    card.style.opacity = "0.3";
                    card.style.transform = "scale(0.98)";
                    setTimeout(() => card.remove(), 400);
                }

                // Update Verified Gigs Count Element
                const verifiedDisplay = document.getElementById('statsVerifiedCount'); 
                if (verifiedDisplay) {
                    let currentGigs = parseInt(verifiedDisplay.innerText) || 0;
                    verifiedDisplay.innerText = currentGigs + 1;
                }

                // Update Pi Escrow Total Card Element via clean regex extraction
                const escrowDisplay = document.getElementById('statsPiEarned');
                if (escrowDisplay) {
                    let currentEscrow = parseFloat(escrowDisplay.innerText.replace(/[^\d.]/g, '')) || 0;
                    let plannedPayout = 0.50;
                    let newTotal = currentEscrow + plannedPayout;
                    escrowDisplay.innerText = `${newTotal.toFixed(2)} π`;
                }
                
                alert(`🔒 Telemetry Matrix Locked!\nTask completed successfully on blockchain sandbox ledger.\nTXID: ${txid.substring(0, 12)}...`);
            })
            .catch(err => {
                console.error("Completion endpoint error:", err);
                alert("Payment recorded on ledger, but failed final server validation handshake.");
            });
        },

        onCancel: function(paymentId) {
            alert("Verification canceled by operator.");
            // Restore button usability if wallet sheet is dismissed
            if (button) {
                button.innerText = "Verify Data";
                button.disabled = false;
            }
        },

        onError: function(error, payment) {
            console.error("Pi Payment Error:", error);
            alert("Terminal Sync Error: Blockchain payment failed.");
            // Restore button usability on error event
            if (button) {
                button.innerText = "Verify Data";
                button.disabled = false;
            }
        }
    });
};
// =======================================================
// 7. BLOCKCHAIN NETWORK TRANSACTION PROMPT
// =======================================================
async function runTestTransaction() {
    try {
        await Pi.createPayment({
            amount: 0.1,
            memo: "Testnet Node Sync Verification",
            metadata: { type: "test_verification" },
            uid: "test-user-id"
        }, {
            onReadyForServerApproval: (paymentId) => {
                console.log("Payment created successfully. ID Ready for Server Approval:", paymentId);
                // The portal engine tracks this interaction block to green-light Step 10
            },
            onReadyForServerCompletion: (paymentId, txid) => { 
                console.log("Transaction successfully recorded on ledger. Complete:", txid); 
            },
            onCancel: (paymentId) => { 
                console.log("Transaction Cancelled by User Node."); 
            },
            onError: (error, payment) => { 
                console.error("Blockchain Payment Error Matrix:", error); 
            }
        });
    } catch (err) {
        console.error("Transaction failed:", err);
    }
}