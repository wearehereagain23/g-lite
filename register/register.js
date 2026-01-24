// Initialize Supabase
const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// DOM refs
const form = document.getElementById('regForm');
const steps = Array.from(document.querySelectorAll('.step'));
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const stepBubbles = Array.from(document.querySelectorAll('.stepbubble'));
const fills = Array.from(document.querySelectorAll('.wizard-line .fill'));

let current = 0;

function showCurrentStep() {
    steps.forEach((s, idx) => s.classList.toggle('hidden', idx !== current));
    stepBubbles.forEach((b, idx) => b.classList.toggle('active', idx === current));
    fills.forEach((f, i) => {
        f.style.width = (current > i) ? '100%' : '0%';
    });
    prevBtn.style.display = current === 0 ? 'none' : 'inline-block';
    nextBtn.textContent = current === steps.length - 1 ? 'Submit' : 'Next';
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clearError(name) {
    const el = document.getElementById('err-' + name);
    if (el) el.style.display = 'none';
}

function showError(name, msg) {
    const el = document.getElementById('err-' + name);
    if (el) {
        el.style.display = 'block';
        el.textContent = msg;
    }
}

function validateStep(index) {
    let valid = true;
    const inputs = Array.from(steps[index].querySelectorAll('input, select'));

    inputs.forEach(input => {
        const name = input.name;
        clearError(name);

        if (name === 'middlename') return;

        const val = input.value.trim();
        if (!val) {
            showError(name, 'Required');
            valid = false;
        } else if (name === 'email' && !emailRegex.test(val)) {
            showError(name, 'Invalid email');
            valid = false;
        } else if (name === 'pin' && val.length !== 4) {
            showError(name, 'PIN must be 4 digits');
            valid = false;
        } else if (name === 'password2') {
            const pass = document.getElementById('password').value;
            if (val !== pass) {
                showError(name, 'Passwords do not match');
                valid = false;
            }
        }
    });
    return valid;
}

nextBtn.addEventListener('click', async () => {
    // 1. Navigation Logic
    if (current < steps.length - 1) {
        if (!validateStep(current)) return;
        current++;
        showCurrentStep();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // 2. Final Submit Logic
    if (!validateStep(current)) return;

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    Swal.fire({
        title: 'Creating your account...',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false
    });

    try {
        // Check if email exists in Supabase
        const { data: existing } = await supabaseClient
            .from('users')
            .select('email')
            .eq('email', payload.email)
            .maybeSingle();

        if (existing) throw new Error('Email already exists');

        // Generate custom banking data
        const userUUID = crypto.randomUUID();
        const acctNo = "618" + Math.floor(1000000 + Math.random() * 9000000);
        const code = () => Math.floor(10000 + Math.random() * 89999);

        // 3. Insert into Supabase (Matching your SQL Schema)
        const { error: insertError } = await supabaseClient
            .from('users')
            .insert([{
                uuid: userUUID,
                email: payload.email,
                password: payload.password,
                firstname: payload.firstname,
                lastname: payload.lastname,
                middlename: payload.middlename || '',
                address: payload.address,
                city: payload.city,
                zipcode: payload.zipcode,
                country: payload.country,
                phone: payload.phone,
                dateOfBirth: payload.birth,
                gender: payload.gender,
                employstatus: payload.employstatus,
                accttype: payload.accounttype,
                currency: payload.currency,
                pin: payload.pin,
                kinname: payload.kinname,
                accountNumber: acctNo,
                COT: `COT-${code()}`,
                IMF: `IMF-${code()}`,
                TAX: `TAX-${code()}`,
            }]);

        if (insertError) throw insertError;

        // 4. Send Welcome Email (Original API Logic)
        const mailPayload = {
            email: payload.email,
            firstname: payload.firstname,
            accountNumber: acctNo,
            accttype: payload.accounttype,
            currency: payload.currency,
            password: payload.password,
            pin: payload.pin,
            logoUrl: "https://xvwntavtpofolfeqtckn.supabase.co/storage/v1/object/public/logos/logo.PNG"
        };

        try {
            await fetch("https://api-sender-service-runner.vercel.app/api/bank/o_welcome", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(mailPayload)
            });
        } catch (e) { console.warn('Mail failed', e); }

        // 5. Local Login & Redirect
        localStorage.setItem('user_session', JSON.stringify({ uuid: userUUID, email: payload.email }));

        Swal.fire({ title: 'Welcome!', icon: 'success', timer: 1500, showConfirmButton: false })
            .then(() => window.location.href = '../dashboard/index.html');

    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    }
});

prevBtn.addEventListener('click', () => {
    if (current > 0) { current--; showCurrentStep(); }
});

showCurrentStep();