function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    // ভ্যালিডেশন
    if (!name || !email || !password || !confirmPassword) {
        showError('সব ফিল্ড পূরণ করুন');
        return;
    }

    if (!email.includes('@')) {
        showError('সঠিক ইমেইল লিখুন');
        return;
    }

    if (password.length < 6) {
        showError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
        return;
    }

    if (password !== confirmPassword) {
        showError('পাসওয়ার্ড মিলছে না');
        return;
    }

    if (!terms) {
        showError('শর্তাবলী সম্মত করুন');
        return;
    }

    // নতুন ব্যবহারকারী তৈরি করুন
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // ইমেইল ইতিমধ্যে আছে কিনা চেক করুন
    if (users.some(u => u.email === email)) {
        showError('এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: btoa(password), // সাধারণ এনকোডিং (প্রোডাকশনে আরও নিরাপদ করুন)
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // সফলতার বার্তা দেখান
    showSuccess('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! লগইন পেজে যাচ্ছি...');

    // ২ সেকেন্ড পরে লগইন পেজে যান
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const errorDiv = document.getElementById('errorMessage');
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
}

// পেজ লোড হলে
document.addEventListener('DOMContentLoaded', function() {
    // ইতিমধ্যে লগইন করা আছে কিনা চেক করুন
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'dashboard.html';
    }

    // Enter কী দিয়ে সাবমিট করুন
    document.getElementById('confirmPassword').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleRegister(event);
        }
    });
});