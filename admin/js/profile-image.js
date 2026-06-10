export function initProfileImageActionsPipeline(account) {
    const triggerArea = document.getElementById("profile-avatar-action-trigger");
    const displayBubble = document.getElementById("profile-avatar-target-display");
    if (!triggerArea || !displayBubble) return;

    const initial = (account.firstname || "U").charAt(0).toUpperCase();

    const updateDisplay = (url) => {
        if (url && url.trim() !== "") {
            displayBubble.innerHTML = `<img src="${url.trim()}" alt="Profile">`;
            displayBubble.style.background = "transparent";
        } else {
            displayBubble.innerText = initial;
            displayBubble.style.background = "var(--bg-workspace-dark)";
        }
    };

    updateDisplay(account.image);

    triggerArea.onclick = () => {
        const hasImage = !!(account.image && account.image.trim() !== "");

        Swal.fire({
            title: 'Profile Avatar Control',
            text: 'Choose an administrative operation context action to update storage nodes:',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: hasImage ? 'View Photo' : 'Upload New Photo',
            denyButtonText: 'Upload New Photo',
            cancelButtonText: 'Close Panel',
            showDenyButton: hasImage,
            footer: hasImage ? `<button id="swal-destructive-image-purge-btn" class="swal2-styled swal2-deny" style="background-color: var(--status-blocked-red); padding: 6px 12px; font-size: 12px; border-radius: 4px;">Delete Profile Image Asset</button>` : '',
            didOpen: () => {
                const destructivePurgeBtn = document.getElementById("swal-destructive-image-purge-btn");
                if (destructivePurgeBtn) {
                    destructivePurgeBtn.onclick = () => {
                        Swal.close();
                        executeAvatarNetworkAction(account, null, "delete");
                    };
                }
            }
        }).then((result) => {
            if (result.isConfirmed && !hasImage) {
                triggerNativeFileUploaderSequence(account);
            } else if (result.isConfirmed && hasImage) {
                Swal.fire({
                    imageUrl: account.image,
                    imageAlt: 'Profile Visual Area',
                    background: '#0f172a',
                    confirmButtonText: 'Close',
                    confirmButtonColor: '#475569'
                });
            } else if (result.isDenied) {
                triggerNativeFileUploaderSequence(account);
            }
        });
    };
}

function triggerNativeFileUploaderSequence(account) {
    const standaloneInput = document.createElement("input");
    standaloneInput.type = "file";
    standaloneInput.accept = "image/*";
    standaloneInput.onchange = (e) => {
        if (e.target.files.length > 0) {
            executeAvatarNetworkAction(account, e.target.files[0], "upload");
        }
    };
    standaloneInput.click();
}


async function executeAvatarNetworkAction(account, fileObject, streamActionType) {
    const adminToken = localStorage.getItem("admin_session_token");
    const targetUrl = "https://bssd-api.onrender.com/api/bank/avatar";

    const headers = {
        "Authorization": `Bearer ${adminToken}`,
        "X-User-UUID": account.uuid
    };
    let bodyPayload;

    // ==========================================================================
    // OPTIMISTIC UI: INSTANTLY INTERCEPT LAYOUT ELEMENTS LOCALLY FIRST
    // ==========================================================================
    let backupUrl = account.image;
    let temporaryLocalUrl = null;

    if (streamActionType === "delete") {
        headers["X-Action"] = "delete";
        account.image = null;
    } else {
        headers["X-Action"] = "profile";
        bodyPayload = new FormData();
        bodyPayload.append("avatar", fileObject);

        temporaryLocalUrl = URL.createObjectURL(fileObject);
        account.image = temporaryLocalUrl;
    }

    // Update local cache layouts instantly
    updateLocalCacheRecordWithMutations(account);

    try {
        // Step 1: Upload the file asset safely to your Supabase cloud storage bucket
        const response = await fetch(targetUrl, {
            method: "POST",
            headers: headers,
            body: bodyPayload
        });

        const data = await response.json();

        if (data.success) {
            // Assign the true remote cloud link path
            account.image = data.imageUrl || null;

            // ==========================================================================
            // DATABASE SYNC LINK: PERSIST PATH DIRECTLY TO USER COLUMN MATRIX
            // ==========================================================================
            const dbSyncResponse = await fetch(`https://bssd-api.onrender.com/api/bank/admin-users?id=${account.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`
                },
                body: JSON.stringify(account) // Sends the complete account record including fresh image column path
            });

            const dbSyncData = await dbSyncResponse.json();
            if (!dbSyncResponse.ok || !dbSyncData.success) {
                throw new Error(dbSyncData.error || "Failed to link storage location url onto account table row.");
            }

            // Sync cache layout states safely
            updateLocalCacheRecordWithMutations(account);

            Swal.fire({
                icon: 'success',
                title: 'Synchronized',
                text: 'Profile image modified and saved permanently to server database table.',
                timer: 1500,
                showConfirmButton: false,
                background: '#0f172a',
                color: '#ffffff'
            });
        } else {
            throw new Error(data.error || "Execution dropped.");
        }
    } catch (err) {
        // Rollback local state instantly if backend rejects any part of the network loop
        account.image = backupUrl;
        updateLocalCacheRecordWithMutations(account);

        Swal.fire({
            icon: 'error',
            title: 'Process Refused',
            text: err.message,
            background: '#0f172a',
            color: '#ffffff'
        });
    } finally {
        if (temporaryLocalUrl) {
            URL.revokeObjectURL(temporaryLocalUrl);
        }
    }
}


// Utility pipeline block that updates your main local storage state engine array cleanly
function updateLocalCacheRecordWithMutations(modifiedAccount) {
    const localSavedCache = localStorage.getItem("admin_users_directory_cache");
    if (!localSavedCache) return;

    try {
        let registryList = JSON.parse(localSavedCache);
        const indexMatch = registryList.findIndex(u => u.id === modifiedAccount.id);

        if (indexMatch !== -1) {
            registryList[indexMatch] = modifiedAccount;
            localStorage.setItem("admin_users_directory_cache", JSON.stringify(registryList));

            // Fire the global listener to repaint avatars inside both sidebar lists and detail wrappers instantly
            window.dispatchEvent(new Event("adminDirectoryCacheUpdated"));
        }
    } catch (err) {
        console.error("Local tracking mirror injection exception:", err);
    }
}