const WORKER_URL = "https://cdn.downloadserverbd.com/";

let currentUser = null;
let currentPath = [];
let allFiles = [];
let filteredFiles = [];
let deleteFileId = null;

// পেজ লোড হলে
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadFiles();
    setupDragDrop();
    setupEventListeners();
});

// অথেন্টিকেশন চেক করুন
function checkAuth() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userStr);
    document.getElementById('userName').textContent = currentUser.email || 'ব্যবহারকারী';
}

// ফাইল লোড করুন
function loadFiles() {
    const path = currentPath.join('/');
    const key = `files_${currentUser.id}_${path}`;
    
    const stored = localStorage.getItem(key);
    if (stored) {
        allFiles = JSON.parse(stored);
    } else {
        allFiles = [];
    }
    
    filterFiles();
}

// ফাইল ফিল্টার করুন
function filterFiles() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const path = currentPath.join('/');
    
    filteredFiles = allFiles.filter(file => {
        const inCurrentPath = file.path === path;
        const matchesSearch = file.name.toLowerCase().includes(query);
        return inCurrentPath && matchesSearch;
    });
    
    displayFiles();
}

// ফাইল প্রদর্শন করুন
function displayFiles() {
    const grid = document.getElementById('fileGrid');
    const empty = document.getElementById('emptyState');
    
    if (filteredFiles.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        grid.innerHTML = filteredFiles.map(file => createFileElement(file)).join('');
    }
}

// ফাইল এলিমেন্ট তৈরি করুন
function createFileElement(file) {
    const icon = file.type === 'folder' ? '📁' : getFileIcon(file.name);
    const size = file.type === 'folder' ? '' : formatFileSize(file.size);
    
    return `
        <div class="file-item" data-id="${file.id}">
            <div style="text-align: center;">
                <div class="file-item-icon">${icon}</div>
                <div class="file-item-name">${file.name}</div>
                <div class="file-item-meta">
                    ${file.type === 'folder' ? 'ফোল্ডার' : size}
                    <br>
                    ${new Date(file.uploadedAt).toLocaleDateString('bn-BD')}
                </div>
            </div>
            <div class="file-item-actions">
                ${file.type === 'folder' 
                    ? `<button onclick="openFolder('${file.id}')">খুলুন</button>` 
                    : `<button onclick="downloadFile('${file.id}')">ডাউনলোড</button>`
                }
                ${file.mimeType?.startsWith('image/') 
                    ? `<button onclick="previewImage('${file.id}')">প্রিভিউ</button>` 
                    : ''
                }
                <button class="delete" onclick="showDeleteModal('${file.id}')">ডিলিট</button>
            </div>
        </div>
    `;
}

// ফাইল আইকন পান
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': '📄', 'doc': '📝', 'docx': '📝',
        'xls': '📊', 'xlsx': '📊', 'ppt': '🎯', 'pptx': '🎯',
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'webp': '🖼️',
        'mp3': '🎵', 'mp4': '🎬', 'webm': '🎬',
        'zip': '📦', 'rar': '📦', '7z': '📦', 'txt': '📄'
    };
    return icons[ext] || '📄';
}

// ফাইল সাইজ ফরম্যাট করুন
function formatFileSize(bytes) {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ফাইল আপলোড করুন
function handleFileUpload(event) {
    const files = event.target.files;
    if (!files) return;
    
    let uploaded = 0;
    const total = files.length;
    
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newFile = {
                id: Date.now().toString() + Math.random(),
                name: file.name,
                type: 'file',
                size: file.size,
                mimeType: file.type,
                uploadedAt: new Date().toISOString(),
                path: currentPath.join('/'),
                data: e.target.result
            };
            
            allFiles.push(newFile);
            saveFiles();
            
            uploaded++;
            const progress = (uploaded / total) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            
            if (uploaded === total) {
                document.getElementById('uploadProgress').style.display = 'none';
                filterFiles();
            }
        };
        reader.readAsArrayBuffer(file);
    }
    
    document.getElementById('uploadProgress').style.display = 'block';
    event.target.value = '';
}

// ফোল্ডার খুলুন
function openFolder(folderId) {
    const folder = allFiles.find(f => f.id === folderId);
    if (folder && folder.type === 'folder') {
        currentPath.push(folder.name);
        updateBreadcrumb();
        loadFiles();
    }
}

// হোমে যান
function goHome() {
    currentPath = [];
    updateBreadcrumb();
    loadFiles();
}

// ব্রেডক্রাম্ব আপডেট করুন
function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    let html = `<span class="breadcrumb-item" onclick="goHome()">🏠 হোম</span>`;
    
    currentPath.forEach((folder, index) => {
        html += `
            <span style="color: var(--text-light);">›</span>
            <span class="breadcrumb-item" onclick="navigateToPath(${index})">${folder}</span>
        `;
    });
    
    breadcrumb.innerHTML = html;
}

// পাথে নেভিগেট করুন
function navigateToPath(index) {
    currentPath = currentPath.slice(0, index + 1);
    updateBreadcrumb();
    loadFiles();
}

// ফোল্ডার তৈরি করুন মোডাল দেখান
function showCreateFolderModal() {
    document.getElementById('folderModal').classList.add('active');
    document.getElementById('folderName').focus();
}

// ফোল্ডার তৈরি করুন
function createFolder() {
    const name = document.getElementById('folderName').value;
    if (!name) {
        alert('ফোল্ডার নাম লিখুন');
        return;
    }
    
    const newFolder = {
        id: Date.now().toString(),
        name: name,
        type: 'folder',
        uploadedAt: new Date().toISOString(),
        path: currentPath.join('/')
    };
    
    allFiles.push(newFolder);
    saveFiles();
    filterFiles();
    closeFolderModal();
    document.getElementById('folderName').value = '';
}

// ফোল্ডার মোডাল বন্ধ করুন
function closeFolderModal() {
    document.getElementById('folderModal').classList.remove('active');
}

// ফাইল ডাউনলোড করুন
function downloadFile(fileId) {
    const file = allFiles.find(f => f.id === fileId);
    if (file && file.data) {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        link.click();
    }
}

// ইমেজ প্রিভিউ করুন
function previewImage(fileId) {
    const file = allFiles.find(f => f.id === fileId);
    if (file && file.mimeType?.startsWith('image/')) {
        document.getElementById('previewImage').src = file.data;
        document.getElementById('previewModal').classList.add('active');
    }
}

// প্রিভিউ বন্ধ করুন
function closePreview() {
    document.getElementById('previewModal').classList.remove('active');
}

// ডিলিট মোডাল দেখান
function showDeleteModal(fileId) {
    deleteFileId = fileId;
    const file = allFiles.find(f => f.id === fileId);
    document.getElementById('deleteMessage').textContent = `"${file.name}" ডিলিট করতে চান?`;
    document.getElementById('deleteModal').classList.add('active');
}

// ডিলিট কনফার্ম করুন
function confirmDelete() {
    if (deleteFileId) {
        allFiles = allFiles.filter(f => f.id !== deleteFileId);
        saveFiles();
        filterFiles();
        closeDeleteModal();
    }
}

// ডিলিট মোডাল বন্ধ করুন
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteFileId = null;
}

// ফাইল সংরক্ষণ করুন
function saveFiles() {
    const path = currentPath.join('/');
    const key = `files_${currentUser.id}_${path}`;
    localStorage.setItem(key, JSON.stringify(allFiles));
}

// ড্র্যাগ-ড্রপ সেটআপ করুন
function setupDragDrop() {
    const dropZone = document.getElementById('dropZone');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
        const files = e.dataTransfer.files;
        document.getElementById('fileInput').files = files;
        handleFileUpload({ target: { files } });
    });
}

// ইভেন্ট লিসেনার সেটআপ করুন
function setupEventListeners() {
    document.getElementById('folderName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            createFolder();
        }
    });
}

// লগআউট করুন
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}