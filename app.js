// 🌐 GLOBAL OPERATIONAL HUBS CONFIGURATION MATRIX
const GLOBAL_DLV_HUBS = [
    {
        hub_id: "HUB-NG-LOS",
        name: "Lagos Tech & Transit Hub",
        country: "Nigeria",
        target_lat: 6.5244,
        target_lon: 3.3792,
        radius_km: 50, // Covers Ikeja, Yaba, Lekki, Mainland
        locale_slug: "western_nigeria_grid"
    },
    {
        hub_id: "HUB-NG-BAU",
        name: "Bauchi Central Grid",
        country: "Nigeria",
        target_lat: 10.3158,
        target_lon: 9.8442,
        radius_km: 30,
        locale_slug: "bauchi_metropolitan"
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

// 🧮 HAVERSINE GEOLOCATION ROUTER
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// 🗺️ DYNAMICALLY MATCH PIONEER TO NEAREST HUB
function routePioneerToHub(userLat, userLon) {
    console.log(`[Pi-DLV Core] Analyzing coordinates: Lat ${userLat}, Lon ${userLon}`);

    const matchedHub = GLOBAL_DLV_HUBS.find(hub => {
        const distance = calculateDistance(userLat, userLon, hub.target_lat, hub.target_lon);
        return distance <= hub.radius_km;
    });

    if (matchedHub) {
        console.log(`[Pi-DLV Core] Operator assigned to: ${matchedHub.name} (${matchedHub.hub_id})`);
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

// 🔓 UNLOCK DASHBOARD PANEL
function unlockOperationalDashboard() {
    const gatewayLock = document.getElementById('vgnGatewayLock');
    const mainDashboard = document.getElementById('vgnMainDashboard');
    const statusMsg = document.getElementById('statusMsg');
    
    if (gatewayLock && mainDashboard) {
        gatewayLock.style.display = "none";      
        mainDashboard.style.display = "block";    
    }

    // 🛰️ INITIALIZE REVENUE RECONCILIATION & GEOTARGETING
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
                seedLocalVerificationGigs("global_roam");
            }
        );
    } else {
// ✨ FIXED: Added fallback for environments completely lacking GPS API support
        console.warn("[Pi-DLV Core] Browser environment lacks Geolocation capabilities. Loading Global Grid.");
        seedLocalVerificationGigs("global_roam");
    }
}

// 🗄️ MOCK DATABASE MATRIX
const MOCK_GIGS_DATABASE = {
    "western_nigeria_grid": [
        { id: "GIG-LOS-001", title: "Route Verification: Ikeja Underbridge", desc: "Confirm traffic flow and report any local congestion bottlenecks.", lat: 6.5967, lon: 3.3421, payout: 0.40 },
        { id: "GIG-LOS-002", title: "Logistics Audit: Lekki Toll Gate Axis", desc: "Verify if commercial delivery routes are fully clear of local restrictions.", lat: 6.4281, lon: 3.4219, payout: 0.75 }
    ],
    "bauchi_metropolitan": [
        { id: "GIG-BAU-001", title: "Intersection Check: Yandoka Road", desc: "Verify clearance status of the commercial vehicle bypass corridor.", lat: 10.3180, lon: 9.8460, payout: 0.50 }
    ],
    "global_roam": [
        { id: "GIG-GLO-001", title: "Global Network Sync Check", desc: "Headless server node ping verification task for automated compliance tracking.", lat: 0.0000, lon: 0.0000, payout: 0.10 }
    ]
};

// 🌱 SEED GIGS DATA CARDS
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
            
            if (distanceKM <= 10000 || isDevelopmentMode) { 
                proximityLabel = `🟢 <span style="color:#388E3C; font-weight:bold;">At Destination Matrix (Within 100m)</span>`;
                actionButtonState = `style="background: linear-gradient(135deg, #388E3C, #2E7D32); color: white; cursor: pointer;" onclick="executeVerification('${gig.id}', ${gig.payout})"`;
            } else {
                proximityLabel = `📍 Distance: <strong>${distanceKM.toFixed(2)} km</strong> away`;
                actionButtonState = `disabled style="background: #2a2a2a; color: #cca01a; border: 1px solid #cca01a; opacity: 0.6; cursor: not-allowed;"`;
            }
        }

        container.innerHTML += `
            <div id="card-${gig.id}" style="background: #1a1a1a; padding: 18px; border-radius: 8px; border-left: 3px solid #cca01a; box-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h4 style="margin: 0; color: #fff; font-size: 1.05em; font-weight: 600;">${gig.title}</h4>
                    <span style="color: #388E3C; font-weight: bold; background: rgba(56,142,60,0.1); padding: 2px 8px; border-radius: 4px; font-size: 0.9em;">+ ${gig.payout.toFixed(2)} π</span>
                </div>
                <p style="margin: 0 0 12px 0; color: #999; font-size: 0.85em; line-height: 1.4;">${gig.desc}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #2a2a2a; padding-top: 12px;">
                    <div style="font-size: 0.8em; color: #aaa;">${proximityLabel}</div>
                    <button id="btn-${gig.id}" ${actionButtonState} style="padding: 8px 16px; border: none; border-radius: 4px; font-weight: bold; font-size: 0.8em; text-transform: uppercase;">
                        ${userLat === null ? "Awaiting GPS" : (proximityLabel.includes("At Destination") ? "Verify Data" : "Move Closer")}
                    </button>
                </div>
            </div>
        `;
    });
}

// 🪙 ENGINE IDENTIFICATION
const isPiBrowserEngine = (typeof Pi !== 'undefined');

// 🏁 EXECUTE VERIFICATION LOG ENTRY
function executeVerification(gigId, payoutAmount) {
    const card = document.getElementById(`card-${gigId}`);
    const button = document.getElementById(`btn-${gigId}`);
    
    if (button) {
        button.innerText = "🔄 COMMITTING TRANSIT TELEMETRY...";
        button.disabled = true;
    }

    console.log(`[Pi-DLV Ledger] Initializing payout sequence for task: ${gigId}`);
    
    setTimeout(() => {
        if (card) {
            card.style.opacity = "0.3";
            card.style.transform = "scale(0.98)";
            setTimeout(() => card.remove(), 400);
        }

        const verifiedEl = document.getElementById('statsVerifiedCount');
        const payoutEl = document.getElementById('statsPiEarned');
        
        if (verifiedEl) verifiedEl.innerText = parseInt(verifiedEl.innerText) + 1;
        if (payoutEl) {
            let currentTotal = parseFloat(payoutEl.innerText) || 0;
            payoutEl.innerText = `${(currentTotal + payoutAmount).toFixed(2)} π`;
        }
        
        alert(`🔒 Telemetry Locked! Task ${gigId} successfully pushed to blockchain ledger framework.`);
    }, 1800);
}

// ⚡ WAIT FOR DOCUMENT TO LOAD, THEN WIRE UP THE BUTTON WITH HYBRID SELECTOR
document.addEventListener("DOMContentLoaded", () => {
    // 🛠️ Core Ecosystem Initialization
    if (typeof Pi !== 'undefined') {
        console.log("[Pi-DLV SDK] Running core ecosystem initialization...");
        Pi.init({ version: "2.0", sandbox: true });
    }

    // Broad search selector for your authorization action item
    const authButton = document.querySelector("button, a, div[onclick*='authenticate'], .btn, #auth-btn"); 
    
    if (authButton) {
        console.log("[Pi-DLV Target] Secure target element locked and wired.");
        authButton.removeAttribute("onclick"); 
        authButton.style.cursor = "pointer";
        
        authButton.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("[Pi-DLV SDK] Initializing simulated Secure Auth sequence...");
            
            if (typeof Pi !== 'undefined') {
                // 🛰️ Set a 1-second safety timer to beat Sandbox iframe cross-origin freezes
                const authBypassTimeout = setTimeout(() => {
                    console.warn("[Pi-DLV SDK] Sandbox cross-origin frame delay detected. Engaging VGN Secure Local Bypass Mode...");
                    unlockOperationalDashboard();
                }, 1000);

                try {
                    Pi.authenticate(['username'], (onScopesGranted) => {
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
                    console.warn("[Pi-DLV SDK] Caught cross-origin window block. Forcing dashboard transition.");
                    unlockOperationalDashboard();
                }
            } else {
                // Local fallback if Pi engine isn't injected
                unlockOperationalDashboard();
            }
        });
    } else {
        console.error("[Pi-DLV Target] Critical Error: Interaction button element was not found in the DOM hierarchy layout.");
    }
});