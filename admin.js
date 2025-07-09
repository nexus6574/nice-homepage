// 管理画面JavaScript

// 認証情報
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'nice2024'
};

// デフォルト店舗データ
const DEFAULT_STORES = [
    {
        id: 1,
        name: 'Premium Club TOKYO',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop&crop=center',
        price: '3,000円〜',
        badge: '高級店',
        description: '高級感あふれる店内で最高のひと時を。経験豊富なキャストが心を込めてお客様をおもてなしいたします。完全個室も完備。',
        features: ['完全個室', '経験豊富', '高級内装']
    },
    {
        id: 2,
        name: 'Club Elegance',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop&crop=center',
        price: '2,500円〜',
        badge: '上品',
        description: '上品で落ち着いた雰囲気のお店。大人の時間を楽しみたい方におすすめ。質の高いサービスと心地よい空間を提供します。',
        features: ['落ち着いた雰囲気', '大人向け', '質の高いサービス']
    },
    {
        id: 3,
        name: 'Night Paradise',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center',
        price: '2,000円〜',
        badge: '人気',
        description: '活気あふれる楽しい空間。初心者の方でも気軽にお楽しみいただけます。明るいキャストと楽しい時間をお過ごしください。',
        features: ['初心者歓迎', '活気ある', 'リーズナブル']
    },
    {
        id: 4,
        name: 'Luxury Lounge',
        image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=300&fit=crop&crop=center',
        price: '4,000円〜',
        badge: 'ラグジュアリー',
        description: '極上のサービスと居心地の良さを追求した特別な空間。VIP待遇で最高級のおもてなしをお約束いたします。',
        features: ['VIP待遇', '最高級', '特別空間']
    },
    {
        id: 5,
        name: 'Royal Cabinet',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop&crop=center',
        price: '3,500円〜',
        badge: '王室級',
        description: '王室のような豪華な内装と最上級のサービス。特別な日や接待にも最適な格式高いお店です。完全予約制。',
        features: ['完全予約制', '豪華内装', '接待向け']
    },
    {
        id: 6,
        name: 'Diamond Club',
        image: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=400&h=300&fit=crop&crop=center',
        price: '2,800円〜',
        badge: '新店',
        description: '新しくオープンした話題のお店。モダンな内装と若いキャストが魅力。オープン記念として特別料金でご案内中。',
        features: ['新店オープン', 'モダン内装', '特別料金']
    }
];

// グローバル変数
let currentStores = [];
let editingStoreId = null;
let isAuthenticated = false;

// DOM要素
const loginScreen = document.getElementById('login-screen');
const adminScreen = document.getElementById('admin-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const storesContainer = document.getElementById('stores-container');
const addStoreBtn = document.getElementById('add-store-btn');
const saveAllBtn = document.getElementById('save-all-btn');
const resetDataBtn = document.getElementById('reset-data-btn');
const editModal = document.getElementById('edit-modal');
const storeForm = document.getElementById('store-form');
const modalTitle = document.getElementById('modal-title');

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // 認証状態をチェック
    checkAuthStatus();
    
    // 店舗データを初期化
    initializeStoreData();
    
    // 店舗一覧を表示
    if (isAuthenticated) {
        renderStores();
    }
}

function checkAuthStatus() {
    const authToken = localStorage.getItem('admin_auth');
    if (authToken === 'authenticated') {
        isAuthenticated = true;
        showAdminScreen();
    } else {
        showLoginScreen();
    }
}

function initializeStoreData() {
    const savedStores = localStorage.getItem('cabaret_stores');
    if (savedStores) {
        currentStores = JSON.parse(savedStores);
    } else {
        currentStores = [...DEFAULT_STORES];
        saveStores();
    }
}

function setupEventListeners() {
    // ログイン
    loginForm.addEventListener('submit', handleLogin);
    
    // ログアウト
    logoutBtn.addEventListener('click', handleLogout);
    
    // 店舗管理
    addStoreBtn.addEventListener('click', showAddStoreModal);
    saveAllBtn.addEventListener('click', handleSaveAll);
    resetDataBtn.addEventListener('click', handleResetData);
    
    // モーダル
    document.querySelector('.close-btn').addEventListener('click', hideModal);
    document.querySelector('.cancel-btn').addEventListener('click', hideModal);
    storeForm.addEventListener('submit', handleStoreSubmit);
    
    // モーダル外クリックで閉じる
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            hideModal();
        }
    });
}

// 認証処理
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAuthenticated = true;
        localStorage.setItem('admin_auth', 'authenticated');
        showAdminScreen();
        showMessage('ログインしました', 'success');
    } else {
        showError('ユーザー名またはパスワードが正しくありません');
    }
}

function handleLogout() {
    if (confirm('ログアウトしますか？')) {
        isAuthenticated = false;
        localStorage.removeItem('admin_auth');
        showLoginScreen();
        loginForm.reset();
        showMessage('ログアウトしました', 'success');
    }
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    adminScreen.style.display = 'none';
}

function showAdminScreen() {
    loginScreen.style.display = 'none';
    adminScreen.style.display = 'block';
    renderStores();
}

function showError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
    setTimeout(() => {
        loginError.classList.remove('show');
    }, 3000);
}

// 店舗管理
function renderStores() {
    storesContainer.innerHTML = '';
    
    currentStores.forEach(store => {
        const storeCard = createStoreCard(store);
        storesContainer.appendChild(storeCard);
    });
}

function createStoreCard(store) {
    const card = document.createElement('div');
    card.className = 'admin-store-card';
    card.innerHTML = `
        <div class="admin-store-image">
            <img src="${store.image}" alt="${store.name}" loading="lazy">
        </div>
        <div class="admin-store-info">
            <div class="admin-store-name">${store.name}</div>
            <div class="admin-store-price">${store.price}</div>
            <div class="admin-store-actions">
                <button class="edit-btn" onclick="editStore(${store.id})">編集</button>
                <button class="delete-btn" onclick="deleteStore(${store.id})">削除</button>
            </div>
        </div>
    `;
    return card;
}

function editStore(id) {
    const store = currentStores.find(s => s.id === id);
    if (!store) return;
    
    editingStoreId = id;
    modalTitle.textContent = '店舗情報編集';
    
    // フォームに既存データを設定
    document.getElementById('store-name').value = store.name;
    document.getElementById('store-image').value = store.image;
    document.getElementById('store-price').value = store.price;
    document.getElementById('store-badge').value = store.badge;
    document.getElementById('store-description').value = store.description;
    document.getElementById('store-features').value = store.features.join(', ');
    
    showModal();
}

function deleteStore(id) {
    const store = currentStores.find(s => s.id === id);
    if (!store) return;
    
    if (confirm(`「${store.name}」を削除しますか？`)) {
        currentStores = currentStores.filter(s => s.id !== id);
        saveStores();
        renderStores();
        showMessage('店舗を削除しました', 'success');
    }
}

function showAddStoreModal() {
    editingStoreId = null;
    modalTitle.textContent = '新規店舗追加';
    storeForm.reset();
    showModal();
}

function handleStoreSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('store-name').value,
        image: document.getElementById('store-image').value,
        price: document.getElementById('store-price').value,
        badge: document.getElementById('store-badge').value,
        description: document.getElementById('store-description').value,
        features: document.getElementById('store-features').value
            .split(',')
            .map(f => f.trim())
            .filter(f => f.length > 0)
    };
    
    if (editingStoreId) {
        // 編集
        const storeIndex = currentStores.findIndex(s => s.id === editingStoreId);
        if (storeIndex !== -1) {
            currentStores[storeIndex] = { ...currentStores[storeIndex], ...formData };
            showMessage('店舗情報を更新しました', 'success');
        }
    } else {
        // 新規追加
        const newId = Math.max(...currentStores.map(s => s.id), 0) + 1;
        const newStore = { id: newId, ...formData };
        currentStores.push(newStore);
        showMessage('新しい店舗を追加しました', 'success');
    }
    
    saveStores();
    renderStores();
    hideModal();
}

function handleSaveAll() {
    saveStores();
    showMessage('全ての変更を保存しました', 'success');
}

function handleResetData() {
    if (confirm('全ての店舗データを初期状態にリセットしますか？この操作は取り消せません。')) {
        currentStores = [...DEFAULT_STORES];
        saveStores();
        renderStores();
        showMessage('データをリセットしました', 'warning');
    }
}

function saveStores() {
    localStorage.setItem('cabaret_stores', JSON.stringify(currentStores));
}

// モーダル制御
function showModal() {
    editModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    editModal.classList.remove('show');
    document.body.style.overflow = '';
    storeForm.reset();
    editingStoreId = null;
}

// メッセージ表示
function showMessage(message, type = 'success') {
    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const adminControls = document.querySelector('.admin-controls');
    adminControls.appendChild(messageDiv);
    
    // 3秒後に自動削除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// データエクスポート用の関数（デバッグ用）
function exportStoreData() {
    const data = JSON.stringify(currentStores, null, 2);
    console.log('Store Data:', data);
    return data;
}

// グローバル関数として露出（HTMLから呼び出すため）
window.editStore = editStore;
window.deleteStore = deleteStore;
window.exportStoreData = exportStoreData; 