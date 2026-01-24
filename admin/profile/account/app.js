import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/* ===== Init Supabase ===== */
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

/* ===== Globals & Helpers ===== */
const USERID = new URLSearchParams(window.location.search).get('i');
let currentUserData = null;

const showSpinnerModal = () => document.getElementById('spinnerModal')?.style.setProperty('display', 'flex');
const hideSpinnerModal = () => document.getElementById('spinnerModal')?.style.setProperty('display', 'none');

/* ===== 1. Auth Guard (Aligned with Dashboard) ===== */
const adminSession = localStorage.getItem('adminSession'); //
const adminEmail = localStorage.getItem('adminEmail');     //

const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    let num = Number(String(amount).replace(/[^0-9.-]+/g, ""));
    return new Intl.NumberFormat('en-US').format(num);
};

// Error Handler Wrapper
async function safe(fn) {
    try { await fn(); }
    catch (err) {
        hideSpinnerModal();
        console.error(err);
        Swal.fire({ title: "Error", text: err.message || "Operation failed", icon: 'error' });
    }
}



/* ===== 1. Real-time Profile Synchronization ===== */
async function initProfile() {
    // Check for exact keys and values from users.html logic
    if (adminSession !== 'active' || !adminEmail) { //
        console.log("🚪 No admin session, redirecting...");
        window.location.href = "../../login/index.html";
        return;
    }

    if (!USERID) return Swal.fire("Error", "No User ID found", "error");

    // Fetch initial data
    const { data, error } = await supabase.from('users').select('*').eq('uuid', USERID).single();
    if (error) return console.error("Initial load failed:", error);

    updateUIFields(data);

    // Real-time listener
    supabase.channel('profile-sync')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `uuid=eq.${USERID}` },
            payload => updateUIFields(payload.new))
        .subscribe();
}

/**
 * Updates all DOM elements based on IDs provided in the UI
 */
function updateUIFields(data) {
    currentUserData = data;
    const setIf = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) {
            el.value = (typeof value === 'boolean') ? String(value) : (value ?? '');
        }
        else if (el.tagName === "IMG") {
            el.src = value || "../assets/images/user/avatar-1.jpg";
        }
        else {
            el.innerText = value ?? '';
        }
    };

    // Header & Sidebar Read-only
    setIf('weuss', `${data.firstname || ''} ${data.lastname || ''}`);
    setIf('email', data.email);

    const pmler = document.getElementById("pmler");
    if (pmler) pmler.src = data.image || "../assets/images/user/avatar-1.jpg";

    // Personal Info Form
    setIf('firstName', data.firstname);
    setIf('middlename', data.middlename);
    setIf('lastName', data.lastname);
    setIf('accountnumber', data.accountNumber);
    setIf('currency', data.currency);
    setIf('date', data.dateOfBirth);
    setIf('city', data.city);
    setIf('pin', data.pin);
    setIf('email2', data.email);
    setIf('password', data.password);
    setIf('country', data.country);
    setIf('password_change', data.change_password);

    // Permissions & Type Selects
    setIf('activeuser', data.activeuser);
    setIf('transferAccess', data.transferAccess);
    setIf('accttype', data.accttype);

    // Financial Displays (Formatted)
    setIf('accountBalance', formatCurrency(data.accountBalance));
    setIf('walletbalance', formatCurrency(data.walletbalance));
    setIf('bpercent', data.bpercent);
    setIf('wpercent', data.wpercent);

    // Verification Codes
    setIf('imf', data.IMF);
    setIf('cot', data.COT);
    setIf('tax', data.TAX);
}

/* ===== 2. Profile Update Form ===== */
document.getElementById('profileForm')?.addEventListener('submit', (ev) => safe(async () => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    showSpinnerModal();

    const { error } = await supabase.from('users').update({
        firstname: fd.get('firstName'),
        middlename: fd.get('middlename'),
        lastname: fd.get('lastName'),
        accountNumber: fd.get('accountnumber'),
        currency: fd.get('currency'),
        country: fd.get('country'),
        city: fd.get('city'),
        pin: fd.get('pin'),
        email: fd.get('email2'),
        password: fd.get('password'),
        transferAccess: fd.get('transferAccess') === "true",
        activeuser: fd.get('activeuser') === "true",
        accttype: fd.get('accttype'),
        change_password: fd.get('password_change')
    }).eq('uuid', USERID);

    hideSpinnerModal();
    if (!error) {
        Swal.fire({ title: "Success", text: "Profile updated", icon: "success", timer: 1500, showConfirmButton: false });
        // Real-time listener handles UI update
    }
}));

/* ===== 3. Profile Image Upload ===== */
document.getElementById('imageUpload')?.addEventListener('change', (ev) => safe(async () => {
    const file = ev.target.files[0];
    if (!file) return;

    showSpinnerModal();
    const fileExt = file.name.split('.').pop();
    const fileName = `${USERID}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('profileimages')
        .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('profileimages')
        .getPublicUrl(fileName);

    const { error: dbError } = await supabase
        .from('users')
        .update({ image: publicUrl })
        .eq('uuid', USERID);

    if (dbError) throw dbError;

    hideSpinnerModal();
    Swal.fire({ title: "Updated", text: "Image saved", icon: "success", timer: 1000, showConfirmButton: false });
}));

/* ===== 4. Financials Form ===== */
document.getElementById('fom4')?.addEventListener('submit', (ev) => safe(async () => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const cleanNum = (val) => String(Number(String(val).replace(/[^0-9.-]+/g, "")));

    showSpinnerModal();
    const { error } = await supabase.from('users').update({
        accountBalance: cleanNum(fd.get('accountBalance')),
        walletbalance: cleanNum(fd.get('walletbalance')),
        bpercent: fd.get('bpercent'),
        wpercent: fd.get('wpercent')
    }).eq('uuid', USERID);

    hideSpinnerModal();
    if (!error) {
        Swal.fire({ title: "Balances Updated", icon: "success", timer: 1000, showConfirmButton: false });
    }
}));

/* ===== 5. Final Actions (Deletion) ===== */
document.getElementById('deleteUser')?.addEventListener('click', () => safe(async () => {
    const res = await Swal.fire({
        title: "Delete user permanently?",
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33'
    });

    if (res.isConfirmed) {
        showSpinnerModal();
        await supabase.from('users').delete().eq('uuid', USERID);
        await supabase.from('history').delete().eq('uuid', USERID);
        hideSpinnerModal();
        window.location.href = "../../users/dashboard/users.html";
    }
}));

// Logout Logic for Sub-pages
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();

    Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out of the admin session!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout!',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff'
    }).then((result) => {
        if (result.isConfirmed) {
            // 1. Clear session
            localStorage.clear();
            sessionStorage.clear();

            // 2. Redirect - Note the "../../../" to go back 3 folders 
            // from /admin/profile/account/ to the root login
            window.location.href = "../../login/index.html";
        }
    });
});

// Initialize
initProfile();