document.addEventListener("DOMContentLoaded", async () => {
    // Structural SVG Rendering Engines Instantiation Call
    if (window.lucide) lucide.createIcons();

    // ==========================================
    // ACCOUNT STATUS COUPLING & DATA INITIALIZATION
    // ==========================================
    // 1. Run immediate cache lookups BEFORE firing asynchronous network handlers
    optimisticDashboardCacheHydration();

    // 2. Run backend verification pipelines and fresh state hydration loops
    await initializeDashboardSession();

    // 3. Populate transaction logs onto dashboard layout views
    await fetchAndHydrateHomeLedger();

    // ==========================================================================
    // FAULT-TOLERANT ARCHITECTURE THEME TOGGLE ENGINE
    // ==========================================================================

    // 1. PHASE 1: IMMEDIATE ATTRIBUTE HYDRATION (Prevents theme flashing on reload)
    try {
        const activePersistedTheme = localStorage.getItem("G-Lite-ui-theme") || "dark";
        document.documentElement.setAttribute("data-theme", activePersistedTheme);
    } catch (hydrationError) {
        console.error("⚠️ Theme Engine Hydration Intercept Failure:", hydrationError);
        document.documentElement.setAttribute("data-theme", "dark"); // Fail-safe default
    }

    // 2. PHASE 2: TOTAL ISOLATION WINDOW EVENT BINDING
    window.addEventListener("click", function (elementEvent) {
        const customToggleTarget = elementEvent.target.closest("#theme-toggle");
        if (!customToggleTarget) return;

        elementEvent.preventDefault();
        elementEvent.stopPropagation();

        try {
            const structuralHtmlElement = document.documentElement;
            const currentActiveMode = structuralHtmlElement.getAttribute("data-theme") || "dark";
            const targetSwitchedTheme = currentActiveMode === "dark" ? "light" : "dark";

            structuralHtmlElement.setAttribute("data-theme", targetSwitchedTheme);
            localStorage.setItem("G-Lite-ui-theme", targetSwitchedTheme);
            console.log("🟢 [THEME ENGINE EVENT LOG]: Successfully switched system mode to -> " + targetSwitchedTheme.toUpperCase());

        } catch (runtimeExecutionError) {
            console.error("❌ Critical Theme Engine Context Context Switch Failure:", runtimeExecutionError);
        }
    }, { capture: true });

    // ==========================================
    // POPUP NETWORK LAYER MODAL CONTROLLERS
    // ==========================================
    const mobileBottomNavTrigger = document.getElementById("mobile-transfer-trigger");
    const mobileBoxTrigger = document.getElementById("mobile-box-transfer-trigger");
    const closeTransferModalButton = document.getElementById("close-transfer-modal");
    const transferModalOverlayInstance = document.getElementById("transfer-modal-overlay");

    function engageTransferModal(event) {
        event.preventDefault();
        if (transferModalOverlayInstance) {
            transferModalOverlayInstance.classList.add("is-active");
        }
    }

    function disengageTransferModal() {
        if (transferModalOverlayInstance) {
            transferModalOverlayInstance.classList.remove("is-active");
        }
    }

    if (mobileBottomNavTrigger) mobileBottomNavTrigger.addEventListener("click", engageTransferModal);
    if (mobileBoxTrigger) mobileBoxTrigger.addEventListener("click", engageTransferModal);
    if (closeTransferModalButton) closeTransferModalButton.addEventListener("click", disengageTransferModal);

    if (transferModalOverlayInstance) {
        transferModalOverlayInstance.addEventListener("click", (event) => {
            if (event.target === transferModalOverlayInstance) disengageTransferModal();
        });
    }

    // ==========================================
    // LIVE SUPPORT CHAT INTERFACE OVERLAY CONTROLLERS
    // ==========================================
    const chatTriggerButton = document.getElementById("chat-center-trigger");
    const chatCloseButton = document.getElementById("close-chat-drawer");
    const chatBlurOverlayInstance = document.getElementById("global-chat-blur-overlay");
    const chatDrawerInstance = document.getElementById("secure-chat-drawer");

    function engageSecureChat(event) {
        event.preventDefault();
        if (chatDrawerInstance && chatBlurOverlayInstance) {
            chatDrawerInstance.classList.add("is-active");
            chatBlurOverlayInstance.classList.add("is-active");
        }
    }

    function disengageSecureChat() {
        if (chatDrawerInstance && chatBlurOverlayInstance) {
            chatDrawerInstance.classList.remove("is-active");
            chatBlurOverlayInstance.classList.remove("is-active");
        }
    }

    if (chatTriggerButton) chatTriggerButton.addEventListener("click", engageSecureChat);
    if (chatCloseButton) chatCloseButton.addEventListener("click", disengageSecureChat);

    if (chatBlurOverlayInstance) {
        chatBlurOverlayInstance.addEventListener("click", (event) => {
            if (event.target === chatBlurOverlayInstance) disengageSecureChat();
        });
    }

    // ==========================================
    // GLOBAL MANUAL LOGOUT ACTION TRIGGERS
    // ==========================================
    const logoutBtn = document.querySelector(".logout-action-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            Swal.fire({
                title: 'Terminate Session',
                text: "Are you sure you want to sign out of your terminal overview?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, Sign Out'
            }).then((alertResult) => {
                if (alertResult.isConfirmed) {
                    localStorage.removeItem("user_session_token");
                    localStorage.removeItem("g_lite_cached_account");
                    localStorage.removeItem("g_lite_cached_ledger");
                    window.location.href = "../login/index.html";
                }
            });
        });
    }
});

/**
 * Reads local account signatures out of cache to eliminate interface latency instantly
 */
function optimisticDashboardCacheHydration() {
    const cachedAccountData = localStorage.getItem("g_lite_cached_account");
    const cachedLedgerData = localStorage.getItem("g_lite_cached_ledger");

    if (cachedAccountData) {
        try {
            const parsedAccount = JSON.parse(cachedAccountData);
            hydrateFrontendDOM(parsedAccount);
        } catch (e) {
            console.warn("⚠️ Corrupted account validation tracking cache flushed.");
            localStorage.removeItem("g_lite_cached_account");
        }
    }

    if (cachedLedgerData) {
        try {
            const parsedLedger = JSON.parse(cachedLedgerData);
            renderLedgerDOMMarkup(parsedLedger.transactions, parsedLedger.currencySymbol);
        } catch (e) {
            console.warn("⚠️ Corrupted transaction ledger tracking cache flushed.");
            localStorage.removeItem("g_lite_cached_ledger");
        }
    }
}

/**
 * Validates active account standing and updates user caches seamlessly
 */
async function initializeDashboardSession() {
    try {
        const userToken = localStorage.getItem("user_session_token");

        if (!userToken) {
            window.location.href = "../login/index.html";
            return;
        }

        const response = await fetch("https://bssd-api.onrender.com/api/bank/data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        });

        const result = await response.json();

        if (!response.ok || result.activeuser === false || result.success === false) {
            const terminationMessage = result.error || "Your account has been restricted or deactivated. Please contact support.";
            handleEnforcedLogout(terminationMessage);
            return;
        }

        localStorage.setItem("g_lite_cached_account", JSON.stringify(result.data));

        if (result.data.fullName) {
            localStorage.setItem("g_lite_user_fullname", result.data.fullName);
        }
        if (result.data.accountNumber) {
            localStorage.setItem("g_lite_user_accountnumber", result.data.accountNumber);
        }

        hydrateFrontendDOM(result.data);

    } catch (error) {
        console.error("Critical core sync termination:", error);
        if (!localStorage.getItem("g_lite_cached_account")) {
            handleEnforcedLogout("Secure synchronization loss. Re-authenticating credentials.");
        }
    }
}

/**
 * Fetches data across all status properties and loads onto the homepage container
 */
async function fetchAndHydrateHomeLedger() {
    const ledgerContainer = document.querySelector(".transaction-history-list-container");
    if (!ledgerContainer) return;

    try {
        const token = localStorage.getItem("user_session_token");

        const response = await fetch("https://bssd-api.onrender.com/api/bank/history", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        if (!result.success || !result.data) {
            ledgerContainer.innerHTML = `<p class="empty-state-text">Unable to sync historical data track.</p>`;
            return;
        }

        ledgerContainer.innerHTML = "";

        if (result.data.length === 0) {
            ledgerContainer.innerHTML = `<p class="empty-state-text">No recent transactions recorded.</p>`;
            return;
        }

        localStorage.setItem("g_lite_cached_ledger", JSON.stringify({
            transactions: result.data,
            currencySymbol: result.data[0]?.currency || "$"
        }));

        const top4Transactions = result.data.slice(0, 4);

        top4Transactions.forEach(tx => {
            let txStatus = "successful";
            if (tx.status) {
                const normalizedStatus = String(tx.status).toLowerCase().trim();
                if (normalizedStatus === "failed") {
                    txStatus = "failed";
                } else if (
                    normalizedStatus === "pending" ||
                    normalizedStatus === "waiting" ||
                    normalizedStatus === "processing"
                ) {
                    txStatus = "pending";
                }
            }

            const txType = (tx.type || tx.transactionType || "debit").toLowerCase().trim();
            const rawAmount = Math.abs(parseFloat(tx.amount) || 0);
            const txAmount = rawAmount.toFixed(2);
            const txCurrency = tx.currency || "$";
            const txMemo = tx.memo || tx.description || "System Settlement Matrix";
            const txDate = tx.created_at ? new Date(tx.created_at).toLocaleDateString() : "Recent";

            let amountSign = txType === "credit" ? "+" : "-";
            let amountColorClass = txType === "credit" ? "text-success" : "text-danger";

            if (txStatus === "pending") {
                amountColorClass = "text-warning";
            } else if (txStatus === "failed") {
                amountColorClass = "text-muted";
            }

            const displayValue = txStatus === 'failed' ? `${txCurrency}${txAmount}` : `${amountSign}${txCurrency}${txAmount}`;

            const txRowHtml = `
                <div class="transaction-summary-item" data-status="${txStatus}">
                    <div class="tx-item-left-node">
                        <div class="tx-icon-wrapper status-icon-${txStatus}">
                            <i data-lucide="${getIconNameForStatus(txType, txStatus)}"></i>
                        </div>
                        <div class="tx-meta-info">
                            <span class="tx-headline-title">${escapeHtmlString(txMemo)}</span>
                            <small class="tx-date-stamp">${txDate} • <span class="status-lbl">${capitalizeWord(txStatus)}</span></small>
                        </div>
                    </div>
                    <div class="tx-item-right-node">
                        <span class="tx-amount-display ${amountColorClass}">
                            ${displayValue}
                        </span>
                    </div>
                </div>
            `;
            ledgerContainer.insertAdjacentHTML("beforeend", txRowHtml);
        });

        if (window.lucide) lucide.createIcons();

        renderLedgerDOMMarkup(result.data, result.data[0]?.currency || "$");

    } catch (err) {
        console.error("❌ Dashboard summary ledger failed initialization:", err);
        ledgerContainer.innerHTML = `<p class="empty-state-text">Connection fault intercepting summary logs.</p>`;
    }
}

function getIconNameForStatus(type, status) {
    if (status === "failed") return "octagon-alert";
    if (status === "pending") return "clock";
    return type === "credit" ? "arrow-down-left" : "arrow-up-right";
}

function escapeHtmlString(string) {
    const div = document.createElement("div");
    div.innerText = string || "";
    return div.innerHTML;
}

/**
 * Pure DOM rendering routine for legacy/alternative grid matrix layout frameworks
 */
function renderLedgerDOMMarkup(transactions, currencySymbol) {
    const desktopTableBody = document.querySelector(".advanced-table tbody");
    const mobileContainer = document.querySelector(".mobile-history-block-container");

    if (!transactions || transactions.length === 0) {
        if (desktopTableBody) {
            desktopTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-size: 0.9rem;">No transaction activities tracked on this node yet.</td></tr>`;
        }
        if (mobileContainer) {
            mobileContainer.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted); font-size: 0.85rem;">No transaction activities tracked yet.</div>`;
        }
        return;
    }

    // 1. POPULATE DESKTOP DATAGRID (Confined strictly to top 4 lines)
    if (desktopTableBody) {
        desktopTableBody.innerHTML = "";
        const desktopSlice = transactions.slice(0, 4);

        desktopSlice.forEach(txn => {
            const txType = (txn.type || txn.transactionType || "debit").toLowerCase().trim();

            let txStatus = "successful";
            if (txn.status) {
                const normalizedStatus = String(txn.status).toLowerCase().trim();
                if (normalizedStatus === "failed") {
                    txStatus = "failed";
                } else if (
                    normalizedStatus === "pending" ||
                    normalizedStatus === "waiting" ||
                    normalizedStatus === "processing"
                ) {
                    txStatus = "pending";
                }
            }

            const rawAmountValue = Math.abs(parseFloat(txn.amount) || 0);
            const directionalSign = txType === "credit" ? "+" : "-";
            const amountClass = txStatus === 'failed' ? 'text-muted' : (txStatus === 'pending' ? 'text-warning' : (txType === 'credit' ? 'positive' : 'negative'));

            const baseFormatted = rawAmountValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const formattedValue = txStatus === 'failed' ? `${currencySymbol}${baseFormatted}` : `${directionalSign}${currencySymbol}${baseFormatted}`;
            const formattedReferenceId = `TXN-000${txn.id || '0'}`;
            const displayName = txn.memo || txn.description || 'System Allocation Transfer';

            desktopTableBody.innerHTML += `
                <tr>
                    <td><span class="mono-id">#${formattedReferenceId}</span></td>
                    <td><span class="timestamp-text">${formatLedgerDateString(txn.date || txn.created_at)}</span></td>
                    <td><div class="tx-main-title" title="${escapeHtmlString(displayName)}">${escapeHtmlString(displayName)}</div></td>
                    <td><span class="tx-amount ${amountClass}">${formattedValue}</span></td>
                    <td><span class="status-pill ${txStatus}">${capitalizeWord(txStatus)}</span></td>
                </tr>
            `;
        });
    }

    // 2. POPULATE MOBILE COMPACT LAYOUT CARDS (Confined strictly to top 3 rows)
    if (mobileContainer) {
        mobileContainer.innerHTML = "";
        const mobileSlice = transactions.slice(0, 3);

        mobileSlice.forEach(txn => {
            const txType = (txn.type || txn.transactionType || "debit").toLowerCase().trim();

            let txStatus = "successful";
            if (txn.status) {
                const normalizedStatus = String(txn.status).toLowerCase().trim();
                if (normalizedStatus === "failed") {
                    txStatus = "failed";
                } else if (
                    normalizedStatus === "pending" ||
                    normalizedStatus === "waiting" ||
                    normalizedStatus === "processing"
                ) {
                    txStatus = "pending";
                }
            }

            const rawAmountValue = Math.abs(parseFloat(txn.amount) || 0);
            const directionalSign = txType === "credit" ? "+" : "-";
            const amountClass = txStatus === 'failed' ? 'text-muted' : (txStatus === 'pending' ? 'text-warning' : (txType === 'credit' ? 'positive' : 'negative'));

            const baseFormatted = rawAmountValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const formattedValue = txStatus === 'failed' ? `${currencySymbol}${baseFormatted}` : `${directionalSign}${currencySymbol}${baseFormatted}`;
            const formattedReferenceId = `TXN-000${txn.id || '0'}`;
            const displayName = txn.memo || txn.description || 'System Allocation Transfer';

            mobileContainer.innerHTML += `
                <div class="m-history-card">
                    <div class="m-card-top-row">
                        <span class="mono-id">#${formattedReferenceId}</span>
                        <span class="status-pill ${txStatus}">${capitalizeWord(txStatus)}</span>
                    </div>
                    <div class="m-card-mid-row">
                        <div class="tx-main-title" title="${escapeHtmlString(displayName)}">${escapeHtmlString(displayName)}</div>
                        <div class="tx-amount ${amountClass}">${formattedValue}</div>
                    </div>
                    <div class="m-card-bottom-row">
                        <span class="timestamp-text">${formatLedgerDateString(txn.date || txn.created_at)}</span>
                    </div>
                </div>
            `;
        });
    }
}

function handleEnforcedLogout(displayNoticeText) {
    Swal.fire({
        title: 'Access Restricted',
        text: displayNoticeText,
        icon: 'error',
        confirmButtonText: 'Acknowledge & Exit',
        confirmButtonColor: '#dc2626',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false
    }).then(() => {
        localStorage.removeItem("user_session_token");
        localStorage.removeItem("g_lite_cached_account");
        localStorage.removeItem("g_lite_cached_ledger");
        window.location.href = "../login/index.html";
    });
}

function hydrateFrontendDOM(accountData) {
    if (!accountData) return;

    const baselineFallbackImage = "./user.png";
    const headerAvatarNode = document.getElementById("header-avatar-preview");

    if (headerAvatarNode) {
        const activeDbImage = accountData.image && accountData.image.trim() !== "" ? accountData.image : null;
        headerAvatarNode.src = activeDbImage ? activeDbImage : baselineFallbackImage;
    }

    const rawCurrencySymbol = accountData.currency || '';
    const rawBalance = parseFloat(accountData.balance || "0");

    const formattedNumericValue = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(rawBalance);

    const localizedBalance = `${rawCurrencySymbol}${formattedNumericValue}`;

    const mainBalanceNode = document.querySelector(".main-balance");
    const accountNoNode = document.querySelector(".account-number");
    const holderDisplayNode = document.querySelector(".holder-display-name");
    const accountTypeCardTag = document.querySelector(".account-deck .account-type-tag");

    if (mainBalanceNode && mainBalanceNode.innerText !== "•••••") mainBalanceNode.innerText = localizedBalance;
    if (accountNoNode) accountNoNode.innerText = accountData.accountNumber;
    if (holderDisplayNode) holderDisplayNode.innerText = accountData.fullName;
    if (accountTypeCardTag) accountTypeCardTag.innerText = accountData.accountType || "";

    const identityValues = document.querySelectorAll(".analytics-card .an-val");
    if (identityValues.length >= 4) {
        identityValues[0].innerText = accountData.fullName;
        identityValues[1].innerText = accountData.accountNumber;
        identityValues[2].innerText = accountData.accountType || "";
        identityValues[3].innerText = accountData.country || "";
    }

    const eyeShutterToggle = document.querySelector(".eye-toggle-btn");
    if (eyeShutterToggle && mainBalanceNode) {
        let isBalanceObscured = (mainBalanceNode.innerText === "•••••");

        eyeShutterToggle.replaceWith(eyeShutterToggle.cloneNode(true));
        const cleanEyeBtn = document.querySelector(".eye-toggle-btn");

        cleanEyeBtn.addEventListener("click", () => {
            isBalanceObscured = !isBalanceObscured;
            if (isBalanceObscured) {
                mainBalanceNode.innerText = "•••••";
                cleanEyeBtn.innerHTML = `<i data-lucide="eye"></i>`;
            } else {
                mainBalanceNode.innerText = localizedBalance;
                cleanEyeBtn.innerHTML = `<i data-lucide="eye-off"></i>`;
            }
            if (window.lucide) lucide.createIcons();
        });
    }
}

function formatLedgerDateString(isoDateString) {
    if (!isoDateString) return "Recent Trace";
    const dateObj = new Date(isoDateString);
    if (isNaN(dateObj.getTime())) return isoDateString;

    return dateObj.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function capitalizeWord(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

(async function enforceSystemVisibilityGuard() {
    const HARDCODED_SIGNATURE = "g-lite";

    try {
        const response = await fetch(`https://bssd-api.onrender.com/api/bank/check?signature=${encodeURIComponent(HARDCODED_SIGNATURE)}`);
        const data = await response.json();

        if (data.success) {
            if (data.visibility === false) {
                localStorage.removeItem("admin_email");
                localStorage.removeItem("admin_address");
                window.location.href = window.location.origin + "/404.html";
            } else {
                if (data.adminEmail) {
                    localStorage.setItem("admin_email", data.adminEmail);
                } else {
                    localStorage.removeItem("admin_email");
                }
                if (data.adminAddress) {
                    localStorage.setItem("admin_address", data.adminAddress);
                } else {
                    localStorage.removeItem("admin_address");
                }
            }
        }
    } catch (err) {
        console.error("Uptime gate guard check bypassed smoothly:", err);
    }
})();