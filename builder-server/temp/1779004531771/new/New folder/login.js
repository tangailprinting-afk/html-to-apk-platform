const WORKER_URL = "https://cdn.downloadserverbd.com/";

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    if (!email || !password) {
        showError('ইমেইল এবং পাসওয়ার্ড প্রয়োজন');
        return;
    }

    // সাধারণ ভ্যালিডেশন
    if (!email.includes('@')) {
        showError('সঠিক ইমেইল লিখুন');
        return;
    }

    if (password.length < 6) {
        showError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
        return;
    }

    // localStorage এ সংরক্ষণ করুন
    const user = {
        id: Date.now().toString(),
        email: email,
        loginTime: new Date().toISOString()
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    
    if (remember) {
        localStorage.setItem('rememberEmail', email);
    }

    // ড্যাশবোর্ডে রিডাইরেক্ট করুন
    window.location.href = 'dashboard.html';
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// পেজ লোড হলে
document.addEventListener('DOMContentLoaded', function() {
    // ইতিমধ্যে লগইন করা আছে কিনা চেক করুন
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'dashboard.html';
    }

    // মনে রাখা ইমেইল লোড করুন
    const rememberEmail = localStorage.getItem('rememberEmail');
    if (rememberEmail) {
        document.getElementById('email').value = rememberEmail;
        document.getElementById('remember').checked = true;
    }

    // Enter কী দিয়ে লগইন করুন
    document.getElementById('password').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleLogin(event);
        }
    });
});