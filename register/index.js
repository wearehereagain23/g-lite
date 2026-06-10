/**
 * G-LITE BANK APPLICATION CLIENT SIDE FORM VALIDATION ENGINE
 */
document.addEventListener("DOMContentLoaded", () => {
    // DOM Target References Mappings
    const form = document.getElementById('regForm');
    const steps = Array.from(document.querySelectorAll('.step'));
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const stepBubbles = Array.from(document.querySelectorAll('.stepbubble'));
    const fills = Array.from(document.querySelectorAll('.wizard-line .fill'));

    // Strength Meter DOM Element Maps
    const passwordInput = document.getElementById('password');
    const strengthContainer = document.getElementById('password-strength-container');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');

    let current = 0;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /**
     * Interface State Progress Tracker Synchronizer
     */
    function showCurrentStep() {
        steps.forEach((s, idx) => s.classList.toggle('hidden', idx !== current));
        stepBubbles.forEach((b, idx) => b.classList.toggle('active', idx === current));

        fills.forEach((f, i) => {
            f.style.width = (current > i) ? '100%' : '0%';
        });

        prevBtn.style.display = current === 0 ? 'none' : 'inline-block';
        nextBtn.textContent = current === steps.length - 1 ? 'Submit Application' : 'Next Step';
    }

    function clearError(name) {
        const el = document.getElementById('err-' + name);
        if (el) {
            el.style.display = 'none';
            el.textContent = '';
        }
        const inputField = document.getElementById(name);
        if (inputField) {
            inputField.style.borderColor = '';
        }
    }

    function showError(name, msg) {
        const el = document.getElementById('err-' + name);
        if (el) {
            el.style.display = 'block';
            el.textContent = msg;
        }
        const inputField = document.getElementById(name);
        if (inputField) {
            inputField.style.borderColor = '#dc2626'; // Red Alert Validation Border Accent
        }
    }

    /**
     * Helper Function: Evaluates Password Strength Matrix
     */
    function checkPasswordStrength(password) {
        let score = 0;
        if (!password) return { score, label: "", color: "" };

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) {
            return { score, label: "Weak Security Configuration", color: "#dc2626" };
        } else if (score <= 4) {
            return { score, label: "Medium Protection Layer", color: "#f59e0b" };
        } else {
            return { score, label: "Strong Bank-Grade Security Verified", color: "#10b981" };
        }
    }

    // Bind real-time input event monitoring loop onto the password entry field
    if (passwordInput && strengthContainer && strengthBar && strengthText) {
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value;
            if (!val) {
                strengthContainer.style.display = 'none';
                return;
            }

            strengthContainer.style.display = 'block';
            const metrics = checkPasswordStrength(val);

            // Translate score metrics cleanly into a responsive percentage width
            const pct = (metrics.score / 5) * 100;
            strengthBar.style.width = pct + "%";
            strengthBar.style.backgroundColor = metrics.color;
            strengthText.textContent = metrics.label;
            strengthText.style.color = metrics.color;
        });
    }

    /**
     * Constraint Verification Rule Checking Blocks Engine
     */
    function validateStep(index) {
        let valid = true;
        const inputs = Array.from(steps[index].querySelectorAll('input, select'));

        inputs.forEach(input => {
            const name = input.name;
            if (!name) return;

            clearError(name);

            if (name === 'middlename') return;

            const val = input.value.trim();

            if (!val) {
                showError(name, 'This parameter context field is required.');
                valid = false;
            } else if (name === 'email' && !emailRegex.test(val)) {
                showError(name, 'Please enter a valid email address structure.');
                valid = false;
            } else if (name === 'pin' && !/^\d{4}$/.test(val)) {
                showError(name, 'Secure transaction token PIN parameters must match exactly 4 digits.');
                valid = false;
            } else if (name === 'password') {
                const metrics = checkPasswordStrength(val);
                if (val.length < 8) {
                    showError(name, 'Passwords must be a minimum configuration length of 8 characters.');
                    valid = false;
                } else if (metrics.score < 5) {
                    showError(name, 'Password requires a mix of uppercase, lowercase, numbers, and symbols.');
                    valid = false;
                }
            } else if (name === 'password2') {
                const pass = passwordInput.value;
                if (val !== pass) {
                    showError(name, 'Secondary verification entry fails confirmation identity matching check.');
                    valid = false;
                }
            }
        });

        return valid;
    }

    // Step navigation switching logic matrix
    nextBtn.addEventListener('click', async () => {
        if (current < steps.length - 1) {
            if (!validateStep(current)) return;
            current++;
            showCurrentStep();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!validateStep(current)) return;

        const fd = new FormData(form);
        const payload = Object.fromEntries(fd.entries());

        // --- CORE SANITIZATION & INTERCEPT MATRIX LAYER ---
        if (payload.email) {
            payload.email = payload.email.trim().toLowerCase();
        }

        const formatName = (str) => {
            if (!str) return "";
            const trimmed = str.trim();
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        };

        if (payload.firstname) payload.firstname = formatName(payload.firstname);
        if (payload.middlename) payload.middlename = formatName(payload.middlename);
        if (payload.lastname) payload.lastname = formatName(payload.lastname);
        if (payload.kinname) payload.kinname = formatName(payload.kinname);
        if (payload.city) payload.city = formatName(payload.city);

        delete payload.password2;

        // =========================================================================
        // STABILIZATION MAPPING HARDENING LAYER (HTML Input Name vs Backend Fix)
        // =========================================================================
        // If your HTML template inputs use name="dateOfBirth", align it for handleRegistration structure:
        if (payload.dateOfBirth && !payload.birth) payload.birth = payload.dateOfBirth;
        if (payload.birth && !payload.dateOfBirth) payload.dateOfBirth = payload.birth;

        // If your HTML template select element has name="accttype", align it:
        if (payload.accttype && !payload.accounttype) payload.accounttype = payload.accttype;
        if (payload.accounttype && !payload.accttype) payload.accttype = payload.accounttype;

        payload.action = "register";
        payload.signature = "g-lite"; // Perfectly synchronized mapping key identifier

        Swal.fire({
            title: 'Verifying Security Parameters...',
            html: 'Contacting bank clearance',
            didOpen: () => Swal.showLoading(),
            allowOutsideClick: false
        });

        try {
            const response = await fetch("https://bssd-api.vercel.app/api/bank/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.error || "Server validation boundary exception error.");
            }

            localStorage.setItem('user_session_token', result.token);
            localStorage.setItem('user_profile_cache', JSON.stringify(result.user));

            Swal.fire({
                title: 'Account Activated!',
                text: 'Redirecting cleanly onto systems dashboard platform profiles clear.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = '../dash/index.html';
            });

        } catch (err) {
            Swal.fire('Registration Interruption Fault', err.message, 'error');
        }
    });

    prevBtn.addEventListener('click', () => {
        if (current > 0) {
            current--;
            showCurrentStep();
        }
    });

    showCurrentStep();
});