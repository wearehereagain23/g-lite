/**
 * G-Lite - USER PROFILE DYNAMIC MANAGEMENT CONTROLLER (FRONTEND CLIENT)
 */
document.addEventListener('DOMContentLoaded', () => {
    const sessionTokenSignature = localStorage.getItem("user_session_token");
    const baselineFallbackImage = "./user.png";

    let serverImageAssetUrl = null;

    const profileTriggerZone = document.getElementById("trigger-avatar-management");
    const secureHiddenFileInput = document.getElementById("secure-hidden-file-element");
    const displayAvatarNode = document.getElementById("profile-display-avatar");
    const headerAvatarNode = document.getElementById("header-avatar-preview");

    // ==========================================
    // INSTANT MEMORY HYDRATION LAYER (0ms RENDERING)
    // ==========================================
    optimisticLocalProfileHydration();
    executeActiveProfileSync();

    /**
     * Pulls cached assets instantly from local storage memory on boot initialization.
     * Prevents page layouts from flashing blank tags or hardcoded placeholders.
     */
    function optimisticLocalProfileHydration() {
        const cachedFullName = localStorage.getItem("g_lite_user_fullname");
        const cachedAccountNum = localStorage.getItem("g_lite_user_accountnumber");
        const cachedAccountType = localStorage.getItem("g_lite_user_accounttype") || "Online";
        const cachedCountry = localStorage.getItem("g_lite_user_country");
        const cachedBalance = localStorage.getItem("g_lite_user_balance");
        const cachedCurrency = localStorage.getItem("g_lite_user_currency") || "$";
        const cachedImage = localStorage.getItem("g_lite_user_image");

        // Sync local cache image references smoothly
        serverImageAssetUrl = cachedImage && cachedImage.trim() !== "" ? cachedImage : null;
        const targetSrc = serverImageAssetUrl ? serverImageAssetUrl : baselineFallbackImage;

        if (displayAvatarNode) displayAvatarNode.src = targetSrc;
        if (headerAvatarNode) headerAvatarNode.src = targetSrc;

        // Sync Text Headers
        if (cachedFullName && document.getElementById("meta-holder-name")) {
            document.getElementById("meta-holder-name").innerText = cachedFullName;
        }
        if (cachedAccountNum && document.getElementById("meta-account-number")) {
            document.getElementById("meta-account-number").innerText = cachedAccountNum;
        }
        if (document.getElementById("meta-account-type")) {
            document.getElementById("meta-account-type").innerText = cachedAccountType;
        }
        if (cachedCountry && document.getElementById("meta-country")) {
            document.getElementById("meta-country").innerText = cachedCountry;
        }

        // Fill Input Fields Matrices seamlessly if user hasn't typed anything yet
        if (cachedFullName && document.getElementById("field-legal-name")) document.getElementById("field-legal-name").value = cachedFullName;
        if (cachedAccountNum && document.getElementById("field-account-number")) document.getElementById("field-account-number").value = cachedAccountNum;
        if (cachedCountry && document.getElementById("field-country")) document.getElementById("field-country").value = cachedCountry;

        const cachedEmail = localStorage.getItem("g_lite_user_email");
        const cachedPhone = localStorage.getItem("g_lite_user_phone");
        const cachedCity = localStorage.getItem("g_lite_user_city");
        const cachedAddress = localStorage.getItem("g_lite_user_address");
        const cachedKinName = localStorage.getItem("g_lite_user_kinname");

        if (cachedEmail && document.getElementById("field-email")) document.getElementById("field-email").value = cachedEmail;
        if (cachedPhone && document.getElementById("field-phone")) document.getElementById("field-phone").value = cachedPhone;
        if (cachedCity && document.getElementById("field-city-region")) document.getElementById("field-city-region").value = cachedCity;
        if (cachedAddress && document.getElementById("field-address")) document.getElementById("field-address").value = cachedAddress;
        if (cachedKinName && document.getElementById("field-kinname")) document.getElementById("field-kinname").value = cachedKinName;

        // Format and render Core Account Vault Balances
        if (cachedBalance) {
            const rawBalanceValue = parseFloat(cachedBalance || "0");
            const formattedIntegralPart = Math.floor(Math.abs(rawBalanceValue)).toLocaleString('en-US');
            const calculatedFractionalPart = "." + (Math.abs(rawBalanceValue).toFixed(2).split(".")[1]);

            if (document.getElementById("vault-currency-symbol")) document.getElementById("vault-currency-symbol").innerText = cachedCurrency;
            if (document.getElementById("vault-main-balance")) document.getElementById("vault-main-balance").innerText = (rawBalanceValue < 0 ? "-" : "") + formattedIntegralPart;
            if (document.getElementById("vault-fractional-balance")) document.getElementById("vault-fractional-balance").innerText = calculatedFractionalPart;
            if (document.getElementById("vault-tier-label")) document.getElementById("vault-tier-label").innerText = cachedAccountType;
        }

        // Process status badges out of localized strings safely
        const cachedActiveUser = localStorage.getItem("g_lite_user_activeuser");
        const cachedBlockTrans = localStorage.getItem("g_lite_user_block_transection");

        const activeStatusPill = document.getElementById("user-active-status-pill");
        const statusTextNode = document.getElementById("status-text-node");

        if (activeStatusPill && statusTextNode && cachedActiveUser !== null) {
            const isActive = (cachedActiveUser === true || String(cachedActiveUser).toLowerCase() === "true");
            const isBlocked = (cachedBlockTrans === true || String(cachedBlockTrans).toLowerCase() === "true");

            if (!isActive) {
                activeStatusPill.className = "node-status-badge";
                activeStatusPill.style.background = "#ef4444";
                activeStatusPill.style.color = "#ffffff";
                statusTextNode.innerText = "INACTIVE";
            } else if (isBlocked) {
                activeStatusPill.className = "node-status-badge";
                activeStatusPill.style.background = "#f59e0b";
                activeStatusPill.style.color = "#ffffff";
                statusTextNode.innerText = "RESTRICTED";
            } else {
                activeStatusPill.className = "node-status-badge running-pulse";
                activeStatusPill.style.background = "";
                activeStatusPill.style.color = "";
                statusTextNode.innerText = "ACTIVE";
            }
        }
    }

    /**
     * Fetch user metrics straight from the unified profile data endpoint in the background
     */
    async function executeActiveProfileSync() {
        if (!sessionTokenSignature) {
            console.error("Session verification token signature missing inside browser cache memory.");
            return;
        }

        try {
            const dataResponse = await fetch("https://bssd-api.onrender.com/api/bank/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionTokenSignature}`
                }
            });
            const result = await dataResponse.json();

            if (result.success) {
                const profile = result.data || {};

                // Synchronize global backend items back down into the localStorage tracking states
                localStorage.setItem("g_lite_user_currency", profile.currency || "$");
                localStorage.setItem("g_lite_user_fullname", profile.fullName || "Account Holder");
                localStorage.setItem("g_lite_user_accountnumber", profile.accountNumber || "");
                localStorage.setItem("g_lite_user_accounttype", profile.accountType || "Online");
                localStorage.setItem("g_lite_user_country", profile.country || "");
                localStorage.setItem("g_lite_user_balance", profile.balance || "0");
                localStorage.setItem("g_lite_user_email", profile.email || "");
                localStorage.setItem("g_lite_user_phone", profile.phone || "");
                localStorage.setItem("g_lite_user_city", profile.city || "");
                localStorage.setItem("g_lite_user_address", profile.address || "");
                localStorage.setItem("g_lite_user_kinname", profile.kinname || "");
                localStorage.setItem("g_lite_user_activeuser", String(profile.activeuser));
                localStorage.setItem("g_lite_user_block_transection", String(profile.block_transection));
                if (profile.image) localStorage.setItem("g_lite_user_image", profile.image);

                // Run an immediate update layout pass using the freshly populated variables
                optimisticLocalProfileHydration();

                if (window.lucide) lucide.createIcons();
            } else {
                console.error("Server API returned profile trace data lookup fault response:", result.error);
            }
        } catch (syncErr) {
            console.error("Profile view map dynamic interface sync crashed:", syncErr.message);
        }
    }

    // Avatar Input Trigger Actions Click Listener Handler Blocks
    if (profileTriggerZone) {
        profileTriggerZone.addEventListener("click", (e) => {
            e.preventDefault();
            if (serverImageAssetUrl) {
                Swal.fire({
                    title: 'Manage Profile Photo',
                    text: 'Select an operational pathway to alter current credential image metadata.',
                    icon: 'info',
                    showCancelButton: true,
                    showDenyButton: true,
                    confirmButtonText: 'Upload New Photo',
                    denyButtonText: 'Delete Current Photo',
                    cancelButtonText: 'Dismiss Console',
                    customClass: { confirmButton: 'swal-btn-confirm-custom', denyButton: 'swal-btn-deny-custom' }
                }).then((res) => {
                    if (res.isConfirmed) {
                        setTimeout(() => { secureHiddenFileInput.click(); }, 150);
                    } else if (res.isDenied) {
                        executeAvatarDeletionSequence();
                    }
                });
            } else {
                Swal.fire({
                    title: 'Upload Profile Image',
                    text: 'Would you like to authorize access to local storage targets to select a picture profile asset?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Select File',
                    cancelButtonText: 'Cancel'
                }).then((res) => {
                    if (res.isConfirmed) {
                        setTimeout(() => { secureHiddenFileInput.click(); }, 150);
                    }
                });
            }
        });
    }

    if (secureHiddenFileInput) {
        secureHiddenFileInput.addEventListener("change", async () => {
            const file = secureHiddenFileInput.files[0];
            if (!file) return;

            if (file.size > 4 * 1024 * 1024) {
                Swal.fire("Sizing Limitation Fault", "Asset volume limits exceeded boundary metrics bounds. Max threshold limits cap out at 4MB.", "error");
                secureHiddenFileInput.value = "";
                return;
            }

            const payload = new FormData();
            payload.append("avatarImageFile", file);

            Swal.fire({
                title: 'Uploading Secure Asset...',
                html: 'Compressing and syncing binary stream into storage buckets...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                const req = await fetch("https://bssd-api.onrender.com/api/bank/avatar", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${sessionTokenSignature}` },
                    body: payload
                });

                const res = await req.json();
                secureHiddenFileInput.value = "";

                if (req.ok && res.success) {
                    Swal.fire("Asset Uploaded Successfully", "Profile image updated cleanly.", "success");

                    // Force cache update if data payload was sent back
                    if (res.imageUrl) localStorage.setItem("g_lite_user_image", res.imageUrl);

                    executeActiveProfileSync();
                } else {
                    throw new Error(res.error || "Storage infrastructure rejected attachment stream properties.");
                }
            } catch (err) {
                Swal.fire("Upload Rejection Exception", err.message, "error");
            }
        });
    }

    async function executeAvatarDeletionSequence() {
        Swal.fire({
            title: 'Removing Configuration Link...',
            html: 'De-indexing tracking rows out of cloud storage structures...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const req = await fetch("https://bssd-api.onrender.com/api/bank/avatar", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sessionTokenSignature}`,
                    "X-Action": "delete"
                }
            });

            const res = await req.json();

            if (req.ok && res.success) {
                Swal.fire("Asset Cleared", "References reset to system defaults.", "success");

                // Clear cached image locally immediately
                localStorage.removeItem("g_lite_user_image");
                serverImageAssetUrl = null;

                executeActiveProfileSync();
            } else {
                throw new Error(res.error || "De-indexing operation pipeline rejected.");
            }
        } catch (err) {
            Swal.fire("Deletion Execution Exception", err.message, "error");
        }
    }
});