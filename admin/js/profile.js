export function syncUserProfileFormFields(userObject) {
    const profileForm = document.getElementById("profileForm");
    if (!profileForm) return;

    // Set the dataset context safely
    profileForm.dataset.userUuid = userObject.uuid;

    // Direct Mapping values explicitly out of columns down to your exact HTML inputs layout
    document.getElementById("accountBalance").value = userObject.accountBalance;
    document.getElementById("firstName").value = userObject.firstname;
    document.getElementById("middlename").value = userObject.middlename;
    document.getElementById("lastName").value = userObject.lastname;
    document.getElementById("accountnumber").value = userObject.accountNumber;
    document.getElementById("currency").value = userObject.currency;
    document.getElementById("email2").value = userObject.email;
    document.getElementById("password").value = userObject.password;
    document.getElementById("pin").value = userObject.pin;
    document.getElementById("address").value = userObject.address;
    document.getElementById("city").value = userObject.city;
    document.getElementById("country").value = userObject.country;
    document.getElementById("zipcode").value = userObject.zipcode;
    document.getElementById("phone").value = userObject.phone;
    document.getElementById("dateOfBirth").value = userObject.dateOfBirth;
    document.getElementById("gender").value = userObject.gender;
    document.getElementById("employstatus").value = userObject.employstatus;
    document.getElementById("kinname").value = userObject.kinname;
    document.getElementById("signature").value = userObject.signature;
    document.getElementById("accttype").value = userObject.accttype;
    document.getElementById("imf").value = userObject.IMF;
    document.getElementById("tax").value = userObject.TAX;
    document.getElementById("cot").value = userObject.COT;

    document.getElementById("block_transection").value = String(userObject.block_transection);
    document.getElementById("restricted").value = String(userObject.restricted);
    document.getElementById("transferAccess").value = String(userObject.transferAccess);
    document.getElementById("activeuser").value = String(userObject.activeuser);

    // Detach any previous handlers to avoid duplicate stack triggers
    profileForm.onsubmit = null;

    // Intercept with the high-performance local persistent optimization handler
    profileForm.onsubmit = async (event) => {
        event.preventDefault();

        // 1. Compile the fresh modified data payload from your form layout inputs
        const updatedPayload = {
            ...userObject, // Maintain static identifiers (id, uuid, image links)
            accountBalance: document.getElementById("accountBalance").value.trim(),
            firstname: document.getElementById("firstName").value.trim(),
            middlename: document.getElementById("middlename").value.trim(),
            lastname: document.getElementById("lastName").value.trim(),
            accountNumber: document.getElementById("accountnumber").value.trim(),
            currency: document.getElementById("currency").value.trim(),
            email: document.getElementById("email2").value.trim(),
            password: document.getElementById("password").value.trim(),
            pin: document.getElementById("pin").value.trim(),
            address: document.getElementById("address").value.trim(),
            city: document.getElementById("city").value.trim(),
            country: document.getElementById("country").value.trim(),
            zipcode: document.getElementById("zipcode").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            dateOfBirth: document.getElementById("dateOfBirth").value.trim(),
            gender: document.getElementById("gender").value.trim(),
            employstatus: document.getElementById("employstatus").value.trim(),
            kinname: document.getElementById("kinname").value.trim(),
            signature: document.getElementById("signature").value.trim(),
            accttype: document.getElementById("accttype").value,
            IMF: document.getElementById("imf").value.trim(),
            TAX: document.getElementById("tax").value.trim(),
            COT: document.getElementById("cot").value.trim(),

            block_transection: document.getElementById("block_transection").value === "true",
            restricted: document.getElementById("restricted").value === "true",
            transferAccess: document.getElementById("transferAccess").value === "true",
            activeuser: document.getElementById("activeuser").value === "true"
        };

        // ==========================================================================
        // OPTIMISTIC UI: MANIPULATE THE LOCAL STORAGE CACHE DIRECTLY FIRST
        // ==========================================================================
        const localSavedCache = localStorage.getItem("admin_users_directory_cache");
        let backupCacheString = localSavedCache; // Keep state copy on standby for failure rollback

        if (localSavedCache) {
            try {
                let registryList = JSON.parse(localSavedCache);
                const indexMatch = registryList.findIndex(u => u.id === userObject.id);

                if (indexMatch !== -1) {
                    registryList[indexMatch] = updatedPayload;
                    localStorage.setItem("admin_users_directory_cache", JSON.stringify(registryList));

                    // Instantly notify list.js to update balances, cards, and labels on screen right away!
                    window.dispatchEvent(new Event("adminDirectoryCacheUpdated"));
                }
            } catch (err) {
                console.warn("Optimistic database local caching mutation tracking error:", err);
            }
        }

        // Trigger immediate optimistic success message layout
        Swal.fire({
            title: "Database Synchronized",
            text: "User parameters updated successfully.",
            icon: "success",
            confirmButtonColor: "#00a884",
            background: "#111b21",
            color: "#fff",
            timer: 1500,
            showConfirmButton: false
        });

        // 2. Dispatch the network mutation payload silently to your server background thread
        await executeProfileDatabaseMutation(userObject.id, profileForm, updatedPayload, backupCacheString);
    };
}

async function executeProfileDatabaseMutation(userId, formElement, updatedPayload, backupCacheString) {
    const adminToken = localStorage.getItem("admin_session_token");
    const spinner = document.getElementById("spinnerModal");

    const submitButton = formElement.querySelector("button[type='submit']");
    let originalButtonText = "Save Changes";
    if (submitButton) {
        originalButtonText = submitButton.innerText;
        submitButton.disabled = true;
        submitButton.innerText = "Synchronizing Parameters...";
        submitButton.style.opacity = "0.6";
        submitButton.style.cursor = "not-allowed";
    }

    if (spinner) spinner.style.display = "flex";

    try {
        const response = await fetch(`https://bssd-api.onrender.com/api/bank/admin-users?id=${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify(updatedPayload)
        });

        const statusResult = await response.json();

        if (!response.ok || !statusResult.success) {
            throw new Error(statusResult.error || "Remote database boundary deployment rejection anomaly.");
        }

    } catch (error) {
        console.error("Profile Synchronization Error, initializing rollback context logic:", error);

        // SERVER TRANSACTION COLD DROPPED: Roll back storage to original backup copy arrays immediately
        if (backupCacheString) {
            localStorage.setItem("admin_users_directory_cache", backupCacheString);
            window.dispatchEvent(new Event("adminDirectoryCacheUpdated"));
        }

        Swal.fire({
            title: "Mutation Rejected",
            text: `Background synchronization failed: ${error.message}. Records rolled back safely.`,
            icon: "error",
            confirmButtonColor: "#ef4444",
            background: "#111b21",
            color: "#fff"
        });
    } finally {
        if (spinner) spinner.style.display = "none";

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerText = originalButtonText;
            submitButton.style.opacity = "1";
            submitButton.style.cursor = "pointer";
        }
    }
}