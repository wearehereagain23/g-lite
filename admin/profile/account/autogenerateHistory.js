import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
const USERID = new URLSearchParams(window.location.search).get('i');

// --- Helpers ---
const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Regional pools remain the same...
const nameData = {
    USA: ["James Wilson", "Robert Miller", "Patricia Taylor", "Jennifer Anderson", "Michael Thomas", "Linda Moore"],
    UK: ["Alistair Cook", "Gareth Southgate", "Emma Watson", "Harry Kane", "Oliver Bennett", "Charlotte Higgins"],
    Asia: ["Li Wei", "Hiroshi Tanaka", "Aarav Sharma", "Kim Ji-hoon", "Siti Aminah", "Chen Hao", "Yuki Sato"],
    Europe: ["Hans Schmidt", "Luca Rossi", "Jean Dupont", "Elena Garcia", "Sven Larsson", "Mateo Ricci"]
};

const regionalBanks = {
    USA: ["JPMorgan Chase", "Bank of America", "Wells Fargo", "Citigroup", "Goldman Sachs", "U.S. Bancorp"],
    UK: ["Barclays", "HSBC UK", "Lloyds Bank", "NatWest", "Standard Chartered", "Santander UK"],
    Asia: ["DBS Bank", "Bank of China", "OCBC Bank", "Mitsubishi UFJ", "ICBC", "State Bank of India", "UOB"],
    Europe: ["Deutsche Bank", "BNP Paribas", "Société Générale", "UBS", "Credit Suisse", "ING Group", "Nordea"]
};

/**
 * 1. UI Update - Now reading from ADMIN table
 */
async function updateCreditUI() {
    const btn = document.getElementById('aiGenBtn');
    if (!btn) return;

    // Changed source to 'admin' table
    const { data } = await supabase.from('admin').select('history_credit').eq('id', 1).single();
    const credit = data?.history_credit ?? "0";

    btn.innerHTML = `AI Auto-generate History <span class="badge bg-light text-dark ms-2" id="creditBadge">${credit}</span>`;
    return credit;
}

/**
 * 2. Realtime Sync - Now watching ADMIN table
 */
const subscribeToCredits = () => {
    supabase.channel('admin-credit-sync')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'admin',
            filter: `id=eq.1`
        },
            (payload) => {
                const badge = document.getElementById('creditBadge');
                if (badge) badge.innerText = payload.new.history_credit;
            }).subscribe();
};

/**
 * 3. Main Logic
 */
document.getElementById('aiGenBtn')?.addEventListener('click', async () => {
    if (!USERID) return Swal.fire("Error", "No User ID detected", "error");

    // Fetch latest credit status from ADMIN table
    const { data, error } = await supabase.from('admin').select('history_credit').eq('id', 1).single();
    if (error) return Swal.fire("Error", "Could not verify credits", "error");

    const creditRaw = data.history_credit;
    const creditNum = Number(creditRaw);
    const isPaid = isNaN(creditNum) && creditRaw !== null; // Non-numeric text (e.g., "Unlimited")

    // Alert for low balance
    if (!isPaid && creditNum < 10) {
        return Swal.fire({
            icon: 'warning',
            title: 'Credit Exhausted',
            text: `Your current credit (${creditRaw}) is too low. Please buy more credit from the developer to continue using the AI generator.`,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            confirmButtonText: 'Contact Developer',
            confirmButtonColor: '#f59e0b',
            showCancelButton: true,
            cancelButtonText: 'Close',
            customClass: { popup: 'border border-warning rounded-4 shadow-lg' }
        });
    }

    // Generator Modal (UI logic remains the same)
    const { value: formValues } = await Swal.fire({
        title: 'AI History Generator',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        customClass: { popup: 'border border-secondary rounded-4 shadow-lg' },
        html: `
            <div class="text-start p-2" style="font-size: 14px; color: #cbd5e1;">
                <div class="row g-3">
                    <div class="col-6"><label class="form-label fw-bold">Rows</label><input id="sw-count" type="number" class="form-control" value="10"></div>
                    <div class="col-6">
                        <label class="form-label fw-bold">Region</label>
                        <select id="sw-nat" class="form-select">
                            <option value="Asia">Asia</option><option value="USA">USA</option><option value="UK">UK</option><option value="Europe">Europe</option>
                        </select>
                    </div>
                    <div class="col-6"><label class="form-label fw-bold">Min Amt</label><input id="sw-min" type="number" class="form-control" value="500"></div>
                    <div class="col-6"><label class="form-label fw-bold">Max Amt</label><input id="sw-max" type="number" class="form-control" value="10000"></div>
                    <div class="col-6"><label class="form-label fw-bold">Start Date</label><input id="sw-start" type="date" class="form-control"></div>
                    <div class="col-6"><label class="form-label fw-bold">End Date</label><input id="sw-end" type="date" class="form-control"></div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Generate Records',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#475569',
        preConfirm: () => {
            const start = document.getElementById('sw-start').value;
            const end = document.getElementById('sw-end').value;
            if (!start || !end) return Swal.showValidationMessage('Select a date range');
            return {
                count: parseInt(document.getElementById('sw-count').value),
                nat: document.getElementById('sw-nat').value,
                min: document.getElementById('sw-min').value,
                max: document.getElementById('sw-max').value,
                start, end
            }
        }
    });

    if (formValues) runAIGenerator(formValues, isPaid, creditNum);
});

async function runAIGenerator(cfg, isPaid, currentCredit) {
    Swal.fire({
        title: 'Processing...',
        background: '#0f172a',
        color: '#ffffff',
        html: `<div class="p-3">
                <p id="ai-status" class="text-info">Mapping regional financial routes...</p>
                <div class="progress bg-secondary" style="height: 10px;">
                    <div id="ai-progress" class="progress-bar bg-info progress-bar-striped progress-bar-animated" style="width: 0%"></div>
                </div>
               </div>`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: async () => {
            const status = document.getElementById('ai-status');
            const bar = document.getElementById('ai-progress');

            bar.style.width = "30%";
            let newRows = [];
            const start = new Date(cfg.start);
            const end = new Date(cfg.end);

            for (let i = 0; i < cfg.count; i++) {
                const person = randPick(nameData[cfg.nat]);
                const bank = randPick(regionalBanks[cfg.nat]);

                newRows.push({
                    uuid: USERID, // Still targeting the specific user's history
                    date: (new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))).toISOString().split('T')[0],
                    name: `${person} (${bank})`,
                    amount: new Intl.NumberFormat('en-US').format((Math.random() * (cfg.max - cfg.min) + parseFloat(cfg.min)).toFixed(2)),
                    transactionType: randPick(["Credit", "Debit"]),
                    description: ""
                });
            }

            newRows.sort((a, b) => new Date(b.date) - new Date(a.date));
            await delay(800);
            status.innerText = "Encrypting ledger entries...";
            bar.style.width = "70%";

            // Save records to history table
            const histRes = await supabase.from('history').insert(newRows);

            // Deduct from ADMIN table if not a paid/unlimited account
            if (!isPaid) {
                const newTotal = currentCredit - 10;
                await supabase.from('admin').update({ history_credit: String(newTotal) }).eq('id', 1);
            }

            bar.style.width = "100%";
            await delay(500);

            if (histRes.error) {
                Swal.fire({ icon: 'error', title: 'Error', text: histRes.error.message, background: '#0f172a', color: '#fff' });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Successful',
                    text: `Generated records for ${cfg.nat} region.`,
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#0f172a',
                    color: '#fff'
                });
            }
        }
    });
}

updateCreditUI();
subscribeToCredits();