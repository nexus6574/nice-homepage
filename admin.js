// 管理画面JavaScript

// 認証情報
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'nice2024'
};

// 利用可能な画像ギャラリー
const AVAILABLE_IMAGES = [
    {
        id: 1,
        url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center',
        name: '高級クラブ内装 1'
    },
    {
        id: 2,
        url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center',
        name: 'エレガントな空間 1'
    },
    {
        id: 3,
        url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center',
        name: 'モダンなバー 1'
    },
    {
        id: 4,
        url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center',
        name: 'ラグジュアリーラウンジ 1'
    },
    {
        id: 5,
        url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center',
        name: '豪華な内装 1'
    },
    {
        id: 6,
        url: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800&h=600&fit=crop&crop=center',
        name: 'モダンクラブ 1'
    },
    {
        id: 7,
        url: 'https://images.unsplash.com/photo-1574391884720-bfafb0d70327?w=800&h=600&fit=crop&crop=center',
        name: 'VIPルーム 1'
    },
    {
        id: 8,
        url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&h=600&fit=crop&crop=center',
        name: 'カウンターバー 1'
    },
    {
        id: 9,
        url: 'https://images.unsplash.com/photo-1520637836862-4d197d17c15a?w=800&h=600&fit=crop&crop=center',
        name: 'プライベート空間 1'
    },
    {
        id: 10,
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
        name: 'ナイトクラブ 1'
    },
    {
        id: 11,
        url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=800&h=600&fit=crop&crop=center',
        name: 'ラウンジエリア 1'
    },
    {
        id: 12,
        url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&h=600&fit=crop&crop=center',
        name: 'バーカウンター 1'
    },
    {
        id: 13,
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
        name: 'クラブ照明 1'
    },
    {
        id: 14,
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop&crop=center',
        name: '店内全景 1'
    },
    {
        id: 15,
        url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop&crop=center',
        name: 'イベントホール 1'
    },
    {
        id: 16,
        url: 'https://images.unsplash.com/photo-1527069398084-e64eec5dd6ab?w=800&h=600&fit=crop&crop=center',
        name: 'ダンスフロア 1'
    },
    {
        id: 17,
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
        name: 'テーブル席 1'
    },
    {
        id: 18,
        url: 'https://images.unsplash.com/photo-1597655601841-214a4cfe8b9c?w=800&h=600&fit=crop&crop=center',
        name: 'VIPボックス 1'
    },
    {
        id: 19,
        url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&crop=center',
        name: 'プレミアム空間 1'
    },
    {
        id: 20,
        url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop&crop=center',
        name: 'エントランス 1'
    }
];

// デフォルト店舗データ（写真ギャラリー付き）
const DEFAULT_STORES = [
    {
        id: 1,
        name: 'Premium Club TOKYO',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center',
        images: [
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center'
        ],
        price: '3,000円〜',
        badge: '高級店',
        description: '高級感あふれる店内で最高のひと時を。経験豊富なキャストが心を込めてお客様をおもてなしいたします。完全個室も完備。',
        features: ['完全個室', '経験豊富', '高級内装']
    },
    {
        id: 2,
        name: 'Club Elegance',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center',
        images: [
            'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center'
        ],
        price: '2,500円〜',
        badge: '上品',
        description: '上品で落ち着いた雰囲気のお店。大人の時間を楽しみたい方におすすめ。質の高いサービスと心地よい空間を提供します。',
        features: ['落ち着いた雰囲気', '大人向け', '質の高いサービス']
    },
    {
        id: 3,
        name: 'Night Paradise',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center',
        images: [
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center'
        ],
        price: '2,000円〜',
        badge: '人気',
        description: '活気あふれる楽しい空間。初心者の方でも気軽にお楽しみいただけます。明るいキャストと楽しい時間をお過ごしください。',
        features: ['初心者歓迎', '活気ある', 'リーズナブル']
    },
    {
        id: 4,
        name: 'Luxury Lounge',
        image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center',
        images: [
            'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center'
        ],
        price: '4,000円〜',
        badge: 'ラグジュアリー',
        description: '極上のサービスと居心地の良さを追求した特別な空間。VIP待遇で最高級のおもてなしをお約束いたします。',
        features: ['VIP待遇', '最高級', '特別空間']
    },
    {
        id: 5,
        name: 'Royal Cabinet',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center',
        images: [
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center'
        ],
        price: '3,500円〜',
        badge: '王室級',
        description: '王室のような豪華な内装と最上級のサービス。特別な日や接待にも最適な格式高いお店です。完全予約制。',
        features: ['完全予約制', '豪華内装', '接待向け']
    },
    {
        id: 6,
        name: 'Diamond Club',
        image: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800&h=600&fit=crop&crop=center',
        images: [
            'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center'
        ],
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
// 画像ギャラリー管理変数
let currentImageType = 'main'; // 'main' または 'gallery'
let currentGalleryIndex = 0;
let currentStoreImages = [null, null, null, null, null]; // ギャラリー画像（5枚）

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
const imageGalleryModal = document.getElementById('image-gallery-modal');

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
    
    // エクスポート/インポート
    document.getElementById('export-data-btn').addEventListener('click', handleExportData);
    document.getElementById('import-data-btn').addEventListener('click', handleImportData);
    document.getElementById('copy-export-btn').addEventListener('click', copyExportToClipboard);
    document.getElementById('download-export-btn').addEventListener('click', downloadExportFile);
    document.getElementById('paste-import-btn').addEventListener('click', handlePasteImport);
    document.getElementById('file-import-btn').addEventListener('click', handleFileImport);
    
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
    
    // 基本情報を設定
    document.getElementById('store-name').value = store.name;
    document.getElementById('store-price').value = store.price;
    document.getElementById('store-badge').value = store.badge;
    document.getElementById('store-description').value = store.description;
    document.getElementById('store-features').value = store.features.join(', ');
    
    // メイン画像を設定
    setMainImage(store.image);
    
    // ギャラリー画像を設定
    currentStoreImages = store.images ? [...store.images] : [null, null, null, null, null];
    updateGalleryPreview();
    
    showModal();
}

// メイン画像を設定
function setMainImage(imageUrl) {
    const preview = document.getElementById('selected-main-image');
    const noImageText = document.querySelector('.no-image-text');
    
    if (imageUrl) {
        preview.src = imageUrl;
        preview.style.display = 'block';
        noImageText.style.display = 'none';
    } else {
        preview.style.display = 'none';
        noImageText.style.display = 'block';
    }
}

// ギャラリー画像プレビューを更新
function updateGalleryPreview() {
    for (let i = 0; i < 5; i++) {
        const slot = document.querySelector(`[data-index="${i}"]`);
        const preview = slot.querySelector('.gallery-preview');
        const selectBtn = slot.querySelector('.select-gallery-btn');
        const removeBtn = slot.querySelector('.remove-gallery-btn');
        
        if (currentStoreImages[i]) {
            preview.src = currentStoreImages[i];
            preview.style.display = 'block';
            selectBtn.textContent = '変更';
            removeBtn.style.display = 'block';
            slot.classList.add('has-image');
        } else {
            preview.style.display = 'none';
            selectBtn.textContent = '選択';
            removeBtn.style.display = 'none';
            slot.classList.remove('has-image');
        }
    }
}

// 画像ギャラリーを表示
function showImageGallery(type, index = 0) {
    currentImageType = type;
    currentGalleryIndex = index;
    
    const galleryGrid = document.querySelector('.image-gallery-grid');
    galleryGrid.innerHTML = '';
    
    AVAILABLE_IMAGES.forEach(image => {
        const imageOption = document.createElement('div');
        imageOption.className = 'gallery-image-option';
        imageOption.onclick = () => selectImage(image.url);
        
        imageOption.innerHTML = `
            <img src="${image.url}" alt="${image.name}" loading="lazy">
            <div class="gallery-image-label">${image.name}</div>
        `;
        
        galleryGrid.appendChild(imageOption);
    });
    
    imageGalleryModal.style.display = 'flex';
}

// 画像を選択
function selectImage(imageUrl) {
    if (currentImageType === 'main') {
        setMainImage(imageUrl);
    } else if (currentImageType === 'gallery') {
        currentStoreImages[currentGalleryIndex] = imageUrl;
        updateGalleryPreview();
    }
    
    hideImageGallery();
}

// ギャラリー画像を削除
function removeGalleryImage(index) {
    currentStoreImages[index] = null;
    updateGalleryPreview();
}

// 画像ギャラリーを非表示
function hideImageGallery() {
    imageGalleryModal.style.display = 'none';
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
    
    // 画像をリセット
    setMainImage('');
    currentStoreImages = [null, null, null, null, null];
    updateGalleryPreview();
    
    showModal();
}

function handleStoreSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('store-name').value,
        image: document.getElementById('selected-main-image').src || '',
        images: currentStoreImages.filter(img => img !== null), // nullを除外
        price: document.getElementById('store-price').value,
        badge: document.getElementById('store-badge').value,
        description: document.getElementById('store-description').value,
        features: document.getElementById('store-features').value.split(',').map(f => f.trim()).filter(f => f)
    };
    
    if (!formData.image) {
        showMessage('メイン画像を選択してください', 'error');
        return;
    }
    
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

// エクスポート/インポート機能
function handleExportData() {
    try {
        // 簡易圧縮（問題のあるLZ圧縮を避ける）
        function simpleCompress(jsonData) {
            // 重複文字列を置換する簡単な圧縮
            let compressed = jsonData;
            
            // よく使われる文字列を短い記号に置換
            const replacements = {
                '"https://images.unsplash.com/photo-': '"U:',
                '?w=800&h=600&fit=crop&crop=center"': '"',
                '"price"': '"p"',
                '"badge"': '"b"',
                '"name"': '"n"',
                '"description"': '"d"',
                '"features"': '"f"',
                '"image"': '"i"',
                '"images"': '"g"',
                '"id"': '"x"',
                '高級店': 'H1',
                '上品': 'H2', 
                '人気': 'H3',
                'ラグジュアリー': 'H4',
                '王室級': 'H5',
                '新店': 'H6',
                'おすすめ': 'H7'
            };
            
            for (const [original, replacement] of Object.entries(replacements)) {
                compressed = compressed.split(original).join(replacement);
            }
            
            return compressed;
        }
        
        // 簡易解凍
        function simpleDecompress(compressed) {
            // 圧縮時の置換を逆に戻す
            const replacements = {
                '"U:': '"https://images.unsplash.com/photo-',
                'H1': '高級店',
                'H2': '上品',
                'H3': '人気', 
                'H4': 'ラグジュアリー',
                'H5': '王室級',
                'H6': '新店',
                'H7': 'おすすめ',
                '"p"': '"price"',
                '"b"': '"badge"',
                '"n"': '"name"',
                '"d"': '"description"',
                '"f"': '"features"',
                '"i"': '"image"',
                '"g"': '"images"',
                '"x"': '"id"'
            };
            
            let decompressed = compressed;
            for (const [replacement, original] of Object.entries(replacements)) {
                decompressed = decompressed.split(replacement).join(original);
            }
            
            // UnsplashのURL修復
            decompressed = decompressed.replace(/"U:([a-zA-Z0-9_-]+)"/g, '"https://images.unsplash.com/photo-$1?w=800&h=600&fit=crop&crop=center"');
            
            return decompressed;
        }
        
        // 超短縮データ形式
        const miniData = {
            v: 1,
            t: Math.floor(Date.now() / 1000),
            d: navigator.userAgent.includes('Mobile') ? 1 : 0,
            c: currentStores.length,
            s: currentStores.map(store => [
                store.id,
                store.name,
                store.image?.includes('unsplash') ? store.image.match(/photo-([a-zA-Z0-9_-]+)/)?.[1] || '' : 
                store.image?.startsWith('data:') ? 'L' : store.image || '',
                (store.images || []).map(img => 
                    img?.includes('unsplash') ? img.match(/photo-([a-zA-Z0-9_-]+)/)?.[1] || '' : 
                    img?.startsWith('data:') ? 'L' : img || ''
                ),
                store.price,
                store.badge,
                store.description || '',
                store.features || []
            ])
        };
        
        console.log('エクスポート中のデータ:');
        console.log('Original currentStores:', currentStores);
        console.log('Mini data format:', miniData);
        console.log('Sample store array:', miniData.s[0]);
        
        // JSON化して簡易圧縮
        const jsonString = JSON.stringify(miniData);
        const compressed = simpleCompress(jsonString);
        
        // UTF-8対応のBase64エンコード
        const utf8Bytes = new TextEncoder().encode(compressed);
        const base64Compressed = btoa(String.fromCharCode(...utf8Bytes));
        
        // 最終エンコード（さらに短縮）
        const finalData = `V3:${base64Compressed}`;
        
        // エクスポートモーダルに表示
        document.getElementById('export-data-text').value = finalData;
        showExportModal();
        
        const compressionRatio = Math.round((1 - finalData.length / jsonString.length) * 100);
        
        // 緊急時用の非圧縮バックアップも生成
        const backupData = JSON.stringify({
            version: "backup",
            timestamp: new Date().toISOString(),
            device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            storeCount: currentStores.length,
            stores: currentStores
        });
        
        console.log('バックアップデータ（非圧縮）:', backupData.substring(0, 100) + '...');
        console.log('バックアップデータ文字数:', backupData.length);
        
        showMessage(`データをエクスポートしました（${finalData.length}文字、${compressionRatio}%圧縮）\n\n※万が一インポートに失敗する場合は、\nブラウザのコンソールから「バックアップデータ」をコピーしてください`, 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showMessage('エクスポートに失敗しました: ' + error.message, 'error');
    }
}

function handleImportData() {
    showImportModal();
}

function handlePasteImport() {
    const textArea = document.getElementById('import-data-text');
    const inputData = textArea.value.trim();
    
    if (!inputData) {
        showMessage('インポートするデータを入力してください', 'error');
        return;
    }
    
    try {
        // 簡易解凍関数
        function simpleDecompress(compressed) {
            const replacements = {
                '"U:': '"https://images.unsplash.com/photo-',
                'H1': '高級店',
                'H2': '上品',
                'H3': '人気', 
                'H4': 'ラグジュアリー',
                'H5': '王室級',
                'H6': '新店',
                'H7': 'おすすめ',
                '"p"': '"price"',
                '"b"': '"badge"',
                '"n"': '"name"',
                '"d"': '"description"',
                '"f"': '"features"',
                '"i"': '"image"',
                '"g"': '"images"',
                '"x"': '"id"'
            };
            
            let decompressed = compressed;
            for (const [replacement, original] of Object.entries(replacements)) {
                decompressed = decompressed.split(replacement).join(original);
            }
            
            // UnsplashのURL修復
            decompressed = decompressed.replace(/"U:([a-zA-Z0-9_-]+)"/g, '"https://images.unsplash.com/photo-$1?w=800&h=600&fit=crop&crop=center"');
            
            return decompressed;
        }
        
        function restoreImageUrl(compressed) {
            if (!compressed) return '';
            if (compressed === 'L') return ''; // ローカル画像
            if (compressed.includes('http')) return compressed;
            return `https://images.unsplash.com/photo-${compressed}?w=800&h=600&fit=crop&crop=center`;
        }
        
        let importData, stores, timestamp, device, storeCount;
        
        // 新しい圧縮形式かチェック（V3形式）
        if (inputData.startsWith('V3:')) {
            const compressedData = inputData.substring(3);
            
            // UTF-8対応のBase64デコード
            const binaryString = atob(compressedData);
            const utf8Bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                utf8Bytes[i] = binaryString.charCodeAt(i);
            }
            const decodedData = new TextDecoder().decode(utf8Bytes);
            const jsonString = simpleDecompress(decodedData);
            importData = JSON.parse(jsonString);
            
            // デバッグ情報を出力
            console.log('V3形式データをデコード中...');
            console.log('Raw importData:', importData);
            console.log('Store array sample:', importData.s[0]);
            
            // 配列形式から復元
            stores = importData.s.map((storeArray, index) => {
                console.log(`Store ${index}:`, storeArray);
                const restored = {
                    id: storeArray[0],
                    name: storeArray[1],
                    image: restoreImageUrl(storeArray[2]),
                    images: (storeArray[3] || []).map(restoreImageUrl),
                    price: storeArray[4],
                    badge: storeArray[5],
                    description: storeArray[6],
                    features: storeArray[7] || []
                };
                console.log(`Restored store ${index}:`, restored);
                return restored;
            });
            
            console.log('Final restored stores:', stores);
            timestamp = importData.t ? new Date(importData.t * 1000).toLocaleString('ja-JP') : '不明';
            device = importData.d === 1 ? '携帯' : 'パソコン';
            storeCount = importData.c || stores.length;
        }
        // V2形式（旧バージョン）
        else if (inputData.startsWith('V2:')) {
            throw new Error('V2形式は非対応です。新しいエクスポートを使用してください。');
        }
        // 旧V1形式（エラーが出やすいのでスキップするか簡単な処理）
        else if (inputData.startsWith('V1:')) {
            throw new Error('V1形式は非対応です。新しいエクスポートを使用してください。');
        }
        else {
            // 旧形式のJSONを試す
            importData = JSON.parse(inputData);
            
            // 中間圧縮形式の場合
            if (importData.s && Array.isArray(importData.s)) {
                stores = importData.s.map(store => ({
                    id: store.i,
                    name: store.n,
                    image: restoreImageUrl(store.img),
                    images: (store.imgs || []).map(restoreImageUrl),
                    price: store.p,
                    badge: store.b,
                    description: store.d,
                    features: store.f || []
                }));
                timestamp = importData.t ? new Date(importData.t * 1000).toLocaleString('ja-JP') : '不明';
                device = importData.d === 'M' ? '携帯' : importData.d === 'D' ? 'パソコン' : '不明';
                storeCount = importData.c || stores.length;
            }
            // 元の形式の場合
            else if (importData.stores && Array.isArray(importData.stores)) {
                stores = importData.stores;
                timestamp = importData.timestamp ? new Date(importData.timestamp).toLocaleString('ja-JP') : '不明';
                device = importData.device === 'mobile' ? '携帯' : importData.device === 'desktop' ? 'パソコン' : '不明';
                storeCount = importData.storeCount || stores.length;
            }
            else {
                throw new Error('無効なデータ形式です');
            }
        }
        
        // 確認ダイアログ
        const confirmMessage = `
${storeCount}件の店舗データをインポートします。
エクスポート日時: ${timestamp}
エクスポート元: ${device}

現在のデータは上書きされます。続行しますか？`;
        
        if (confirm(confirmMessage)) {
            console.log('インポート実行中...');
            console.log('Old currentStores:', currentStores);
            console.log('New stores to import:', stores);
            
            currentStores = stores;
            console.log('Updated currentStores:', currentStores);
            
            saveStores();
            console.log('Data saved to localStorage');
            
            renderStores();
            console.log('Stores re-rendered');
            
            hideImportModal();
            showMessage(`${stores.length}件のデータをインポートしました\n\n3秒後にページを再読み込みします...`, 'success');
            
            // 3秒後にページを再読み込み
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    } catch (error) {
        console.error('Paste import error:', error);
        console.error('Input data preview:', inputData.substring(0, 100) + '...');
        
        // フォールバック：圧縮なしの直接JSONとして試す
        if (inputData.startsWith('{') && inputData.includes('"stores"')) {
            try {
                const fallbackData = JSON.parse(inputData);
                if (fallbackData.stores && Array.isArray(fallbackData.stores)) {
                    console.log('フォールバック：直接JSONとして処理');
                    currentStores = fallbackData.stores;
                    saveStores();
                    renderStores();
                    hideImportModal();
                    showMessage(`フォールバック処理で${fallbackData.stores.length}件のデータをインポートしました\n\n3秒後にページを再読み込みします...`, 'warning');
                    
                    // 3秒後にページを再読み込み
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                    return;
                }
            } catch (fallbackError) {
                console.error('フォールバックも失敗:', fallbackError);
            }
        }
        
        showMessage('インポートに失敗しました: ' + error.message + '\n\nデバッグ情報: ' + inputData.substring(0, 50) + '...', 'error');
    }
}

function handleFileImport() {
    const fileInput = document.getElementById('data-import-input');
    fileInput.onchange = handleImportFile;
    fileInput.click();
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        showMessage('JSONファイルを選択してください', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const inputData = e.target.result;
            
            // V3形式かどうかチェック
            if (inputData.startsWith('V3:') || inputData.startsWith('V2:') || inputData.startsWith('V1:')) {
                // ペーストインポートと同じ処理を呼び出す
                document.getElementById('import-data-text').value = inputData;
                hideImportModal();
                setTimeout(() => {
                    handlePasteImport();
                }, 100);
                return;
            }
            
            const importData = JSON.parse(inputData);
            let stores = [];
            let timestamp = '';
            let device = '';
            let storeCount = 0;
            
            // 画像URLを復元する関数
            function restoreImageUrl(compressed) {
                if (!compressed) return '';
                
                // ローカル画像の場合は空にする（データが省略されているため）
                if (compressed === '[LOCAL]') return '';
                
                // 既に完全URLの場合はそのまま
                if (compressed.includes('http')) return compressed;
                
                // Unsplash写真IDからURLを復元
                return `https://images.unsplash.com/photo-${compressed}?w=800&h=600&fit=crop&crop=center`;
            }
            
            // 新形式（短縮版）の場合
            if (importData.s && Array.isArray(importData.s)) {
                stores = importData.s.map(store => ({
                    id: store.i,
                    name: store.n,
                    image: restoreImageUrl(store.img),
                    images: (store.imgs || []).map(restoreImageUrl),
                    price: store.p,
                    badge: store.b,
                    description: store.d, // 短縮されていても問題なく使用
                    features: store.f || []
                }));
                timestamp = importData.t ? new Date(importData.t * 1000).toLocaleString('ja-JP') : '不明';
                device = importData.d === 'M' ? '携帯' : importData.d === 'D' ? 'パソコン' : '不明';
                storeCount = importData.c || stores.length;
            }
            // 旧形式の場合
            else if (importData.stores && Array.isArray(importData.stores)) {
                stores = importData.stores;
                timestamp = importData.timestamp ? new Date(importData.timestamp).toLocaleString('ja-JP') : '不明';
                device = importData.device === 'mobile' ? '携帯' : importData.device === 'desktop' ? 'パソコン' : '不明';
                storeCount = importData.storeCount || stores.length;
            }
            else {
                throw new Error('無効なデータ形式です');
            }
            
            // 確認ダイアログ
            const confirmMessage = `
${storeCount}件の店舗データをインポートします。
エクスポート日時: ${timestamp}
エクスポート元: ${device}

現在のデータは上書きされます。続行しますか？`;
            
            if (confirm(confirmMessage)) {
                currentStores = stores;
                saveStores();
                renderStores();
                hideImportModal();
                showMessage(`${stores.length}件のデータをインポートしました`, 'success');
            }
        } catch (error) {
            console.error('Import error:', error);
            showMessage('インポートに失敗しました: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        showMessage('ファイルの読み込みに失敗しました', 'error');
    };
    
    reader.readAsText(file);
    
    // ファイル入力をリセット
    event.target.value = '';
}

function copyExportToClipboard() {
    const textArea = document.getElementById('export-data-text');
    textArea.select();
    textArea.setSelectionRange(0, 99999); // モバイル対応
    
    try {
        document.execCommand('copy');
        showMessage('クリップボードにコピーしました', 'success');
    } catch (error) {
        console.error('Copy error:', error);
        showMessage('コピーに失敗しました', 'error');
    }
}

function downloadExportFile() {
    try {
        const textArea = document.getElementById('export-data-text');
        const data = textArea.value;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `nice-stores-data-${timestamp}.json`;
        
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('ファイルをダウンロードしました', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showMessage('ダウンロードに失敗しました: ' + error.message, 'error');
    }
}

function showExportModal() {
    document.getElementById('export-modal').style.display = 'flex';
}

function hideExportModal() {
    document.getElementById('export-modal').style.display = 'none';
}

function showImportModal() {
    document.getElementById('import-modal').style.display = 'flex';
}

function hideImportModal() {
    document.getElementById('import-modal').style.display = 'none';
}

// ファイルアップロード機能
function uploadImage(type, index = 0) {
    currentImageType = type;
    currentGalleryIndex = index;
    
    const fileInput = document.getElementById('image-upload-input');
    fileInput.onchange = handleFileUpload;
    fileInput.click();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください。');
        return;
    }
    
    // ファイルサイズチェック（10MB以下）
    if (file.size > 10 * 1024 * 1024) {
        alert('ファイルサイズは10MB以下にしてください。');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result; // base64データ
        
        // プレビュー表示と選択処理
        if (currentImageType === 'main') {
            setMainImage(imageUrl);
        } else if (currentImageType === 'gallery') {
            currentStoreImages[currentGalleryIndex] = imageUrl;
            updateGalleryPreview();
        }
        
        // 成功メッセージ
        showMessage('画像をアップロードしました', 'success');
    };
    
    reader.onerror = function() {
        showMessage('画像の読み込みに失敗しました', 'error');
    };
    
    reader.readAsDataURL(file);
    
    // ファイル入力をリセット
    event.target.value = '';
}

// グローバル関数として露出（HTMLから呼び出すため）
window.editStore = editStore;
window.deleteStore = deleteStore;
window.exportStoreData = exportStoreData; 
window.hideExportModal = hideExportModal; 
window.hideImportModal = hideImportModal; 