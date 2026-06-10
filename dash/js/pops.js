/**
 * Global Interceptors & Core Popup Controllers
 * Handles dynamic rendering of the theme-adaptive Transfer Protocol modal.
 */
document.addEventListener('DOMContentLoaded', () => {

    // Global click delegation listener to capture deposit events
    document.addEventListener('click', (event) => {
        const depositTrigger = event.target.closest('.global-deposit-trigger');
        const transferTrigger = event.target.closest('.global-transfer-trigger');

        if (depositTrigger) {
            event.preventDefault();
            renderGlobalDepositModal();
        } else if (transferTrigger) {
            event.preventDefault();
            renderGlobalTransferModal();
        }
    });

    /**
     * Instantiates and launches the structural layout matrix inside SweetAlert2
     * Pulls live account parameters instantly out of local storage cache structures.
     */
    function renderGlobalDepositModal() {
        // 1. OPTIMISTIC HYDRATION LAYER: Instantly read account variables out of your session memory cache
        // These keys map directly against what your master index.js script populates on initialization.
        const cachedFullName = localStorage.getItem("g_lite_user_fullname") || "Active Account Holder";
        const cachedAccountNum = localStorage.getItem("g_lite_user_accountnumber") || "Trace Suspended";

        let depositData = {
            bankName: "G-Lite Bank",
            holderName: cachedFullName,
            accountNumber: cachedAccountNum
        };

        // 2. FIRE UP THE LAYOUT MODAL INSTANTLY — 0ms Latency loading delay
        Swal.fire({
            title: 'Fund Your Account',
            html: `
                <div class="swal-deposit-container">
                    <p class="swal-deposit-instructions">
                        Execute an external wire transfer from your retail banking application using the strict routing parameters below.
                    </p>
                    
                    <div class="swal-matrix-row">
                        <div class="swal-meta-block">
                            <div class="swal-label-row">
                                <span class="swal-meta-label">Settlement Bank</span>
                                <span class="copy-feedback-text">Copied!</span>
                            </div>
                            <div class="swal-meta-val">${depositData.bankName}</div>
                        </div>
                        <button class="swal-copy-btn" data-copy-payload="${depositData.bankName}" title="Copy Bank Name">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    </div>

                    <div class="swal-matrix-row">
                        <div class="swal-meta-block">
                            <div class="swal-label-row">
                                <span class="swal-meta-label">Account Holder</span>
                                <span class="copy-feedback-text">Copied!</span>
                            </div>
                            <div class="swal-meta-val id-modal-holder-target">${depositData.holderName}</div>
                        </div>
                        <button class="swal-copy-btn" data-copy-payload="${depositData.holderName}" title="Copy Holder Name">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    </div>

                    <div class="swal-matrix-row">
                        <div class="swal-meta-block">
                            <div class="swal-label-row">
                                <span class="swal-meta-label">Account Number</span>
                                <span class="copy-feedback-text">Copied!</span>
                            </div>
                            <div class="swal-meta-val swal-mono-id id-modal-account-target">${depositData.accountNumber}</div>
                        </div>
                        <button class="swal-copy-btn" data-copy-payload="${depositData.accountNumber}" title="Copy Account Number">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'Dismiss',
            buttonsStyling: false,
            allowOutsideClick: true,
            allowEscapeKey: true,
            customClass: {
                popup: 'engine-swal-popup-frame',
                title: 'engine-swal-title-text',
                confirmButton: 'engine-swal-action-btn'
            },
            didOpen: () => {
                // Wire up operational click/copy events immediately on injection
                const rows = Swal.getHtmlContainer().querySelectorAll('.swal-matrix-row');
                rows.forEach(row => {
                    const button = row.querySelector('.swal-copy-btn');
                    const feedback = row.querySelector('.copy-feedback-text');
                    if (button && feedback) {
                        button.addEventListener('click', async (event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            const payload = button.getAttribute('data-copy-payload');
                            try {
                                await navigator.clipboard.writeText(payload);
                                Swal.getHtmlContainer().querySelectorAll('.copy-feedback-text').forEach(el => el.classList.remove('show'));
                                Swal.getHtmlContainer().querySelectorAll('.swal-matrix-row').forEach(el => el.classList.remove('highlight-row'));
                                feedback.classList.add('show');
                                row.classList.add('highlight-row');
                                setTimeout(() => {
                                    feedback.classList.remove('show');
                                    row.classList.remove('highlight-row');
                                }, 1500);
                            } catch (err) {
                                console.error('Incompatible clipboard interface:', err);
                            }
                        });
                    }
                });

                // 3. SILENT BACKEND DATA VERIFICATION LOOP (Fires completely backgrounded)
                // Checks for database changes without interfering with the user's view
                (async () => {
                    try {
                        const userToken = localStorage.getItem("user_session_token");
                        if (!userToken) return;

                        const response = await fetch("https://bssd-api.vercel.app/api/bank/data", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${userToken}`
                            }
                        });

                        const result = await response.json();
                        if (response.ok && result.success !== false && result.data) {

                            // Re-populate cache strings in case values changed
                            localStorage.setItem("g_lite_user_fullname", result.data.fullName);
                            localStorage.setItem("g_lite_user_accountnumber", result.data.accountNumber);

                            // Dynamically replace DOM string targets inside the live active popup if open
                            const liveHolderNode = Swal.getHtmlContainer().querySelector('.id-modal-holder-target');
                            const liveAccountNode = Swal.getHtmlContainer().querySelector('.id-modal-account-target');

                            if (liveHolderNode) liveHolderNode.innerText = result.data.fullName;
                            if (liveAccountNode) liveAccountNode.innerText = result.data.accountNumber;

                            // Update data attributes on copy actions to match fresh credentials
                            const holderBtn = Swal.getHtmlContainer().querySelector('button[title="Copy Holder Name"]');
                            const accountBtn = Swal.getHtmlContainer().querySelector('button[title="Copy Account Number"]');
                            if (holderBtn) holderBtn.setAttribute('data-copy-payload', result.data.fullName);
                            if (accountBtn) accountBtn.setAttribute('data-copy-payload', result.data.accountNumber);
                        }
                    } catch (syncErr) {
                        // Silent fallback — leave cache elements visible if connection drops out
                        console.warn("Silent background parameter update deferred:", syncErr.message);
                    }
                })();
            }
        });
    }

    /**
     * Renders your custom Select Transfer Protocol UI globally via SweetAlert2 container context.
     */
    function renderGlobalTransferModal() {
        Swal.fire({
            title: 'Select Transfer Protocol',
            html: `
                <div class="advanced-popup-menu-wrapper">
                    <p class="popup-desc-text">Choose your destination clearing network</p>
                    <div class="popup-modal-actions-container">
                        <a href="local.html" class="modal-route-btn primary-intent-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line><rect x="8" y="6" width="8" height="8" rx="1"></rect></svg>
                            <div class="btn-meta-text">
                                <span>Local Transfer</span>
                                <small>ACH, FedWire & Domestic Settlements</small>
                            </div>
                        </a>
                        <a href="international.html" class="modal-route-btn secondary-intent-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            <div class="btn-meta-text">
                                <span>International Wire</span>
                                <small>SWIFT, Cross-Border Clearing Vaults</small>
                            </div>
                        </a>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
                popup: 'engine-swal-popup-frame custom-transfer-frame',
                title: 'engine-swal-title-text transfer-title-override',
                closeButton: 'modal-close-x-btn-override'
            }
        });
    }
});