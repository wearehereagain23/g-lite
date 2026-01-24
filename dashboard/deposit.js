// deposit.js

// --- DEPOSIT POPUP ---
window.showDepositModal = (userData) => {
    Swal.fire({
        showConfirmButton: false,
        width: 600,
        background: '#ffffff',
        html: `
        <div class="popup-container text-start p-3">
            <h2 class="mb-3" style="color:#00313d; border-bottom: 2px solid #00313d;">Deposit Instructions</h2>
            <div class="info-block border p-3 mb-2 rounded bg-light d-flex justify-content-between align-items-center">
                <div><small class="text-muted d-block">Account Holder</small><b id="copyName">${userData.firstname} ${userData.lastname}</b></div>
                <button class="btn btn-sm" onclick="copyToClipboard('copyName')">📋</button>
            </div>
            <div class="info-block border p-3 mb-2 rounded bg-light d-flex justify-content-between align-items-center">
                <div><small class="text-muted d-block">Account Number</small><b class="text-primary" id="copyAcc">${userData.accountNumber}</b></div>
                <button class="btn btn-sm" onclick="copyToClipboard('copyAcc')">📋</button>
            </div>
        </div>`
    });
};

window.copyToClipboard = (id) => {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text);
    Swal.showValidationMessage('Copied!');
    setTimeout(() => Swal.resetValidationMessage(), 1500);
};

// --- SCREEN LOCK LOGIC ---
let lockAttempts = 0;
const MAX_ATTEMPTS = 5;

// deposit.js

window.activateScreenLock = (userData, dbInstance, onSuccess) => {
    if (userData.activeuser === false || userData.activeuser === 'deactivated') {
        showRestrictedSwal();
        return;
    }

    Swal.fire({
        title: 'SESSION LOCKED',
        html: `
            <div style="font-size: 3rem; margin-bottom: 10px;">🔐</div>
            <p>Your session is protected. Enter PIN to continue.</p>
            <input type="password" id="lockPin" class="swal2-input" placeholder="****" 
                   maxlength="4" autocomplete="new-password" 
                   style="text-align:center; letter-spacing:10px; width: 80%;">
            <div id="attemptMsg" style="color:red; font-size:0.8rem; margin-top:5px;"></div>
        `,
        showCancelButton: true,
        cancelButtonText: 'LOGOUT',
        confirmButtonText: 'UNLOCK',
        confirmButtonColor: '#00313d',
        allowOutsideClick: false,
        allowEscapeKey: false,
        // ✅ FORCE STOP AUTOFILL ON OPEN
        didOpen: () => {
            const pinInput = document.getElementById('lockPin');
            pinInput.setAttribute('autocomplete', 'new-password');
            pinInput.value = ""; // Force clear any browser-cached value
        },
        preConfirm: async () => {
            const input = document.getElementById('lockPin').value;
            if (input == userData.pin) {
                lockAttempts = 0;
                localStorage.removeItem('screen_locked');
                return true;
            } else {
                lockAttempts++;
                if (lockAttempts >= MAX_ATTEMPTS) {
                    await dbInstance.from('users').update({ activeuser: false }).eq('uuid', userData.uuid);
                    showRestrictedSwal();
                    return false;
                }
                document.getElementById('attemptMsg').innerText = `Invalid PIN. Attempts left: ${MAX_ATTEMPTS - lockAttempts}`;
                return false;
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (onSuccess) onSuccess();
        } else if (result.isDismissed) {
            handleLogoutRequest(true);
        }
    });
};
function showRestrictedSwal() {
    Swal.fire({
        icon: 'error',
        title: 'ACCOUNT RESTRICTED',
        text: 'Security Alert: Your account is restricted. Contact support.',
        showConfirmButton: false,
        allowOutsideClick: false,
        footer: '<a href="javascript:void(0)" onclick="handleLogoutRequest(true)">Logout and Exit</a>'
    });
}

window.handleLogoutRequest = (force = false) => {
    if (force) {
        localStorage.clear();
        window.location.replace("../index.html");
        return;
    }
    Swal.fire({
        title: 'Logout?',
        text: "Are you sure you want to end your session?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#00313d',
        confirmButtonText: 'Yes, Logout'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.replace("../index.html");
        }
    });
};

// --- 10 SEC AUTO-LOCK LOGIC ---
let hideTimer;
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        hideTimer = setTimeout(() => {
            if (document.visibilityState === 'hidden') {
                localStorage.setItem('screen_locked', 'true');
                location.reload();
            }
        }, 10000); // 10 Seconds
    } else {
        clearTimeout(hideTimer);
    }
});