document.addEventListener("DOMContentLoaded", () => {
    const localTransferFormNode = document.getElementById("local-transfer-form");
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

        const prefixLabel = document.querySelector(".currency-prefix");
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
            const fetchResult = await fetch("https://bssd-api.onrender.com/api/bank/data", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionTokenSignature}`
                }
            });
            const parsedResponse = await fetchResult.json();

            if (parsedResponse.success) {
                const liveUserData = parsedResponse.data;

                // Write fresh variables back into local memory strings
                synchronizedUserCurrencySymbol = liveUserData.currency || "$";
                localStorage.setItem("g_lite_user_currency", synchronizedUserCurrencySymbol);
                localStorage.setItem("g_lite_user_fullname", liveUserData.fullName || "Account Holder");
                localStorage.setItem("g_lite_user_accountnumber", liveUserData.accountNumber || "");
                localStorage.setItem("g_lite_user_balance", liveUserData.balance || "0");
                if (liveUserData.image) localStorage.setItem("g_lite_user_image", liveUserData.image);

                // Run an immediate update pass over the view nodes to inject live modifications
                optimisticLocalProfileHydration();
            }
        } catch (syncErr) {
            console.warn("Could not synchronize local view configurations:", syncErr.message);
        }
    }

    // ==========================================
    // TRANSACTION INTERCEPTORS & FORM DISPATCH CONTROL
    // ==========================================

    if (localTransferFormNode) {
        localTransferFormNode.addEventListener("submit", async (submissionEvent) => {
            submissionEvent.preventDefault();

            const recipientAccount = localTransferFormNode.querySelectorAll("input")[0].value.trim();
            const transferAmount = localTransferFormNode.querySelectorAll("input")[1].value.trim();
            const paymentMemoString = localTransferFormNode.querySelectorAll("input")[2].value.trim();

            if (!recipientAccount || !transferAmount) {
                Swal.fire("Execution Stop", "Please complete all mandatory transaction fields.", "warning");
                return;
            }

            Swal.fire({
                title: 'Validating User...',
                html: 'Checking ledger routing coordinates across internal networks...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                const verificationHandshake = await fetch("https://bssd-api.onrender.com/api/bank/local", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionTokenSignature}`,
                        "X-Action-Phase": "validate"
                    },
                    body: JSON.stringify({
                        recipientAccountNumber: recipientAccount,
                        transactionAmount: transferAmount,
                        paymentMemo: paymentMemoString
                    })
                });

                const verificationResult = await verificationHandshake.json();

                if (!verificationHandshake.ok || !verificationResult.success) {
                    throw new Error(verificationResult.error || "Internal mapping verification failure.");
                }

                // Unlocked users pass back in instantly if clearance parameters match
                localStorage.setItem("pin_retry_attempts", "0");

                Swal.fire({
                    title: 'Confirm Transfer Operation',
                    html: `
                        <div class="swal-confirmation-modal-layout">
                            <p>Are you sure you want to send money to:</p>
                            <h4 class="target-recipient-name-highlight" style="margin:12px 0; color:#3b82f6; font-size:1.3rem;">${verificationResult.recipientName}</h4>
                            <p style="font-size:1.1rem; font-weight:600;">Amount: <span style="color:#10b981;">${synchronizedUserCurrencySymbol}${parseFloat(transferAmount).toFixed(2)}</span></p>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Continue',
                    cancelButtonText: 'Cancel',
                    buttonsStyling: false,
                    customClass: {
                        popup: 'engine-swal-popup-frame',
                        title: 'engine-swal-title-text',
                        confirmButton: 'engine-swal-action-btn primary-confirm-btn',
                        cancelButton: 'engine-swal-action-btn secondary-cancel-btn'
                    }
                }).then((resolutionResult) => {
                    if (resolutionResult.isConfirmed) {
                        launchSecurePinKeyboardModal(recipientAccount, transferAmount, paymentMemoString, verificationResult.recipientName);
                    }
                });

            } catch (runtimeError) {
                Swal.fire("Transfer Denied", runtimeError.message, "error");
            }
        });
    }

    function launchSecurePinKeyboardModal(account, amount, memo, verifiedRecipientName) {
        let constructedPinArray = [];

        if (!localStorage.getItem("pin_retry_attempts")) {
            localStorage.setItem("pin_retry_attempts", "0");
        }

        const renderKeypadContent = () => `
            <div class="ios-secure-keypad-container">
                <p class="keypad-instruction-hint" style="color: #666">
                    Authorization required to authenticate capital transfer execution logs
                </p>
                
                <div class="ios-pin-dots-row">
                    <div class="pin-dot" id="dot-0"></div>
                    <div class="pin-dot" id="dot-1"></div>
                    <div class="pin-dot" id="dot-2"></div>
                    <div class="pin-dot" id="dot-3"></div>
                </div>

                <div class="ios-numeric-grid-layout">
                    <button type="button" class="key-node" data-value="1">1</button>
                    <button type="button" class="key-node" data-value="2">2</button>
                    <button type="button" class="key-node" data-value="3">3</button>
                    <button type="button" class="key-node" data-value="4">4</button>
                    <button type="button" class="key-node" data-value="5">5</button>
                    <button type="button" class="key-node" data-value="6">6</button>
                    <button type="button" class="key-node" data-value="7">7</button>
                    <button type="button" class="key-node" data-value="8">8</button>
                    <button type="button" class="key-node" data-value="9">9</button>
                    <div class="key-node-empty"></div>
                    <button type="button" class="key-node" data-value="0">0</button>
                    <button type="button" class="key-node functional-delete-btn" data-value="delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
                    </button>
                </div>
            </div>
        `;

        const attachKeypadClickListeners = (htmlContainer) => {
            const structuralKeypadFrame = htmlContainer.querySelector('.ios-numeric-grid-layout');
            structuralKeypadFrame.querySelectorAll('.key-node').forEach(buttonNode => {
                buttonNode.addEventListener('click', async (clickContextEvent) => {
                    clickContextEvent.preventDefault();

                    let currentFailures = parseInt(localStorage.getItem("pin_retry_attempts") || "0");
                    if (currentFailures >= 5) {
                        Swal.fire("Account Locked", "can't make any transfer at the moment please contact or chat customer-care server", "error");
                        return;
                    }

                    const keyActionValue = buttonNode.getAttribute('data-value');
                    if (!keyActionValue) return;

                    if (keyActionValue === 'delete') {
                        constructedPinArray.pop();
                    } else if (constructedPinArray.length < 4) {
                        constructedPinArray.push(keyActionValue);
                    }

                    for (let indexOffset = 0; indexOffset < 4; indexOffset++) {
                        const activeDotTarget = document.getElementById(`dot-${indexOffset}`);
                        if (activeDotTarget) {
                            if (indexOffset < constructedPinArray.length) {
                                activeDotTarget.classList.add('filled');
                            } else {
                                activeDotTarget.classList.remove('filled');
                            }
                        }
                    }

                    if (constructedPinArray.length === 4) {
                        const completedPinString = constructedPinArray.join('');
                        constructedPinArray = [];

                        const instructions = htmlContainer.querySelector('.keypad-instruction-hint');
                        instructions.innerHTML = `<span style="color:#3b82f6">Verifying signature codes...</span>`;

                        // PIN IS PASSED DIRECTLY TO THE SERVER FOR DB VALIDATION PREVENTING CLIENT TIMING ERRORS
                        try {
                            const commitRequest = await fetch("https://bssd-api.onrender.com/api/bank/local", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${sessionTokenSignature}`,
                                    "X-Action-Phase": "commit",
                                    "X-Transaction-Pin": completedPinString
                                },
                                body: JSON.stringify({
                                    recipientAccountNumber: account,
                                    transactionAmount: amount,
                                    paymentMemo: memo
                                })
                            });

                            const commitResult = await commitRequest.json();

                            if (!commitRequest.ok || !commitResult.success) {
                                throw new Error(commitResult.error || "Transaction route rejection error.");
                            }

                            // Reset security pin failure counter
                            localStorage.setItem("pin_retry_attempts", "0");

                            // =========================================================
                            // SPLIT MECHANISM: OPTIMISTIC LOCAL BALANCE MATH CALCULATOR
                            // =========================================================
                            const priorLocalBalanceStr = localStorage.getItem("g_lite_user_balance") || "0";
                            const deductedValue = parseFloat(amount || "0");
                            const structuralNewBalance = Math.max(0, parseFloat(priorLocalBalanceStr) - deductedValue);

                            // Save calculation instantly to drive 0ms rendering latency
                            localStorage.setItem("g_lite_user_balance", structuralNewBalance.toString());

                            // =========================================================
                            // UNIFIED OPTIMISTIC HISTORY STORAGE LAYER (index.js & history.js)
                            // =========================================================
                            try {
                                // 1. Build a mock transaction schema matching your core table layouts
                                const optimisticLedgerRecord = {
                                    id: "temp_" + Date.now(),
                                    amount: `-${deductedValue}`,
                                    description: `Transfer to Acc: ${account}${memo ? ' - ' + memo : ''}`,
                                    name: verifiedRecipientName || "Internal Destination",
                                    transactionType: "success",
                                    created_at: new Date().toISOString(),
                                    date: new Date().toISOString(),
                                    is_optimistic: true
                                };

                                // 2. Update Cache for history.js
                                const rawHistoryArrayStr = localStorage.getItem("g_lite_history_ledger_cache") || "[]";
                                let historyCollectionMatrix = JSON.parse(rawHistoryArrayStr);
                                historyCollectionMatrix.unshift(optimisticLedgerRecord);
                                localStorage.setItem("g_lite_history_ledger_cache", JSON.stringify(historyCollectionMatrix));

                                // 3. Update Cache for index.js (Syncing the g_lite_cached_ledger format)
                                localStorage.setItem("g_lite_cached_ledger", JSON.stringify({
                                    transactions: historyCollectionMatrix,
                                    currencySymbol: synchronizedUserCurrencySymbol
                                }));
                            } catch (historyInjectErr) {
                                console.error("Failed handling synchronized history updates:", historyInjectErr);
                            }

                            // Run an immediate view rewrite pass over local balance layout panels
                            optimisticLocalProfileHydration();

                            // =========================================================
                            // DEBIT DE-SPAMMING NOTIFICATION TEMPLATE
                            // =========================================================
                            Swal.fire({
                                icon: 'success',
                                title: 'Account Debited Successfully',
                                html: `
                                    <div style="text-align: left; font-size: 0.95rem; line-height: 1.6; color: #cbd5e1;">
                                        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 12px; color:#ef4444; font-weight:700; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Transaction Type: Debit Alert
                                        </div>
                                        <p style="margin: 6px 0;"><b>Description:</b> Outgoing Electronic Transfer</p>
                                        <p style="margin: 6px 0;"><b>Beneficiary:</b> ${verifiedRecipientName || "Internal Destination"}</p>
                                        <p style="margin: 6px 0;"><b>Account Number:</b> ****${account.slice(-4)}</p>
                                        <p style="margin: 6px 0;"><b>Reference ID:</b> TXN-${Date.now().toString().slice(-6)}</p>
                                        
                                        <div style="margin-top: 16px; padding: 10px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 4px;">
                                            <span style="font-weight:600; color:#ef4444;">Amount Debited: </span>
                                            <span style="font-weight:700; color:#ef4444; font-size: 1.1rem;">-${synchronizedUserCurrencySymbol}${parseFloat(amount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                `,
                                confirmButtonText: 'Acknowledge',
                                buttonsStyling: false,
                                customClass: {
                                    popup: 'engine-swal-popup-frame',
                                    confirmButton: 'engine-swal-action-btn primary-confirm-btn'
                                }
                            });

                            if (localTransferFormNode) localTransferFormNode.reset();

                            // Silent background handshake to get formal database precision logs
                            executeActiveProfileSync();

                        } catch (err) {
                            if (err.message.includes("contact or chat customer-care")) {
                                Swal.fire("Transfer Blocked", err.message, "error");
                                return;
                            }

                            currentFailures++;
                            localStorage.setItem("pin_retry_attempts", currentFailures.toString());

                            for (let idx = 0; idx < 4; idx++) {
                                document.getElementById(`dot-${idx}`).classList.remove('filled');
                            }

                            if (currentFailures >= 5) {
                                instructions.innerHTML = `<span style="color:#dc2626">Locking security clearance modules...</span>`;
                                try {
                                    await fetch("https://bssd-api.onrender.com/api/bank/local", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": `Bearer ${sessionTokenSignature}`,
                                            "X-Action-Phase": "lock-account"
                                        },
                                        body: JSON.stringify({})
                                    });
                                } catch (lockErr) {
                                    console.error("Lock error: ", lockErr.message);
                                }

                                Swal.fire("Access Revoked", "can't make any transfer at the moment please contact or chat customer-care server", "error");
                            } else {
                                instructions.innerHTML = `<span style="color:#dc2626">Invalid PIN. Attempt ${currentFailures} of 5. Try again.</span>`;
                            }
                        }
                    }
                });
            });
        };

        let initialFailures = parseInt(localStorage.getItem("pin_retry_attempts") || "0");
        if (initialFailures >= 5) {
            Swal.fire("Account Locked", "can't make any transfer at the moment please contact or chat customer-care server", "error");
            return;
        }

        Swal.fire({
            title: 'Enter Security PIN',
            html: renderKeypadContent(),
            showConfirmButton: false,
            showCloseButton: true,
            allowOutsideClick: false,
            customClass: {
                popup: 'engine-swal-popup-frame ios-keypad-popup-override',
                title: 'engine-swal-title-text'
            },
            didOpen: () => {
                attachKeypadClickListeners(Swal.getHtmlContainer());
            }
        });
    }
});