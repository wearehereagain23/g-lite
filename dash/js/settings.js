/**
 * G-Lite - SYSTEM METRICS SECURITY CONTROL CENTER (FRONTEND DESCRIPTOR WORKER)
 */
document.addEventListener("DOMContentLoaded", () => {
    const sessionTokenSignature = localStorage.getItem("user_session_token");

    const updatedPasswordFormNode = document.getElementById("settings-password-form");
    const updatedPinFormNode = document.getElementById("settings-pin-form");
    const updatedMailNodeForm = document.getElementById("settings-email-form");

    fetchAssignedSecurityDefaults();

    /**
     * Pull data properties straight from database settings variables rules matrix
     */
    async function fetchAssignedSecurityDefaults() {
        if (!sessionTokenSignature) return;

        try {
            const connection = await fetch("https://bssd-api.vercel.app/api/bank/settings", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${sessionTokenSignature}`,
                    "Content-Type": "application/json"
                }
            });
            const result = await connection.json();

            if (connection.ok && result.success) {
                const baselineFallbackImage = "./user.png";
                const headerAvatarNode = document.getElementById("header-avatar-preview");

                if (headerAvatarNode) {
                    const activeDbImage = result.image && result.image.trim() !== "" ? result.image : null;
                    headerAvatarNode.src = activeDbImage ? activeDbImage : baselineFallbackImage;
                }

                const fixedEmailField = document.querySelector("#settings-email-form input[readonly]");
                if (fixedEmailField) {
                    fixedEmailField.value = result.email || "No Email Bound";
                }
            } else if (result.activeuser === false) {
                window.location.href = "../login/index.html";
            }
        } catch (err) {
            console.error("Failed to safely resolve active system settings view metrics profiles:", err.message);
        }
    }

    // ==========================================
    // ACTION DISPATCHER 1: UPDATE PASSWORD BINDING
    // ==========================================
    if (updatedPasswordFormNode) {
        updatedPasswordFormNode.addEventListener("submit", async (e) => {
            e.preventDefault();

            const currentPassword = document.getElementById("pass-current").value;
            const newPassword = document.getElementById("pass-new").value;
            const confirmedPassword = document.getElementById("pass-confirm").value;

            if (newPassword !== confirmedPassword) {
                Swal.fire("Verification Anomaly", "Confirmed matching sequence validation check failure. Strings must stay structurally identical.", "error");
                return;
            }

            if (newPassword.length < 8) {
                Swal.fire("Sizing Limitation Fault", "New account verification key strings must be at least 8 characters long.", "warning");
                return;
            }

            triggerLoaderOverlay("Encoding Identity Matrix Keyphrase...");

            try {
                const response = await fetch("https://bssd-api.vercel.app/api/bank/settings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionTokenSignature}`,
                        "X-Setting-Target": "password"
                    },
                    body: JSON.stringify({ currentPassword, newPassword })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    Swal.fire("Credentials Updated", data.message, "success");
                    updatedPasswordFormNode.reset();
                } else {
                    throw new Error(data.error || "Form execution pipeline update process dropped.");
                }
            } catch (err) {
                Swal.fire("Commit Action Aborted", err.message, "error");
            }
        });
    }

    // ==========================================
    // ACTION DISPATCHER 2: UPDATE TRANSACTION PIN
    // ==========================================
    if (updatedPinFormNode) {
        updatedPinFormNode.addEventListener("submit", async (e) => {
            e.preventDefault();

            const currentPin = document.getElementById("pin-current").value;
            const newPin = document.getElementById("pin-new").value;
            const confirmedPin = document.getElementById("pin-confirm").value;

            if (newPin !== confirmedPin) {
                Swal.fire("Verification Anomaly", "Confirmed numbers pattern mismatch detected.", "error");
                return;
            }

            triggerLoaderOverlay("Re-hashing Transaction Authorization Key...");

            try {
                const response = await fetch("https://bssd-api.vercel.app/api/bank/settings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionTokenSignature}`,
                        "X-Setting-Target": "pin"
                    },
                    body: JSON.stringify({ currentPin, newPin })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    Swal.fire("Vault Key Secure", data.message, "success");
                    updatedPinFormNode.reset();
                } else {
                    throw new Error(data.error || "Vault clear logic validation handler error occurred.");
                }
            } catch (err) {
                Swal.fire("Commit Action Aborted", err.message, "error");
            }
        });
    }

    // ==========================================
    // ACTION DISPATCHER 3: MIGRATE NOTIFICATION MAIL NODE
    // ==========================================
    if (updatedMailNodeForm) {
        updatedMailNodeForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newEmail = document.getElementById("email-new").value;
            const securityAuthPin = document.getElementById("email-auth-pin").value;

            triggerLoaderOverlay("Relocating Default Alert Dispatch Pointers...");

            try {
                const response = await fetch("https://bssd-api.vercel.app/api/bank/settings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionTokenSignature}`,
                        "X-Setting-Target": "email"
                    },
                    body: JSON.stringify({ newEmail, securityAuthPin })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    Swal.fire("Notification Channel Altered", data.message, "success");
                    updatedMailNodeForm.reset();
                    fetchAssignedSecurityDefaults();
                } else {
                    throw new Error(data.error || "Infrastructure core route adjustments failure.");
                }
            } catch (err) {
                Swal.fire("Commit Action Aborted", err.message, "error");
            }
        });
    }

    function triggerLoaderOverlay(statusNoticeString) {
        Swal.fire({
            title: "Securing Network Streams...",
            html: statusNoticeString,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
    }
});