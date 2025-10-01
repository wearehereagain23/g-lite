import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore, doc, getDoc, updateDoc, onSnapshot,
    collection, addDoc, deleteDoc, query, orderBy, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    updatePassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ===== Init Firebase & Supabase ===== */
const firebaseApp = initializeApp(CONFIG.FIREBASE);
const db = getFirestore(firebaseApp);
const auth = getAuth();
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

let dataBase = null;

/* ===== Helpers ===== */
const randRef = len =>
    Array.from({ length: len }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join('');

function formatTimestamp(ts) {
    if (!ts) return "";
    try {
        if (typeof ts === "object" && ts !== null) {
            if (typeof ts.toDate === "function") {
                return ts.toDate().toLocaleString();
            }
            if ("seconds" in ts && "nanoseconds" in ts) {
                const ms = ts.seconds * 1000 + Math.floor(ts.nanoseconds / 1e6);
                return new Date(ms).toLocaleString();
            }
            if ("_seconds" in ts && "_nanoseconds" in ts) {
                const ms = ts._seconds * 1000 + Math.floor(ts._nanoseconds / 1e6);
                return new Date(ms).toLocaleString();
            }
        }
        if (typeof ts === "number") {
            const ms = ts.toString().length === 10 ? ts * 1000 : ts;
            return new Date(ms).toLocaleString();
        }
        if (typeof ts === "string") {
            const d = new Date(ts);
            return isNaN(d) ? "" : d.toLocaleString();
        }
        return "";
    } catch {
        return "";
    }
}

function formatCurrency(amount, locale = 'en-US') {
    if (amount === null || amount === undefined || amount === '') return '';
    let num = Number(String(amount).replaceAll(',', ''));
    if (Number.isNaN(num)) return amount;
    return new Intl.NumberFormat(locale).format(num);
}

function showSpinnerModal() {
    const el = document.getElementById('spinnerModal');
    if (el) el.style.display = 'flex';
}
function hideSpinnerModal() {
    const el = document.getElementById('spinnerModal');
    if (el) el.style.display = 'none';
}

async function safe(fn) {
    try { await fn(); }
    catch (err) {
        hideSpinnerModal();
        console.error(err);
        Swal.fire({ title: "Error", text: err.message || err, icon: 'error' });
    }
}

/* ===== Globals ===== */
const USERID = new URLSearchParams(window.location.search).get('i');
if (!USERID) console.warn('USERID missing in URL param "i"');
const userRef = doc(db, "users", USERID);

/* ===== Live Snapshot: User Profile ===== */
onSnapshot(userRef, (snap) => {
    if (!snap.exists()) return;
    dataBase = snap.data();

    // Wallet balance binding fixed
    const walletEl = document.getElementById('walletbalance');
    if (walletEl) walletEl.value = formatCurrency(dataBase.walletbalance ?? '');

    const setIf = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) el.value = value ?? '';
        else if (el.tagName === "IMG") el.src = value ?? "../assets/images/user/avatar-1.jpg";
        else el.innerText = value ?? '';
    };

    setIf('weuss', `${dataBase.firstname ?? ''} ${dataBase.middlename ?? ''} ${dataBase.lastname ?? ''}`);
    setIf('email', dataBase.email ?? '');
    setIf('password', dataBase.password ?? '');
    setIf('accountnumber', dataBase.accountNumber ?? '');
    setIf('date', dataBase.dateOfBirth ?? dataBase.date ?? '');
    setIf('accounttype', dataBase.accttype ?? '');

    setIf('firstName', dataBase.firstname ?? '');
    setIf('middlename', dataBase.middlename ?? '');
    setIf('lastName', dataBase.lastname ?? '');
    setIf('currency', dataBase.currency ?? '');
    setIf('country', dataBase.country ?? '');
    setIf('city', dataBase.city ?? '');
    setIf('pin', dataBase.pin ?? '');
    setIf('imf', dataBase.IMF ?? '');
    setIf('cot', dataBase.COT ?? '');
    setIf('tax', dataBase.TAX ?? '');
    setIf('occupation', dataBase.occupation ?? '');
    setIf('phoneNumber', dataBase.phone ?? '');
    setIf('maritalStatus', dataBase.marital_status ?? '');
    setIf('postalCode', dataBase.zipcode ?? '');
    setIf('homeAddress', dataBase.address ?? '');
    setIf('nextOfKinContact', dataBase.kin_email ?? '');
    setIf('nextOfKin', dataBase.kinname ?? '');
    setIf('activeuser', dataBase.activeuser ?? '');
    setIf('bpercent', dataBase.bpercent ?? '');
    setIf('wpercent', dataBase.wpercent ?? '');

    const pmler = document.getElementById("pmler");
    if (pmler) pmler.src = dataBase.profileImage || "../assets/images/user/avatar-1.jpg";

    setIf('accountBalance', formatCurrency(dataBase.accountBalance ?? ''));
    setIf('fixedDate', dataBase.fixedDate ?? '');

});

/* ===== Update Forms ===== */
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', (ev) => safe(async () => {
        ev.preventDefault();
        const fd = new FormData(profileForm);
        showSpinnerModal();
        await updateDoc(userRef, {
            firstname: fd.get('firstName') ?? '',
            middlename: fd.get('middlename') ?? '',
            lastname: fd.get('lastName') ?? '',
            accountNumber: fd.get('accountnumber') ?? '',
            currency: fd.get('currency') ?? '',
            dateOfBirth: fd.get('date') ?? '',
            country: fd.get('country') ?? '',
            city: fd.get('city') ?? '',
            pin: fd.get('pin') ?? '',
            transferAccess: fd.get('transferAccess') ?? '',
            activeuser: fd.get('activeuser') ?? '',
        });
        hideSpinnerModal();
        Swal.fire({ title: "Done", icon: 'success' });
    }));
}

const formDA = document.getElementById('fom4');
if (formDA) {
    formDA.addEventListener('submit', (ev) => safe(async () => {
        ev.preventDefault();
        const fd = new FormData(formDA);
        const accountBalance = Number(String(fd.get('accountBalance') ?? '').replaceAll(',', '') || 0);
        const walletbalance = Number(String(fd.get('walletbalance') ?? '').replaceAll(',', '') || 0);
        const bpercent = fd.get('bpercent');
        const wpercent = fd.get('wpercent');
        showSpinnerModal();
        await updateDoc(userRef, { accountBalance, walletbalance, bpercent, wpercent });
        hideSpinnerModal();
        Swal.fire({ title: "Done", icon: 'success' });
    }));
}

const codeForm = document.getElementById('codeForm');
if (codeForm) {
    codeForm.addEventListener('submit', (ev) => safe(async () => {
        ev.preventDefault();
        const fd = new FormData(codeForm);
        showSpinnerModal();
        await updateDoc(userRef, {
            IMF: fd.get('imf') ?? '',
            COT: fd.get('cot') ?? '',
            TAX: fd.get('tax') ?? ''
        });
        hideSpinnerModal();
        Swal.fire({ title: "Done", icon: 'success' });
    }));
}

/* ===== Password Change ===== */
async function adminChangeUserPassword(userEmail, newPassword) {
    const adminEmail = localStorage.getItem('adminEmail');
    const adminPassword = localStorage.getItem('adminPassword');
    if (!adminEmail || !adminPassword) throw new Error("Admin creds missing");

    try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) throw new Error("User not found");
        const oldPassword = snap.data().password;
        if (!oldPassword) throw new Error("Old password not found");

        await signInWithEmailAndPassword(auth, userEmail, oldPassword);
        await updatePassword(auth.currentUser, newPassword);
        await updateDoc(userRef, { password: newPassword });
        await signOut(auth);
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminPassword');
        Swal.fire({ title: "Success", text: "Password changed", icon: "success" });
    } catch (err) {
        console.error(err);
        Swal.fire({ title: "Error", text: err.message, icon: "error" });
    } finally {
        hideSpinnerModal();
    }
}

const formDAT3 = document.getElementById('fom3');
if (formDAT3) {
    formDAT3.addEventListener('submit', (ev) => safe(async () => {
        ev.preventDefault();
        const password = new FormData(formDAT3).get('password');
        if (!password) return Swal.fire({ title: "Enter a password", icon: 'warning' });
        showSpinnerModal();
        adminChangeUserPassword(dataBase.email, password);
    }));
}

/* ===== Image Upload ===== */
const imageUpload = document.getElementById('imageUpload');
if (imageUpload) {
    imageUpload.addEventListener('change', (ev) => safe(async () => {
        const file = ev.target.files[0];
        if (!file) return Swal.fire({ title: "No file selected", icon: 'info' });
        showSpinnerModal();
        const ext = file.name.split('.').pop();
        const path = `profile_${USERID}_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('profileimages').upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('profileimages').getPublicUrl(path);
        await updateDoc(userRef, { profileImage: urlData.publicUrl });
        hideSpinnerModal();
        Swal.fire({ title: "Done", text: "Profile image updated", icon: 'success' });
    }));
}

/* ===== History ===== */
const historyCol = collection(db, "users", USERID, "history");

try {
    const histQuery = query(historyCol, orderBy('date', 'desc'));
    onSnapshot(histQuery, (snapshot) => {
        const tbody = document.getElementById('cvcx2');
        if (!tbody) return;
        tbody.innerHTML = '';
        snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            const row = `
              <tr>
                <td>${d.id}</td>
                <td>${formatTimestamp(d.date)}</td>
                <td>${d.name ?? ''}</td>
                <td style="color:${d.transactionType === "Credit" ? 'green' : 'red'};">
                    ${d.currency ?? ''}${d.amount ?? ''} ${d.transactionType ?? ''}
                </td>
                <td>${d.transactionType === "Debit" ? (d.withdrawFrom ?? '') : (d.bankName ?? '')}</td>
                <td>${d.description ?? ''}</td>
                <td>${d.status ?? ''}</td>
                <td><input type="button" onclick="deleteHistory('${docSnap.id}');" value="Delete"></td>
              </tr>`;
            tbody.insertAdjacentHTML('beforeend', row);
        });
    });
} catch (err) { console.warn('History listener failed', err); }

const formW = document.getElementById('fom7');
if (formW) {
    formW.addEventListener('submit', (ev) => safe(async () => {
        ev.preventDefault();
        const fd = new FormData(formW);
        const historyDate = fd.get('historyDate');
        let dateField = historyDate ? Timestamp.fromDate(new Date(historyDate)) : serverTimestamp();
        await addDoc(historyCol, {
            id: randRef(4),
            amount: String(fd.get('historyAmount') ?? '0').replaceAll(',', ''),
            date: dateField,
            name: fd.get('receiverName') ?? '',
            description: fd.get('description') ?? '',
            status: fd.get('historyStatus') ?? '',
            bankName: fd.get('sources') ?? '',
            transactionType: fd.get('historyType') ?? '',
            withdrawFrom: "Account Balance",
            uuid: USERID,
            currency: (await getDoc(userRef)).data()?.currency ?? '',
            created_at: serverTimestamp()
        });
        hideSpinnerModal();
        Swal.fire({ title: "Saved", icon: 'success' });
        formW.reset();
    }));
}

window.deleteHistory = async (id) => {
    await safe(async () => {
        showSpinnerModal();
        await deleteDoc(doc(db, "users", USERID, "history", id));
        hideSpinnerModal();
        Swal.fire({ title: "Deleted", icon: 'success' });
    });
};

/* ===== Delete User ===== */
const deleteUserBtn = document.getElementById('deleteUser');
if (deleteUserBtn) {
    deleteUserBtn.addEventListener('click', async () => {
        const res = await Swal.fire({ title: "Delete user?", icon: 'warning', showCancelButton: true });
        if (res.isConfirmed) {
            showSpinnerModal();
            await deleteDoc(userRef);
            hideSpinnerModal();
            Swal.fire({ title: "User deleted", icon: 'success' }).then(() => {
                window.location.href = "/users/dashboard/users.html";
            });
        }
    });
}

/* ===== Logout ===== */
document.getElementById('out')?.addEventListener('click', () => {
    signOut(auth)
        .then(() => window.location.href = "../../login/index.html")
        .catch(err => Swal.fire({ title: "Error", text: err.message, icon: "error" }));
});

hideSpinnerModal();
