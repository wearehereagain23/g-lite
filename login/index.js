document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailVal = document.getElementById('email').value.trim().toLowerCase();
        const passwordVal = document.getElementById('password').value;

        if (!emailVal || !passwordVal) {
            Swal.fire("Validation Warning", "Please configure all login fields correctly.", "warning");
            return;
        }

        Swal.fire({
            title: 'Verifying Credentials...',
            html: 'Connecting with banking clearance architecture network nodes...',
            didOpen: () => Swal.showLoading(),
            allowOutsideClick: false
        });

        try {
            const response = await fetch("https://bssd-api.vercel.app/api/bank/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "login",
                    email: emailVal,
                    password: passwordVal,
                    signature: "g-lite" // Ensure this matches the exactly assigned signature value in your database!
                })
            });

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.error || "Authentication framework execution anomaly.");
            }

            // Move cleanly to the secure verification terminal layout deployment matrix
            initializeSecureOTPPadTerminal(result.user_id);

        } catch (err) {
            Swal.fire('Authentication Interruption Fault', err.message, 'error');
        }
    });

    /**
     * Spawns an Advanced Sandboxed Virtual Pin Input Engine with persistent tracking
     */
    function initializeSecureOTPPadTerminal(userId) {
        let enteredOTP = "";
        let countdownInterval = null;

        // PERSISTENCE FIX: Check if an attempt counter already exists for this login session, otherwise start at 1
        if (!sessionStorage.getItem('login_attempts_state')) {
            sessionStorage.setItem('login_attempts_state', '1');
        }

        const terminalTemplateHtml = `
    <div style="margin: 15px 0; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; width: 100%;">
        <p style="font-size: 13px; color:#64748b; margin-bottom: 20px; text-align: center; max-width: 320px;">Enter the 6-digit authorization security key code token sent to your mail profile inbox.</p>
        
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 25px; width: 100%; max-width: 320px;">
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; max-width: 280px; margin: 0 auto 20px auto; user-select:none; -webkit-user-select:none;">
            <button type="button" class="pad-key" data-val="1" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">1</button>
            <button type="button" class="pad-key" data-val="2" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">2</button>
            <button type="button" class="pad-key" data-val="3" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">3</button>
            
            <button type="button" class="pad-key" data-val="4" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">4</button>
            <button type="button" class="pad-key" data-val="5" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">5</button>
            <button type="button" class="pad-key" data-val="6" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">6</button>
            
            <button type="button" class="pad-key" data-val="7" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">7</button>
            <button type="button" class="pad-key" data-val="8" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">8</button>
            <button type="button" class="pad-key" data-val="9" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">9</button>
            
            <button type="button" class="pad-key" data-val="clear" style="padding: 16px; font-size: 14px; font-weight: 600; border: 1px solid #fecaca; background: #fef2f2; border-radius: 10px; cursor: pointer; color:#dc2626; outline:none;">CLR</button>
            <button type="button" class="pad-key" data-val="0" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">0</button>
            <button type="button" class="pad-key" data-val="delete" style="padding: 16px; font-size: 14px; font-weight: 600; border: 1px solid #cbd5e1; background: #f1f5f9; border-radius: 10px; cursor: pointer; color:#475569; outline:none;">DEL</button>
        </div>

        <div style="margin-top: 15px; text-align: center; font-size: 14px; width: 100%;">
            <span id="cooldown-text" style="color: #64748b;">Resend OTP available in: <strong id="countdown-timer" style="color: #0ea365;">20</strong>s</span>
            <button type="button" id="resend-otp-btn" style="display: none; margin: 0 auto; padding: 8px 16px; font-size: 13px; font-weight: 600; color: #fff; background: #0ea365; border: none; border-radius: 6px; cursor: pointer; transition: background 0.2s;">Resend OTP via Mail</button>
        </div>
    </div>
    `;

        Swal.fire({
            title: 'Multifactor Verification Security',
            html: terminalTemplateHtml,
            showConfirmButton: true,
            confirmButtonText: 'Verify Identity Token',
            confirmButtonColor: '#0ea365',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: (popup) => {
                const slots = Array.from(popup.querySelectorAll('.otp-slot'));
                const keys = Array.from(popup.querySelectorAll('.pad-key'));
                const countdownTimer = popup.querySelector('#countdown-timer');
                const cooldownText = popup.querySelector('#cooldown-text');
                const resendBtn = popup.querySelector('#resend-otp-btn');

                // UPDATED: Adjusted Countdown Framework to 20 seconds
                let timeLeft = 20;
                const startTimer = () => {
                    timeLeft = 20;
                    resendBtn.style.display = "none";
                    cooldownText.style.display = "inline";
                    countdownTimer.textContent = timeLeft;

                    countdownInterval = setInterval(() => {
                        timeLeft--;
                        countdownTimer.textContent = timeLeft;
                        if (timeLeft <= 0) {
                            clearInterval(countdownInterval);
                            cooldownText.style.display = "none";
                            resendBtn.style.display = "block";
                        }
                    }, 1000);
                };

                startTimer(); // Kick off the initial countdown

                // Setup Resend Handler Loop Triggering Login Event Data Stream
                resendBtn.addEventListener('click', async () => {
                    resendBtn.disabled = true;
                    resendBtn.textContent = "Sending...";

                    const emailVal = document.getElementById('email').value.trim().toLowerCase();
                    const passwordVal = document.getElementById('password').value;

                    try {
                        const response = await fetch("https://bssd-api.vercel.app/api/bank/auth", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                action: "login",
                                email: emailVal,
                                password: passwordVal,
                                signature: "g-lite"
                            })
                        });
                        const result = await response.json();
                        if (!response.ok || !result.success) throw new Error(result.error);

                        Swal.showValidationMessage("A new authorization security key code token has been sent.");
                        setTimeout(() => Swal.resetValidationMessage(), 4000);

                        resendBtn.textContent = "Resend OTP via Mail";
                        resendBtn.disabled = false;
                        startTimer(); // Loop back: restart countdown loop framework
                    } catch (err) {
                        Swal.showValidationMessage(`Resend failed: ${err.message}`);
                        resendBtn.textContent = "Resend OTP via Mail";
                        resendBtn.disabled = false;
                    }
                });

                const refreshSlotsDisplay = () => {
                    slots.forEach((slot, index) => {
                        if (enteredOTP[index]) {
                            slot.textContent = enteredOTP[index];
                            slot.style.borderColor = "#0ea365";
                            slot.style.background = "#fff";
                        } else {
                            slot.textContent = "";
                            slot.style.borderColor = "#cbd5e1";
                            slot.style.background = "#f8fafc";
                        }
                    });
                };

                keys.forEach(key => {
                    key.addEventListener('click', () => {
                        const actionValue = key.getAttribute('data-val');
                        if (actionValue === 'clear') {
                            enteredOTP = "";
                        } else if (actionValue === 'delete') {
                            enteredOTP = enteredOTP.slice(0, -1);
                        } else if (enteredOTP.length < 6) {
                            enteredOTP += actionValue;
                        }
                        refreshSlotsDisplay();
                    });
                });
            },
            willClose: () => {
                if (countdownInterval) clearInterval(countdownInterval);
            },
            preConfirm: async () => {
                if (enteredOTP.length !== 6) {
                    Swal.showValidationMessage("Please populate all 6 verification digits.");
                    return false;
                }

                let activeAttempts = parseInt(sessionStorage.getItem('login_attempts_state') || '1', 10);

                try {
                    const verificationResponse = await fetch("https://bssd-api.vercel.app/api/bank/auth", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "verify_otp",
                            user_id: userId,
                            otp: enteredOTP,
                            current_attempts: activeAttempts,
                            signature: "g-lite" // Sent down to resolve admin lookup for success tracking mailer
                        })
                    });

                    const verificationResult = await verificationResponse.json();

                    if (!verificationResponse.ok || verificationResult.success === false) {
                        activeAttempts++;
                        sessionStorage.setItem('login_attempts_state', activeAttempts.toString());

                        if (verificationResult.account_locked === true) {
                            sessionStorage.removeItem('login_attempts_state');
                            Swal.fire({
                                title: "Security Lockdown",
                                text: "Maximum verification attempts surpassed. This account has been restricted.",
                                icon: "error",
                                allowOutsideClick: false
                            });
                            return false;
                        }

                        throw new Error(verificationResult.error || "Verification authentication token error.");
                    }

                    return verificationResult;

                } catch (apiException) {
                    Swal.showValidationMessage(apiException.message);
                    return false;
                }
            }
        }).then((flowResolution) => {
            if (flowResolution.isConfirmed && flowResolution.value && flowResolution.value.success) {
                // SUCCESS CLEAN UP: Clear session storage attempts tracking state entirely
                sessionStorage.removeItem('login_attempts_state');

                const completeData = flowResolution.value;

                localStorage.setItem('user_session_token', completeData.token);
                localStorage.setItem('user_profile_cache', JSON.stringify(completeData.user));

                if (completeData.user && completeData.user.uuid) {
                    localStorage.setItem('user_uuid', completeData.user.uuid);
                }

                Swal.fire({
                    title: 'Access Granted',
                    text: 'Authorization verification sequence passed cleanly. Redirecting...',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '../dash/index.html';
                });
            }
        });
    }
});

/**
 * FORGOT PASSWORD WORKFLOW MATRIX CONTROLLER
 */
document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();

    // Step 1: Prompt for Registered Email Address
    Swal.fire({
        title: 'Account Recovery',
        text: 'Enter your registered email address to receive a security recovery token.',
        input: 'email',
        inputPlaceholder: 'Enter your email address...',
        showCancelButton: true,
        confirmButtonText: 'Send Verification Code',
        confirmButtonColor: '#0ea365',
        allowOutsideClick: false,
        showLoaderOnConfirm: true,
        preConfirm: async (emailVal) => {
            if (!emailVal) {
                Swal.showValidationMessage('Please provide a valid email address.');
                return false;
            }
            try {
                const response = await fetch("https://bssd-api.vercel.app/api/bank/auth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "forgot_password_request",
                        email: emailVal.trim().toLowerCase(),
                        signature: "g-lite"
                    })
                });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.error || "Failed to issue recovery token.");

                return { email: emailVal.trim().toLowerCase(), user_id: result.user_id };
            } catch (err) {
                Swal.showValidationMessage(err.message);
                return false;
            }
        }
    }).then((emailResult) => {
        if (emailResult.isConfirmed && emailResult.value) {
            // Step 2: Open custom Virtual PIN Pad for OTP validation
            openRecoveryOTPTerminal(emailResult.value.email, emailResult.value.user_id);
        }
    });
});

/**
 * Custom Sandboxed Virtual PIN Pad for Recovery Verification with 20s Countdown Timer
 */
function openRecoveryOTPTerminal(email, userId) {
    let enteredOTP = "";
    let countdownInterval = null;
    // UPDATED: Adjusted internal verification variable tracker to 20 seconds
    let secondsLeft = 20;

    const terminalTemplateHtml = `
    <div style="margin: 15px 0; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; width: 100%;">
        <p style="font-size: 13px; color:#64748b; margin-bottom: 20px; text-align: center; max-width: 320px;">
            Enter the 6-digit verification code token sent to <strong>${email}</strong>.
        </p>
        
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; width: 100%; max-width: 320px;">
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
            <div class="otp-slot" style="width: 42px; height: 48px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 22px; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: all 0.2s;"></div>
        </div>

        <div style="margin-bottom: 20px; font-size: 13px; text-align: center;">
            <span id="otp-timer-text" style="color: #64748b;">Resend code available in <strong style="color: #0ea365;">20s</strong></span>
            <button type="button" id="resend-otp-btn" disabled style="display: none; background: none; border: none; color: #059669; font-weight: 600; font-size: 13px; cursor: pointer; text-decoration: underline; padding: 0; outline: none;">Resend Code</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; max-width: 280px; margin: 0 auto; user-select:none; -webkit-user-select:none;">
            <button type="button" class="pad-key" data-val="1" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">1</button>
            <button type="button" class="pad-key" data-val="2" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">2</button>
            <button type="button" class="pad-key" data-val="3" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">3</button>
            
            <button type="button" class="pad-key" data-val="4" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">4</button>
            <button type="button" class="pad-key" data-val="5" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">5</button>
            <button type="button" class="pad-key" data-val="6" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">6</button>
            
            <button type="button" class="pad-key" data-val="7" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">7</button>
            <button type="button" class="pad-key" data-val="8" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">8</button>
            <button type="button" class="pad-key" data-val="9" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">9</button>
            
            <button type="button" class="pad-key" data-val="clear" style="padding: 16px; font-size: 14px; font-weight: 600; border: 1px solid #fecaca; background: #fef2f2; border-radius: 10px; cursor: pointer; color:#dc2626; outline:none;">CLR</button>
            <button type="button" class="pad-key" data-val="0" style="padding: 16px; font-size: 18px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; cursor: pointer; color:#1e293b; outline:none;">0</button>
            <button type="button" class="pad-key" data-val="delete" style="padding: 16px; font-size: 14px; font-weight: 600; border: 1px solid #cbd5e1; background: #f1f5f9; border-radius: 10px; cursor: pointer; color:#475569; outline:none;">DEL</button>
        </div>
    </div>
    `;

    Swal.fire({
        title: 'Verify Security Token',
        html: terminalTemplateHtml,
        showConfirmButton: true,
        confirmButtonText: 'Verify Token Code',
        confirmButtonColor: '#0ea365',
        allowOutsideClick: false,
        showLoaderOnConfirm: true,
        didOpen: (popup) => {
            const slots = Array.from(popup.querySelectorAll('.otp-slot'));
            const keys = Array.from(popup.querySelectorAll('.pad-key'));
            const timerText = popup.querySelector('#otp-timer-text');
            const resendBtn = popup.querySelector('#resend-otp-btn');

            // UPDATED: Set up recovery loop countdown to 20 seconds
            const startCountdown = () => {
                secondsLeft = 20;
                resendBtn.style.display = "none";
                resendBtn.disabled = true;
                timerText.style.display = "inline";
                timerText.innerHTML = `Resend code available in <strong style="color: #0ea365;">${secondsLeft}s</strong>`;

                countdownInterval = setInterval(() => {
                    secondsLeft--;
                    if (secondsLeft <= 0) {
                        clearInterval(countdownInterval);
                        timerText.style.display = "none";
                        resendBtn.style.display = "inline-block";
                        resendBtn.disabled = false;
                    } else {
                        timerText.innerHTML = `Resend code available in <strong style="color: #0ea365;">${secondsLeft}s</strong>`;
                    }
                }, 1000);
            };

            startCountdown();

            resendBtn.addEventListener('click', async () => {
                resendBtn.disabled = true;
                resendBtn.textContent = "Sending...";
                try {
                    const res = await fetch("https://bssd-api.vercel.app/api/bank/auth", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "forgot_password_request",
                            email: email,
                            signature: "g-lite"
                        })
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) throw new Error(data.error || "Failed to redistribute token.");

                    resendBtn.textContent = "Resend Code";
                    startCountdown();
                } catch (err) {
                    Swal.showValidationMessage(`Resend Failure: ${err.message}`);
                    resendBtn.disabled = false;
                    resendBtn.textContent = "Resend Code";
                }
            });

            const refreshSlotsDisplay = () => {
                slots.forEach((slot, index) => {
                    if (enteredOTP[index]) {
                        slot.textContent = enteredOTP[index];
                        slot.style.borderColor = "#0ea365";
                        slot.style.background = "#fff";
                    } else {
                        slot.textContent = "";
                        slot.style.borderColor = "#cbd5e1";
                        slot.style.background = "#f8fafc";
                    }
                });
            };

            keys.forEach(key => {
                key.addEventListener('click', () => {
                    const actionValue = key.getAttribute('data-val');
                    if (actionValue === 'clear') enteredOTP = "";
                    else if (actionValue === 'delete') enteredOTP = enteredOTP.slice(0, -1);
                    else if (enteredOTP.length < 6) enteredOTP += actionValue;
                    refreshSlotsDisplay();
                });
            });
        },
        willClose: () => {
            if (countdownInterval) clearInterval(countdownInterval);
        },
        preConfirm: async () => {
            if (enteredOTP.length !== 6) {
                Swal.showValidationMessage("Please enter the complete 6-digit recovery token.");
                return false;
            }
            try {
                const response = await fetch("https://bssd-api.vercel.app/api/bank/auth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "verify_password_otp",
                        user_id: userId,
                        otp: enteredOTP
                    })
                });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.error || "Token verification failure.");
                return true;
            } catch (err) {
                Swal.showValidationMessage(err.message);
                return false;
            }
        }
    }).then((otpResult) => {
        if (otpResult.isConfirmed) {
            openNewPasswordFormTerminal(userId);
        }
    });
}

/**
 * Step 3: Password Update Form Terminal
 */
function openNewPasswordFormTerminal(userId) {
    const formTemplateHtml = `
    <div style="margin: 15px 0; font-family: 'Inter', sans-serif; text-align: left;">
        <p style="font-size: 13px; color:#64748b; margin-bottom: 20px; text-align: center;">Set up your new password below. Make sure it adheres to high-security compliance targets.</p>
        
        <div style="margin-bottom: 15px;">
            <label style="font-size:12px; font-weight:600; color:#475569; display:block; margin-bottom:6px;">New Password</label>
            <input type="password" id="new-password" style="width:100%; box-sizing:border-box; padding:10px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:14px; outline:none; transition:border-color 0.2s;" placeholder="••••••••">
        </div>
        
        <div style="margin-bottom: 15px;">
            <label style="font-size:12px; font-weight:600; color:#475569; display:block; margin-bottom:6px;">Confirm New Password</label>
            <input type="password" id="confirm-password" style="width:100%; box-sizing:border-box; padding:10px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:14px; outline:none; transition:border-color 0.2s;" placeholder="••••••••">
        </div>
    </div>
    `;

    Swal.fire({
        title: 'Reset Credentials',
        html: formTemplateHtml,
        showConfirmButton: true,
        confirmButtonText: 'Commit Password Update',
        confirmButtonColor: '#0ea365',
        allowOutsideClick: false,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!newPassword || !confirmPassword) {
                Swal.showValidationMessage("Please complete both password form elements.");
                return false;
            }
            if (newPassword !== confirmPassword) {
                Swal.showValidationMessage("Password mismatch. Fields must match perfectly.");
                return false;
            }
            if (newPassword.length < 8) {
                Swal.showValidationMessage("Password must contain at least 8 structural characters.");
                return false;
            }
            if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>_]/.test(newPassword)) {
                Swal.showValidationMessage("Must contain: uppercase, lowercase, number, and special character.");
                return false;
            }

            try {
                const response = await fetch("https://bssd-api.vercel.app/api/bank/auth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "commit_new_password",
                        user_id: userId,
                        password: newPassword
                    })
                });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.error || "Database commit operation anomaly.");
                return true;
            } catch (err) {
                Swal.showValidationMessage(err.message);
                return false;
            }
        }
    }).then((finalResult) => {
        if (finalResult.isConfirmed) {
            Swal.fire({
                title: 'Password Updated',
                text: 'Your new security password is active. You can now log in.',
                icon: 'success',
                confirmButtonColor: '#0ea365'
            });
        }
    });
}