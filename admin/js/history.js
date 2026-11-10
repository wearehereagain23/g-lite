import { triggerAiHistoryGenerationPanel } from "./ai-history.js";

const CONFIG = {
    limitPerPage: 5,
    apiBaseUrl: "https://bank-api-v2.vercel.app/api/bank/admin-history",
    getAuthToken: () => localStorage.getItem("admin_session_token"),
};

const state = {
    currentPage: 1,
    userUuid: null,
    cachedRows: [],
};

// Helper: Get localStorage key dynamically
const getCacheKey = () => `admin_history_ledger_${state.userUuid}`;

/**
 * Initializes listeners and loads initial transaction history for a specified user UUID.
 */
export async function bindSystemLedgerHistoryStream(userUuid) {
    state.userUuid = userUuid;
    state.currentPage = 1;

    const localSavedHistory = localStorage.getItem(getCacheKey());
    const tbody = document.getElementById("cvcx2");

    if (localSavedHistory && tbody) {
        try {
            state.cachedRows = JSON.parse(localSavedHistory);
            renderHistoryTableRows(state.cachedRows);
        } catch {
            console.warn("⚠️ History cache parse failed, fallback to server fetch.");
        }
    } else if (tbody) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 32px; color:var(--text-secondary-muted); font-family: monospace;">Fetching history logs...</td></tr>`;
    }

    await fetchAndRenderHistoryLogs();
    setupEventListeners();
}

/**
 * Attaches single-instance event listeners to static DOM controls.
 */
function setupEventListeners() {
    const logForm = document.getElementById("fom7");
    if (logForm) {
        logForm.onsubmit = async (e) => {
            e.preventDefault();
            await injectNewHistoryLogRow();
        };
    }

    const prevBtn = document.getElementById("prevBtn");
    if (prevBtn) {
        prevBtn.onclick = async () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderHistoryTableRows(state.cachedRows);
                await fetchAndRenderHistoryLogs();
            }
        };
    }

    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
        nextBtn.onclick = async () => {
            state.currentPage++;
            await fetchAndRenderHistoryLogs();
        };
    }

    const closeModalBtn = document.getElementById("closeHistoryModalTrigger");
    if (closeModalBtn) {
        closeModalBtn.onclick = () => toggleModal(false);
    }

    const saveModalBtn = document.getElementById("modal-save-action-btn");
    if (saveModalBtn) {
        saveModalBtn.onclick = commitModalRecordFormModifications;
    }

    const deleteModalBtn = document.getElementById("modal-delete-action-btn");
    if (deleteModalBtn) {
        deleteModalBtn.onclick = async () => {
            const targetId = document.getElementById("modal-log-id").value;
            await dropHistoryNode(targetId);
        };
    }

    const bulkClearBtn = document.getElementById("bulkClearHistoryBtn");
    if (bulkClearBtn) {
        bulkClearBtn.onclick = () => purgeEntireUserLedgerHistoryArchive(state.userUuid);
    }

    const aiGenBtn = document.getElementById("aiGenBtn");
    if (aiGenBtn) {
        aiGenBtn.onclick = () => triggerAiHistoryGenerationPanel(state.userUuid);
    }
}

/**
 * Fetches log items from the backend API for the active page and updates state/cache.
 */
async function fetchAndRenderHistoryLogs() {
    if (!state.userUuid) return;

    try {
        const url = `${CONFIG.apiBaseUrl}?uuid=${state.userUuid}&page=${state.currentPage}&limit=${CONFIG.limitPerPage + 1}`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${CONFIG.getAuthToken()}` }
        });

        const data = await response.json();
        const rawLogs = data.logs || [];

        if (response.ok && data.success) {
            if (state.currentPage === 1) {
                localStorage.setItem(getCacheKey(), JSON.stringify(rawLogs.slice(0, CONFIG.limitPerPage)));
            }
            renderHistoryTableRows(rawLogs);
        }
    } catch (err) {
        const tbody = document.getElementById("cvcx2");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="3" style="color:var(--status-blocked-red); text-align:center; padding: 20px;">Failed to load history logs: ${err.message}</td></tr>`;
        }
    }
}

/**
 * Renders table data rows inside `#cvcx2` and updates pagination display controls.
 */
function renderHistoryTableRows(logs) {
    const tbody = document.getElementById("cvcx2");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pageInfo = document.getElementById("pageInfo");

    if (!tbody) return;

    const hasNextPage = logs.length > CONFIG.limitPerPage;
    state.cachedRows = logs.slice(0, CONFIG.limitPerPage);

    tbody.innerHTML = "";

    if (state.cachedRows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 32px; color:var(--text-secondary-muted); font-family: monospace;">No history records found.</td></tr>`;
        if (prevBtn) prevBtn.style.display = state.currentPage > 1 ? "block" : "none";
        if (nextBtn) nextBtn.style.display = "none";
        if (pageInfo) pageInfo.innerText = "";
        return;
    }

    state.cachedRows.forEach((log) => {
        const tr = document.createElement("tr");
        tr.className = "clickable-row-item";
        tr.style.cursor = "pointer";
        if (log.isOptimisticPending) tr.style.opacity = "0.5";

        const isCredit = log.transactionType === "Credit";
        const colorCode = isCredit ? "#10b981" : "#ef4444";
        const prefixSign = isCredit ? "+" : "-";
        const statusStyle = (log.status || "successful").toLowerCase();

        const formattedAmount = parseFloat(log.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

        tr.innerHTML = `
            <td><small style="font-family: monospace; color:#94a3b8; font-weight:bold;">#${log.id}</small></td>
            <td style="color: ${colorCode}; font-weight: bold; font-family: monospace;">${prefixSign}$${formattedAmount}</td>
            <td><span class="badge-status-pill status-${statusStyle}">${log.status || "Successful"}</span></td>
        `;

        tr.onclick = () => populateAndOpenRecordModal(log.id);
        tbody.appendChild(tr);
    });

    if (pageInfo) pageInfo.innerText = `PAGE: ${state.currentPage}`;
    if (prevBtn) prevBtn.style.display = state.currentPage > 1 ? "block" : "none";
    if (nextBtn) nextBtn.style.display = hasNextPage ? "block" : "none";
}

/**
 * Toggles visibility state of the record editing overlay modal.
 */
function toggleModal(shouldDisplay) {
    const modal = document.getElementById("historyRecordEditModal");
    if (modal) {
        modal.classList.toggle("modal-active-state", shouldDisplay);
    }
}

/**
 * Fills the modal input fields with transaction detail for quick modifications.
 */
function populateAndOpenRecordModal(logId) {
    const row = state.cachedRows.find((item) => String(item.id) === String(logId));
    if (!row) return;

    document.getElementById("modal-log-id").value = row.id;
    document.getElementById("modal-log-date").value = row.date || "";
    document.getElementById("modal-log-name").value = row.name || "";
    document.getElementById("modal-log-amount").value = row.amount || "";
    document.getElementById("modal-log-signature").value = row.signature || "";
    document.getElementById("modal-log-type").value = row.transactionType || "Credit";
    document.getElementById("modal-log-status").value = row.status || "Successful";
    document.getElementById("modal-log-description").value = row.description || "";

    toggleModal(true);
}

/**
 * Submits updated log data from the editor modal to the API.
 */
async function commitModalRecordFormModifications() {
    const targetRowId = document.getElementById("modal-log-id").value;
    const cleanAmount = document.getElementById("modal-log-amount").value.replace(/[^0-9.-]+/g, "");
    const cacheKey = getCacheKey();
    const fallbackBackupString = localStorage.getItem(cacheKey);

    const payload = {
        id: targetRowId,
        date: document.getElementById("modal-log-date").value,
        name: document.getElementById("modal-log-name").value,
        amount: cleanAmount,
        signature: document.getElementById("modal-log-signature").value,
        transactionType: document.getElementById("modal-log-type").value,
        status: document.getElementById("modal-log-status").value,
        description: document.getElementById("modal-log-description").value,
    };

    const targetIdx = state.cachedRows.findIndex((item) => String(item.id) === String(targetRowId));
    if (targetIdx !== -1) {
        state.cachedRows[targetIdx] = { ...state.cachedRows[targetIdx], ...payload };
        localStorage.setItem(cacheKey, JSON.stringify(state.cachedRows));
        renderHistoryTableRows(state.cachedRows);
    }

    toggleModal(false);

    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}?id=${targetRowId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${CONFIG.getAuthToken()}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Update rejected.");

        Swal.fire("Record Updated", "History record updated successfully.", "success");
        await fetchAndRenderHistoryLogs();
    } catch (err) {
        if (fallbackBackupString) {
            localStorage.setItem(cacheKey, fallbackBackupString);
            state.cachedRows = JSON.parse(fallbackBackupString);
            renderHistoryTableRows(state.cachedRows);
        }
        Swal.fire("Update Failed", err.message, "error");
    }
}

/**
 * Optimistically appends a user transaction entry and sends it to server storage.
 */
async function injectNewHistoryLogRow() {
    const formElement = document.getElementById("fom7");
    const submitBtn = formElement?.querySelector("button[type='submit']");
    const originalButtonText = submitBtn?.innerText || "Add History Record";
    const cacheKey = getCacheKey();

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Adding Record...";
        submitBtn.style.opacity = "0.6";
        submitBtn.style.cursor = "not-allowed";
    }

    const cleanAmount = document.getElementById("historyAmount").value.replace(/[^0-9.-]+/g, "") || "0.00";
    const dateFormattedString = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const sendEmailAlert = document.getElementById("historyAlertDispatchMode")?.value === "dispatch";

    const optimisticPayload = {
        id: `MOCK_${Date.now()}`,
        uuid: state.userUuid,
        transactionType: document.getElementById("historyType").value,
        amount: cleanAmount,
        name: document.getElementById("receiverName").value || "N/A",
        signature: document.getElementById("sources").value || "System Ledger",
        description: document.getElementById("description").value || "Account Update",
        date: dateFormattedString,
        status: "Successful",
        dispatchEmailAlert: sendEmailAlert,
        isOptimisticPending: true,
    };

    const fallbackBackupString = localStorage.getItem(cacheKey);
    state.cachedRows.unshift(optimisticPayload);
    localStorage.setItem(cacheKey, JSON.stringify(state.cachedRows.slice(0, CONFIG.limitPerPage)));

    state.currentPage = 1;
    renderHistoryTableRows(state.cachedRows);

    if (formElement) formElement.reset();

    try {
        const { isOptimisticPending, id, ...dbPayload } = optimisticPayload;

        const response = await fetch(CONFIG.apiBaseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${CONFIG.getAuthToken()}`,
            },
            body: JSON.stringify(dbPayload),
        });

        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Database insertion fault.");

        Swal.fire({
            title: "Record Added",
            text: sendEmailAlert ? "Transaction added and email alert dispatched." : "Transaction added successfully.",
            icon: "success",
            background: "#111b21",
            color: "#fff",
            confirmButtonColor: "#00a884",
        });

        await fetchAndRenderHistoryLogs();
    } catch (err) {
        if (fallbackBackupString) {
            localStorage.setItem(cacheKey, fallbackBackupString);
            state.cachedRows = JSON.parse(fallbackBackupString);
            renderHistoryTableRows(state.cachedRows);
        }
        Swal.fire({
            title: "Action Failed",
            text: err.message,
            icon: "error",
            background: "#111b21",
            color: "#fff",
            confirmButtonColor: "#ef4444",
        });
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalButtonText;
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
        }
    }
}

/**
 * Drops a single historical log node record from cache and storage endpoint.
 */
export async function dropHistoryNode(logId) {
    const cacheKey = getCacheKey();
    const confirmation = await Swal.fire({
        title: "Delete this transaction record?",
        text: "This action will permanently remove the record from the database.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#475569",
        confirmButtonText: "Yes, Delete",
    });

    if (!confirmation.isConfirmed) return;

    const fallbackBackupString = localStorage.getItem(cacheKey);

    state.cachedRows = state.cachedRows.filter((item) => String(item.id) !== String(logId));
    localStorage.setItem(cacheKey, JSON.stringify(state.cachedRows));
    renderHistoryTableRows(state.cachedRows);

    toggleModal(false);

    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}?id=${logId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${CONFIG.getAuthToken()}` },
        });

        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Erasure denied.");

        Swal.fire("Deleted", "Record removed successfully.", "success");
        await fetchAndRenderHistoryLogs();
    } catch (err) {
        if (fallbackBackupString) {
            localStorage.setItem(cacheKey, fallbackBackupString);
            state.cachedRows = JSON.parse(fallbackBackupString);
            renderHistoryTableRows(state.cachedRows);
        }
        Swal.fire("Delete Failed", err.message, "error");
    }
}

/**
 * Clears all existing transaction ledger logs for an explicit user UUID.
 */
export async function purgeEntireUserLedgerHistoryArchive(userUuid) {
    if (!userUuid) return;

    const cacheKey = `admin_history_ledger_${userUuid}`;
    const confirmation = await Swal.fire({
        title: "Wipe All Transaction History?",
        text: "Warning! This will permanently delete all transaction history records associated with this account. This cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#475569",
        confirmButtonText: "Yes, Delete All",
        cancelButtonText: "Cancel",
        background: "#0f172a",
        color: "#ffffff",
    });

    if (!confirmation.isConfirmed) return;

    const fallbackBackupString = localStorage.getItem(cacheKey);

    localStorage.setItem(cacheKey, JSON.stringify([]));
    renderHistoryTableRows([]);

    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}?uuid=${userUuid}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${CONFIG.getAuthToken()}` },
        });

        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Data erasure failure.");

        await Swal.fire({
            icon: "success",
            title: "History Cleared",
            text: "All transaction logs wiped clean.",
            background: "#0f172a",
            color: "#ffffff",
            timer: 1500,
            showConfirmButton: false,
        });

        await fetchAndRenderHistoryLogs();
    } catch (err) {
        if (fallbackBackupString) {
            localStorage.setItem(cacheKey, fallbackBackupString);
            state.cachedRows = JSON.parse(fallbackBackupString);
            renderHistoryTableRows(state.cachedRows);
        }
        Swal.fire({
            icon: "error",
            title: "Wipe Failed",
            text: err.message,
            background: "#0f172a",
            color: "#ffffff",
        });
    }
}