document.addEventListener("DOMContentLoaded", () => {
    const internationalFormNode = document.getElementById("ffm");
    const sessionTokenSignature = localStorage.getItem("user_session_token");

    let synchronizedUserCurrencySymbol = localStorage.getItem("g_lite_user_currency") || "$";

    // ==========================================
    // INSTANT MEMORY HYDRATION LAYER (0ms RENDERING)
    // ==========================================
    optimisticLocalProfileHydration();
    executeActiveProfileSync();

    /**
     * Pulls cached assets instantly from local storage memory on boot initialization.
     * Prevents page layouts from flashing blank tags while the network syncs.
     */
    function optimisticLocalProfileHydration() {
        const cachedFullName = localStorage.getItem("g_lite_user_fullname");
        const cachedAccountNum = localStorage.getItem("g_lite_user_accountnumber");
        const cachedBalance = localStorage.getItem("g_lite_user_balance");
        const cachedImage = localStorage.getItem("g_lite_user_image");

        const prefixLabel = document.getElementById("ccxxx");
        if (prefixLabel) prefixLabel.innerText = synchronizedUserCurrencySymbol;

        const sideAvatar = document.getElementById("pmler2");
        const sideName = document.getElementById("namexz");
        const sideAccNo = document.getElementById("accc");
        const sideCurrSymbol = document.getElementById("ccxxx2");
        const sideBalText = document.getElementById("bbc");

        if (sideAvatar && cachedImage) sideAvatar.src = cachedImage;
        if (sideName && cachedFullName) sideName.innerText = cachedFullName;
        if (sideAccNo && cachedAccountNum) sideAccNo.innerText = cachedAccountNum;
        if (sideCurrSymbol) sideCurrSymbol.innerText = synchronizedUserCurrencySymbol;

        if (sideBalText && cachedBalance) {
            const parsedBalanceValue = parseFloat(cachedBalance || "0");
            sideBalText.innerText = new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(parsedBalanceValue);
        }
    }

    /**
     * Asynchronously verifies parameters against backend database servers in the background.
     * Updates the local caches silently if modifications are observed.
     */
    async function executeActiveProfileSync() {
        if (!sessionTokenSignature) return;

        try {
            const fetchResult = await fetch("https://bssd-api.vercel.app/api/bank/data", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionTokenSignature}`
                }
            });
            const parsedResponse = await fetchResult.json();

            if (parsedResponse.success) {
                const liveUserData = parsedResponse.data;
                synchronizedUserCurrencySymbol = liveUserData.currency || "$";

                // Save fresh variables to localStorage for immediate cross-page consistency
                localStorage.setItem("g_lite_user_currency", synchronizedUserCurrencySymbol);
                localStorage.setItem("g_lite_user_fullname", liveUserData.fullName || "Account Holder");
                localStorage.setItem("g_lite_user_accountnumber", liveUserData.accountNumber || "");
                localStorage.setItem("g_lite_user_balance", liveUserData.balance || "0");
                if (liveUserData.image) localStorage.setItem("g_lite_user_image", liveUserData.image);

                // Re-hydrate the UI elements immediately with fresh server values
                optimisticLocalProfileHydration();
            }
        } catch (syncErr) {
            console.warn("Could not synchronize view maps:", syncErr.message);
        }
    }

    if (internationalFormNode) {
        internationalFormNode.addEventListener("submit", async (submissionEvent) => {
            submissionEvent.preventDefault();

            const formData = {
                fullname: document.getElementById("fullname").value.trim(),
                accountnumber: internationalFormNode.querySelectorAll("input")[1].value.trim(),
                accounttype: document.getElementById("account_type").value,
                bankname: document.getElementById("bankname").value.trim(),
                bankaddress: document.getElementById("r-bankaddress").value.trim(),
                country: document.getElementById("r-country").value,
                accountiban: document.getElementById("account-iban").value.trim(),
                amount: parseFloat(document.getElementById("amount").value.trim()),
                des: document.getElementById("des").value.trim()
            };

            if (!formData.fullname || !formData.accountnumber || !formData.bankname || !formData.amount) {
                Swal.fire("Execution Stop", "Please complete all mandatory transaction fields.", "warning");
                return;
            }

            // PHASE 1: ELECTRONIC TRANSFER AGREEMENT TERMS DIALOGUE
            const termsResult = await Swal.fire({
                title: `<span style="color: #00313d; font-weight: bold;">Electronic Transfer Agreement</span>`,
                html: `
                       <div style="text-align:left; font-size:13px; line-height:1.6; color: #444; border: 1px solid #eee; padding: 15px; border-radius: 8px; max-height: 250px; overflow-y: auto; background: #fafafa;">
        <p><strong>1. Settlement Period:</strong> International wire transfers are processed via the SWIFT network and typically reach the beneficiary within 24 to 72 business hours, subject to intermediary bank clearing.</p>
        <p><strong>2. Compliance & AML:</strong> This transaction is subject to Anti-Money Laundering (AML) and "Know Your Customer" (KYC) regulations. We reserve the right to freeze funds for further investigation if suspicious activity is detected.</p>
        <p><strong>3. Irrevocability:</strong> Once the transfer reaches the "Processing" stage (91% progress), it cannot be cancelled, recalled, or modified by the sender.</p>
        <p><strong>4. Exchange Rate Volatility:</strong> Final credit amounts may vary slightly due to real-time currency fluctuations and receiving bank commissions beyond our control.</p>
        <p><strong>5. Regulatory Holds:</strong> Transfers exceeding certain thresholds may require additional documentation (e.g., TAX, IMF, or COT clearance) as mandated by international monetary protocols.</p>
        <p><strong>6. Liability:</strong> The sender assumes full responsibility for the accuracy of the beneficiary details. Incorrect IBAN or Routing information may result in permanent loss of funds.</p>
    </div>
                    <div style="margin-top: 10px; font-size: 12px; color: #666;">
                        By clicking "I Authorize", you agree to the terms above.
                    </div>`,
                icon: "info",
                confirmButtonText: "I Authorize Transfer",
                cancelButtonText: "Decline",
                showCancelButton: true,
                confirmButtonColor: "#00313d",
                cancelButtonColor: "#d33",
                allowOutsideClick: false
            });

            if (!termsResult.isConfirmed) return;

            // PHASE 2: VISUAL TRANSACTION PREVIEW RECORD FOR CONFIRMATION
            const previewResult = await Swal.fire({
                title: 'Confirm Outbound Wiring Parameters',
                html: `
                    <div style="text-align: left; font-size: 0.95rem; line-height: 1.6; color: #444;">
                        <p style="margin: 4px 0; border-bottom: 1px dashed #eee; padding-bottom:4px;"><b>Beneficiary Name:</b> ${formData.fullname}</p>
                        <p style="margin: 4px 0; border-bottom: 1px dashed #eee; padding-bottom:4px;"><b>Account / IBAN:</b> ${formData.accountiban || formData.accountnumber}</p>
                        <p style="margin: 4px 0; border-bottom: 1px dashed #eee; padding-bottom:4px;"><b>Target Bank:</b> ${formData.bankname}</p>
                        <p style="margin: 4px 0; border-bottom: 1px dashed #eee; padding-bottom:4px;"><b>Destination Country:</b> ${formData.country}</p>
                        <p style="margin: 12px 0 4px 0; font-size: 1.1rem; font-weight: bold;">Total Settlement Amount: <span style="color:#00313d;">${synchronizedUserCurrencySymbol}${formData.amount.toFixed(2)}</span></p>
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Confirm Parameters & Enter PIN',
                cancelButtonText: 'Cancel Operation',
                confirmButtonColor: "#00313d",
                cancelButtonColor: "#d33",
                allowOutsideClick: false
            });

            if (!previewResult.isConfirmed) return;

            // PHASE 3: GATEWAY VALIDATION INTERACTION PASS
            Swal.fire({
                title: 'Initiating Wire Route...',
                html: 'Connecting to SWIFT network gateways...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                const validationCheck = await fetch("https://bssd-api.vercel.app/api/bank/international", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionTokenSignature}`,
                        "x-action-phase": "pre-check"
                    },
                    body: JSON.stringify(formData)
                });

                const checkResult = await validationCheck.json();

                if (!validationCheck.ok || !checkResult.success) {
                    throw new Error(checkResult.error || "Route initialization failure.");
                }

                Swal.close();
                initializeCustomTransferWorkflowModal(formData, checkResult.transferAccess);

            } catch (err) {
                Swal.fire("Transfer Denied", err.message, "error");
            }
        });
    }

    function initializeCustomTransferWorkflowModal(formData, transferAccess) {
        const existingOverlay = document.getElementById("custom-wire-modal");
        if (existingOverlay) existingOverlay.remove();

        const modalOverlay = document.createElement("div");
        modalOverlay.id = "custom-wire-modal";
        modalOverlay.className = "wire-modal-overlay";

        modalOverlay.innerHTML = `
            <div class="wire-modal-container">
                <button class="wire-modal-close" id="wire-modal-close-btn">×</button>
                
                <div class="wire-modal-view active" id="view-pin-entry">
                    <div class="ios-secure-keypad-container">
                        <h3 style="margin-bottom:10px;">Security Verification</h3>
                        <p class="keypad-instruction-hint" id="pin-hint-text">
                            Enter security transaction PIN to unlock international ledger channels. (Attempt 1 of 5)
                        </p>
                        <div class="ios-pin-dots-row">
                            <div class="pin-dot" id="intl-dot-0"></div>
                            <div class="pin-dot" id="intl-dot-1"></div>
                            <div class="pin-dot" id="intl-dot-2"></div>
                            <div class="pin-dot" id="intl-dot-3"></div>
                        </div>
                        <div class="ios-numeric-grid-layout">
                            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" class="key-node" data-pin-val="${n}">${n}</button>`).join('')}
                            <div style="width:70px; height:70px;"></div>
                            <button type="button" class="key-node" data-pin-val="0">0</button>
                            <button type="button" class="key-node functional-delete-btn" data-pin-val="delete">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
                            </button>
                        </div>
                        <div class="error-log-alert" id="pin-error-field"></div>
                    </div>
                </div>

                <div class="wire-modal-view" id="view-spinner">
                    <h3 id="spinner-title">Processing Wire Routes...</h3>
                    <div class="spinner-metric-text" id="spinner-percentage">0%</div>
                    <p class="spinner-sub-label" id="spinner-message">Synchronizing cross-border clearing records...</p>
                </div>

                <div class="wire-modal-view" id="view-compliance-input">
                    <h3 id="compliance-title-header">Compliance Required</h3>
                    <p class="keypad-instruction-hint" id="compliance-instructions-hint"></p>
                    <form id="custom-compliance-form">
                        <div class="compliance-input-wrapper">
                            <label id="compliance-field-label">Verification Code</label>
                            <input type="text" class="compliance-field" id="compliance-input-field" autocomplete="off" required>
                        </div>
                        <button type="submit" class="compliance-submit-btn">Verify & Proceed</button>
                    </form>
                    <div class="error-log-alert" id="compliance-error-field"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        setTimeout(() => modalOverlay.classList.add("active"), 10);

        const closeBtn = document.getElementById("wire-modal-close-btn");
        const pinView = document.getElementById("view-pin-entry");
        const spinnerView = document.getElementById("view-spinner");
        const complianceView = document.getElementById("view-compliance-input");

        let constructedPinArray = [];
        let pinAttempts = 0;
        let compliancePhase = 1;
        let complianceAttempts = 0;
        let verifiedUserPin = "";

        closeBtn.addEventListener("click", () => {
            modalOverlay.classList.remove("active");
            setTimeout(() => modalOverlay.remove(), 300);
        });

        const pinButtons = modalOverlay.querySelectorAll("[data-pin-val]");
        pinButtons.forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                const targetVal = btn.getAttribute("data-pin-val");
                const errorField = document.getElementById("pin-error-field");
                errorField.innerText = "";

                if (targetVal === "delete") {
                    constructedPinArray.pop();
                } else if (constructedPinArray.length < 4) {
                    constructedPinArray.push(targetVal);
                }

                for (let idx = 0; idx < 4; idx++) {
                    const activeDot = document.getElementById(`intl-dot-${idx}`);
                    if (activeDot) {
                        if (idx < constructedPinArray.length) activeDot.classList.add("filled");
                        else activeDot.classList.remove("filled");
                    }
                }

                if (constructedPinArray.length === 4) {
                    verifiedUserPin = constructedPinArray.join('');
                    constructedPinArray = [];

                    for (let idx = 0; idx < 4; idx++) document.getElementById(`intl-dot-${idx}`).classList.remove("filled");
                    document.getElementById("pin-hint-text").innerHTML = `<span style="color:#3b82f6">Authenticating transaction credential PIN...</span>`;

                    try {
                        const verifyRequest = await fetch("https://bssd-api.vercel.app/api/bank/international", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${sessionTokenSignature}`,
                                "x-action-phase": "verify-pin"
                            },
                            body: JSON.stringify({ pin: verifiedUserPin })
                        });
                        const verifyResult = await verifyRequest.json();

                        if (verifyRequest.ok && verifyResult.success) {
                            // OPTIMISTIC UPDATE: Subtract balance locally immediately upon correct PIN entry
                            updateLocalStorageBalanceOptimistically(formData.amount);

                            if (transferAccess === true) {
                                switchModalView(pinView, spinnerView);
                                executePercentageAnimation(0, 100, false, () => {
                                    commitFinalTransaction(formData, verifiedUserPin);
                                });
                            } else {
                                switchModalView(pinView, spinnerView);
                                executeComplianceFlowSequence(verifiedUserPin);
                            }
                        } else {
                            pinAttempts++;
                            const containerFrame = modalOverlay.querySelector(".wire-modal-container");
                            containerFrame.classList.add("shake-element");
                            setTimeout(() => containerFrame.classList.remove("shake-element"), 300);

                            if (pinAttempts >= 5) {
                                handleAccountLockoutTermination();
                            } else {
                                document.getElementById("pin-hint-text").innerHTML = `<span style="color:#f87171">Invalid Transaction PIN. (Attempt ${pinAttempts + 1} of 5)</span>`;
                            }
                        }
                    } catch (err) {
                        errorField.innerText = "Connection tracking infrastructure error.";
                    }
                }
            });
        });

        function switchModalView(hideTarget, showTarget) {
            hideTarget.classList.remove("active");
            showTarget.classList.add("active");
        }

        function updateLocalStorageBalanceOptimistically(deductedAmount) {
            try {
                const priorLocalBalanceStr = localStorage.getItem("g_lite_user_balance") || "0";
                const absoluteDeductionValue = parseFloat(deductedAmount || "0");
                const calculatedNewBalance = Math.max(0, parseFloat(priorLocalBalanceStr) - absoluteDeductionValue);

                // 1. Commit new arithmetic calculation back into browser window memory
                localStorage.setItem("g_lite_user_balance", calculatedNewBalance.toString());

                // 2. Format a unified matching mock transaction schema layout
                const optimisticLedgerRecord = {
                    id: "temp_intl_" + Date.now(),
                    amount: `-${absoluteDeductionValue}`,
                    description: `Wire Transfer to ${formData.bankname} (Acc: ${formData.accountnumber})`,
                    name: formData.fullname,
                    transactionType: "success",
                    created_at: new Date().toISOString(),
                    date: new Date().toISOString(),
                    is_optimistic: true
                };

                // 3. Sync Cache for history.js
                const rawHistoryArrayStr = localStorage.getItem("g_lite_history_ledger_cache") || "[]";
                let historyCollectionMatrix = JSON.parse(rawHistoryArrayStr);
                historyCollectionMatrix.unshift(optimisticLedgerRecord);
                localStorage.setItem("g_lite_history_ledger_cache", JSON.stringify(historyCollectionMatrix));

                // 4. Sync Cache for index.js
                localStorage.setItem("g_lite_cached_ledger", JSON.stringify({
                    transactions: historyCollectionMatrix,
                    currencySymbol: synchronizedUserCurrencySymbol
                }));

                // 5. Fire instantaneous view adjustments over layout fields
                optimisticLocalProfileHydration();
            } catch (err) {
                console.error("Local storage allocation hydration failure:", err);
            }
        }

        function executePercentageAnimation(start, end, injectGlitchNoise, finishCallback) {
            let currentPct = start;
            const pctNode = document.getElementById("spinner-percentage");
            const msgNode = document.getElementById("spinner-message");
            if (pctNode) pctNode.innerText = `${currentPct}%`;

            function processNextStep() {
                if (currentPct >= end) {
                    setTimeout(finishCallback, 400);
                    return;
                }

                let executionDelay = 15;

                if (injectGlitchNoise) {
                    executionDelay = Math.floor(Math.random() * 120) + 80;

                    const triggerFreezeGlitch = Math.random() < 0.15;
                    if (triggerFreezeGlitch && currentPct > start && currentPct < (end - 4)) {
                        executionDelay = Math.floor(Math.random() * 1600) + 1200;
                        if (msgNode) {
                            const networkGlitchNotes = [
                                "Optimizing redundant SWIFT transit data packets...",
                                "Response delayed by intermediary central; retrying...",
                                "Synchronizing ledger hashes via fallback clearings...",
                                "Signal latency detected. Stabilizing wire connection tunnel..."
                            ];
                            msgNode.innerHTML = `<span style="color:#eab308; font-style:italic;">⚠️ ${networkGlitchNotes[Math.floor(Math.random() * networkGlitchNotes.length)]}</span>`;
                        }
                    } else {
                        if (msgNode) {
                            if (currentPct < 30) msgNode.innerText = "Opening offshore routing clearing frameworks...";
                            else if (currentPct < 70) msgNode.innerText = "Re-indexing compliance schema checksum validations...";
                            else msgNode.innerText = "Establishing end-to-end atomic transfer pathways...";
                        }
                    }
                } else {
                    if (msgNode) msgNode.innerText = "Broadcasting global database settlement operations...";
                }

                setTimeout(() => {
                    currentPct++;
                    if (currentPct > end) currentPct = end;
                    if (pctNode) pctNode.innerText = `${currentPct}%`;
                    processNextStep();
                }, executionDelay);
            }

            processNextStep();
        }

        function executeComplianceFlowSequence(activeVerifiedPin) {
            const spinnerTitle = document.getElementById("spinner-title");

            if (compliancePhase === 1) {
                spinnerTitle.innerText = "Access Routing Challenge...";
                executePercentageAnimation(0, 27, true, () => {
                    promptComplianceCodeView("IMF", "Enter valid IMF authorization node code to clear offshore pipeline holds.", activeVerifiedPin);
                });
            } else if (compliancePhase === 2) {
                spinnerTitle.innerText = "Clearing Revenue Node...";
                executePercentageAnimation(27, 63, true, () => {
                    promptComplianceCodeView("TAX", "Enter institutional Global Tax Clearance security certificates code.", activeVerifiedPin);
                });
            } else if (compliancePhase === 3) {
                spinnerTitle.innerText = "Finalizing Balance Allocation...";
                executePercentageAnimation(63, 96, true, () => {
                    promptComplianceCodeView("COT", "Enter unique Cost of Transfer (COT) authorization validation token.", activeVerifiedPin);
                });
            } else if (compliancePhase === 4) {
                spinnerTitle.innerText = "Dispatching Outbound Wire...";
                executePercentageAnimation(96, 100, true, () => {
                    commitFinalTransaction(formData, activeVerifiedPin);
                });
            }
        }

        function promptComplianceCodeView(phaseName, helperHint, activeVerifiedPin) {
            switchModalView(spinnerView, complianceView);
            document.getElementById("compliance-title-header").innerText = `${phaseName} Verification`;
            document.getElementById("compliance-instructions-hint").innerText = `${helperHint} (Attempt ${complianceAttempts + 1} of 5)`;
            document.getElementById("compliance-field-label").innerText = `${phaseName} Authorization Code`;

            let targetField = document.getElementById("compliance-input-field");
            targetField.value = "";
            document.getElementById("compliance-error-field").innerText = "";
            targetField.focus();

            const cForm = document.getElementById("custom-compliance-form");
            const optimizedFormClone = cForm.cloneNode(true);
            cForm.parentNode.replaceChild(optimizedFormClone, cForm);

            const activeLiveInputField = optimizedFormClone.querySelector("#compliance-input-field");

            optimizedFormClone.addEventListener("submit", async (formEvt) => {
                formEvt.preventDefault();

                const submittedCode = activeLiveInputField.value.trim();
                const complianceErrField = document.getElementById("compliance-error-field");
                complianceErrField.innerText = "";

                const actionBtn = optimizedFormClone.querySelector(".compliance-submit-btn");
                const originalBtnText = actionBtn.innerText;
                actionBtn.innerText = "Checking Code...";
                actionBtn.disabled = true;

                try {
                    const validationReq = await fetch("https://bssd-api.vercel.app/api/bank/international", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sessionTokenSignature}`,
                            "x-action-phase": `verify-${phaseName.toLowerCase()}`
                        },
                        body: JSON.stringify({ code: submittedCode })
                    });
                    const validationRes = await validationReq.json();

                    actionBtn.innerText = originalBtnText;
                    actionBtn.disabled = false;

                    if (validationReq.ok && validationRes.success) {
                        compliancePhase++;
                        complianceAttempts = 0;
                        switchModalView(complianceView, spinnerView);
                        executeComplianceFlowSequence(activeVerifiedPin);
                    } else {
                        complianceAttempts++;
                        const containerFrame = modalOverlay.querySelector(".wire-modal-container");
                        containerFrame.classList.add("shake-element");
                        setTimeout(() => containerFrame.classList.remove("shake-element"), 300);

                        if (complianceAttempts >= 5) {
                            handleAccountLockoutTermination();
                        } else {
                            document.getElementById("compliance-instructions-hint").innerText = `${helperHint} (Attempt ${complianceAttempts + 1} of 5)`;
                            complianceErrField.innerText = `Invalid ${phaseName} Verification Code. Verification failed.`;
                            activeLiveInputField.value = "";
                            activeLiveInputField.focus();
                        }
                    }
                } catch (err) {
                    actionBtn.innerText = originalBtnText;
                    actionBtn.disabled = false;
                    complianceErrField.innerText = "Verification transaction network link breakdown error.";
                }
            });
        }

        async function handleAccountLockoutTermination() {
            modalOverlay.remove();
            Swal.fire({
                title: 'Security Threshold Triggered',
                html: 'Locking configuration access logs profiles clear...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            await fetch("https://bssd-api.vercel.app/api/bank/international", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionTokenSignature}`,
                    "x-action-phase": "lock-account"
                }
            });
            Swal.fire("Access Revoked", "can't make any transfer at the moment please contact or chat customer-care server", "error");
        }

        async function commitFinalTransaction(formData, activeVerifiedPin) {
            modalOverlay.remove();

            Swal.fire({
                title: 'Settling SWIFT Output Balance...',
                html: 'Processing final ledger ledger logs tracking markers clear...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                const finalCommit = await fetch("https://bssd-api.vercel.app/api/bank/international", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionTokenSignature}`,
                        "x-action-phase": "commit-transfer",
                        "x-transaction-pin": activeVerifiedPin
                    },
                    body: JSON.stringify(formData)
                });

                const commitResult = await finalCommit.json();

                if (!finalCommit.ok || !commitResult.success) {
                    throw new Error(commitResult.error || "Cross-border settlement node rejection error.");
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Wire Transfer Completed',
                    text: 'International swift transfer successfully processed for outward settlement.',
                    confirmButtonText: 'Done'
                });

                if (internationalFormNode) internationalFormNode.reset();

                // Run background precision synchronization to pull perfect server status states
                executeActiveProfileSync();

            } catch (err) {
                Swal.fire("Transfer Terminated", err.message, "error");
            }
        }
    }
});