// configuration
const SUPABASE_URL = "https://dhzjoznlvjrndoiniazw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoempvem5sdmpybmRvaW5pYXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MzM5MjMsImV4cCI6MjA5NDMwOTkyM30.bUrIZDQ8u_bOFhOu6tO-FUoL4_VpcGgVF1exKnU6rIQ";
const WORKER_URL = "https://cdn.downloadserverbd.com";

const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const authForm = document.getElementById('auth-form'); // আপনার HTML এ একটি ফরম লাগবে
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const photoGrid = document.getElementById('photo-grid');

// 1. App Initialization
async function initApp() {
    const { data: { user } } = await sbClient.auth.getUser();
    if (user) {
        const username = user.user_metadata.display_name || user.email.split('@')[0];
        updateUI(user, username);
        fetchPhotos(username);
    } else {
        showAuthUI();
    }
}

// 2. Sign Up Function
async function handleSignUp(email, password, username) {
    const { data, error } = await sbClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { display_name: username }
        }
    });

    if (error) {
        alert("Signup Error: " + error.message);
    } else {
        alert("Signup successful! Please check your email for verification.");
    }
}

// 3. Login Function
async function handleLogin(email, password) {
    const { data, error } = await sbClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Login Error: " + error.message);
    } else {
        location.reload();
    }
}

// 4. File Upload (Thumbnail + Original)
async function uploadFile(file) {
    const { data: { user } } = await sbClient.auth.getUser();
    if (!user) return alert("Login first!");

    const username = user.user_metadata.display_name || user.email.split('@')[0];
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    try {
        // Upload Original
        await fetch(`${WORKER_URL}/${username}/original/${fileName}`, { method: 'PUT', body: file });
        // Upload Thumb
        await fetch(`${WORKER_URL}/${username}/thumb/${fileName}`, { method: 'PUT', body: file });
        
        alert("Uploaded!");
        fetchPhotos(username);
    } catch (err) {
        console.error(err);
    }
}

// 5. Fetch Photos
async function fetchPhotos(username) {
    const res = await fetch(`${WORKER_URL}/list?prefix=${username}/thumb/`);
    const files = await res.json();
    photoGrid.innerHTML = files.map(path => `
        <div class="photo-item">
            <img src="${WORKER_URL}/${path}" onclick="getSecureLink('${path}')">
        </div>
    `).join('');
}

// 6. Secure Download Link
async function getSecureLink(thumbPath) {
    const originalPath = thumbPath.replace('/thumb/', '/original/');
    const res = await fetch(`${WORKER_URL}/generate-token?path=${originalPath}`);
    const data = await res.json();
    if (data.url) window.open(data.url, '_blank');
}

// UI Helpers
function updateUI(user, username) {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('gallery-container').classList.remove('hidden');
    document.getElementById('username-display').innerText = username;
}

function showAuthUI() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('gallery-container').classList.add('hidden');
}

logoutBtn.onclick = async () => { await sbClient.auth.signOut(); location.reload(); };

initApp();