import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
const USERID = new URLSearchParams(window.location.search).get('i');

// Pagination State
let currentPage = 0;
const pageSize = 10;

const showSpinner = () => document.getElementById('spinnerModal')?.style.setProperty('display', 'flex');
const hideSpinner = () => document.getElementById('spinnerModal')?.style.setProperty('display', 'none');

/**
 * 1. Fetch & Render Logic
 */
async function fetchHistory() {
    if (!USERID) return;

    const from = currentPage * pageSize;
    const to = from + pageSize - 1;

    showSpinner();

    const { data, error, count } = await supabase
        .from('history')
        .select('*', { count: 'exact' })
        .eq('uuid', USERID)
        .order('created_at', { ascending: false })
        .range(from, to);

    hideSpinner();

    if (error) return console.error("History load error:", error.message);

    const tbody = document.getElementById('cvcx2');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No transactions found for this user.</td></tr>';
    }

    data.forEach(item => {
        const row = `
        <tr id="row-${item.id}">
            <td class="align-middle"><small class="text-muted">${item.id}</small></td>
            <td class="align-middle">
                <input type="text" class="form-control form-control-sm" id="date-${item.id}" value="${item.date || ''}">
            </td>
            <td class="align-middle">
                <input type="text" class="form-control form-control-sm" id="name-${item.id}" value="${item.name || ''}">
            </td>
            <td class="align-middle">
                <div class="input-group input-group-sm" style="flex-wrap: nowrap; min-width: 180px;">
                    <input type="text" class="form-control" id="amount-${item.id}" value="${item.amount || ''}" style="width: 60%;">
                    <select class="form-select" id="type-${item.id}" style="width: 40%;">
                        <option value="Credit" ${item.transactionType === 'Credit' ? 'selected' : ''}>Credit</option>
                        <option value="Debit" ${item.transactionType === 'Debit' ? 'selected' : ''}>Debit</option>
                    </select>
                </div>
            </td>
            <td class="align-middle">
                <input type="text" class="form-control form-control-sm" id="desc-${item.id}" value="${item.description || ''}">
            </td>
            <td class="text-center align-middle">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-success d-flex align-items-center" onclick="updateHistoryRow('${item.id}')">
                        <i class="ti ti-check me-1"></i> Update
                    </button>
                    <button class="btn btn-danger d-flex align-items-center" onclick="deleteHistoryRow('${item.id}')">
                        <i class="ti ti-trash me-1"></i>
                    </button>
                </div>
            </td>
        </tr>`;
        tbody.insertAdjacentHTML('beforeend', row);
    });

    updatePaginationUI(count);
}

/**
 * 2. Real-time Subscription (The "Receiver")
 */
const subscribeToHistory = () => {
    supabase
        .channel('history-table-changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'history',
            filter: `uuid=eq.${USERID}`
        }, (payload) => {
            console.log('Real-time sync triggered:', payload.eventType);
            // Refresh table data whenever a change is detected in DB
            fetchHistory();
        })
        .subscribe();
};

/**
 * 3. Pagination UI
 */
function updatePaginationUI(totalCount) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');

    if (!prevBtn || !nextBtn) return;
    prevBtn.style.display = currentPage > 0 ? 'inline-block' : 'none';
    const hasMore = (currentPage + 1) * pageSize < totalCount;
    nextBtn.style.display = hasMore ? 'inline-block' : 'none';

    if (pageInfo) {
        const start = currentPage * pageSize + 1;
        const end = Math.min((currentPage + 1) * pageSize, totalCount);
        pageInfo.innerText = totalCount > 0 ? `Showing ${start}-${end} of ${totalCount}` : "";
    }
}

/**
 * 4. Add Transaction
 */
document.getElementById('fom7')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    showSpinner();
    const { error } = await supabase.from('history').insert([{
        uuid: USERID,
        amount: fd.get('historyAmount').replace(/[^0-9.-]+/g, ""),
        date: fd.get('historyDate'),
        name: fd.get('receiverName'),
        description: fd.get('description'),
        transactionType: fd.get('historyType')
    }]);
    hideSpinner();

    if (error) Swal.fire("Error", error.message, "error");
    else {
        Swal.fire({ title: "Transaction Added", icon: "success", timer: 1000, showConfirmButton: false });
        ev.target.reset();
        // No need to call fetchHistory() here, the Real-time listener handles it!
    }
});

/**
 * 5. Update Row
 */
window.updateHistoryRow = async (rowId) => {
    const payload = {
        date: document.getElementById(`date-${rowId}`).value,
        name: document.getElementById(`name-${rowId}`).value,
        amount: document.getElementById(`amount-${rowId}`).value.replace(/[^0-9.-]+/g, ""),
        transactionType: document.getElementById(`type-${rowId}`).value,
        description: document.getElementById(`desc-${rowId}`).value
    };

    showSpinner();
    const { error } = await supabase.from('history').update(payload).eq('id', rowId);
    hideSpinner();

    if (error) Swal.fire("Update Failed", error.message, "error");
    else {
        Swal.fire({ toast: true, position: 'top-end', icon: "success", title: "Row updated", timer: 2000, showConfirmButton: false });
    }
};

/**
 * 6. Delete Row
 */
window.deleteHistoryRow = async (rowId) => {
    const res = await Swal.fire({
        title: "Delete permanent?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33"
    });

    if (res.isConfirmed) {
        showSpinner();
        await supabase.from('history').delete().eq('id', rowId);
        hideSpinner();
    }
};

/**
 * 7. Pagination Listeners
 */
document.getElementById('prevBtn')?.addEventListener('click', () => { if (currentPage > 0) { currentPage--; fetchHistory(); } });
document.getElementById('nextBtn')?.addEventListener('click', () => { currentPage++; fetchHistory(); });

// Start
fetchHistory();
subscribeToHistory();