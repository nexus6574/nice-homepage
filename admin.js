// 管理画面JavaScript

// ===================================
// グローバル変数 & 初期設定
// ===================================
const ADMIN_CREDENTIALS = { username: 'admin', password: 'nice2024' };
let currentStores = [];
let editingStoreId = null;
let currentMainImageFile = null;

// ===================================
// 初期化
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabaseAdmin();
    checkAuthStatus();
});

function checkAuthStatus() {
    // このデモでは認証を簡略化し、常に管理者として扱います。
    // 実際のアプリケーションでは、ここにしっかりとした認証ロジックを実装してください。
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-screen').style.display = 'block';
    loadStores();
    setupEventListeners();
}

async function loadStores() {
    showToast('店舗データを読み込んでいます...', 'info');
    const { data, error } = await supabase.from('nice_stores').select('*').order('id');
    if (error) {
        showToast('データの読み込みに失敗しました', 'error');
        console.error('Error loading stores:', error);
        return;
    }
    currentStores = data;
    renderStores();
    showToast('データの読み込みが完了しました', 'success');
}

// ===================================
// イベントリスナー設定
// ===================================
function setupEventListeners() {
    document.getElementById('add-store-btn').addEventListener('click', () => openEditModal(null));
    document.getElementById('store-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('upload-main-image-button').addEventListener('click', () => {
        document.getElementById('main-image-file-input').click();
    });
    document.getElementById('main-image-file-input').addEventListener('change', handleFileSelect);

    const modal = document.getElementById('edit-modal');
    modal.querySelector('.close-btn').addEventListener('click', () => modal.style.display = 'none');
    modal.querySelector('.cancel-btn').addEventListener('click', () => modal.style.display = 'none');
}

// ===================================
// UI描画
// ===================================
function renderStores() {
    const storesList = document.getElementById('stores-list');
    storesList.innerHTML = '';
    if (!currentStores || currentStores.length === 0) {
        storesList.innerHTML = '<p>店舗データがありません。</p>';
        return;
    }
    currentStores.forEach(store => {
        const card = document.createElement('div');
        card.className = 'store-card';
        card.innerHTML = `
            <img src="${store.image || 'nice-storefront.jpg'}" alt="${store.name}" class="store-image">
            <div class="store-info">
                <h3>${store.name}</h3>
                <p>${store.description || ''}</p>
                <div class="store-actions">
                    <button class="edit-btn">編集</button>
                    <button class="delete-btn">削除</button>
                </div>
            </div>
        `;
        card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(store.id));
        card.querySelector('.delete-btn').addEventListener('click', () => deleteStore(store.id, store.name));
        storesList.appendChild(card);
    });
}

function openEditModal(id) {
    editingStoreId = id;
    currentMainImageFile = null;
    const modal = document.getElementById('edit-modal');
    const form = document.getElementById('store-form');
    const title = document.getElementById('modal-title');
    const previewContainer = document.getElementById('main-image-preview-container');

    if (id) {
        const store = currentStores.find(s => s.id === id);
        if (store) {
            title.textContent = '店舗情報編集';
            form.elements['name'].value = store.name;
            form.elements['description'].value = store.description;
            // 他のフォーム要素も同様に設定...
            previewContainer.innerHTML = `<img src="${store.image || 'nice-storefront.jpg'}" style="max-width: 100%; max-height: 200px; object-fit: contain;">`;
        }
    } else {
        title.textContent = '新規店舗追加';
        form.reset();
        previewContainer.innerHTML = '<span class="no-image-text">画像を選択してください</span>';
    }
    modal.style.display = 'flex';
}

// ===================================
// CRUD操作
// ===================================
async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const storeName = form.elements['name'].value;
    let imageUrl = null;

    showToast('保存処理を開始します...', 'info');

    // 1. 画像が新しく選択されているか確認
    if (currentMainImageFile) {
        showToast('画像をアップロード中...', 'info');
        const fileName = `public/${Date.now()}-${currentMainImageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('nice-store-images')
            .upload(fileName, currentMainImageFile);

        if (uploadError) {
            showToast('画像アップロードに失敗しました', 'error');
            console.error('Upload error:', uploadError);
            return;
        }

        const { data: urlData } = supabase.storage.from('nice-store-images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
        showToast('画像アップロード完了', 'success');
    }

    // 2. データベースに保存するデータを準備
    const storeData = {
        name: storeName,
        description: form.elements['description'].value,
        // 他のデータもここに追加
    };

    if (imageUrl) {
        storeData.image = imageUrl;
    }

    // 3. データベースに保存 (新規 or 更新)
    let dbResponse;
    if (editingStoreId) {
        // 更新
        // 既存画像のURLを保持する必要があれば、ここでロジックを追加
        if (!imageUrl) {
            const existingStore = currentStores.find(s => s.id === editingStoreId);
            storeData.image = existingStore.image;
        }
        dbResponse = await supabase.from('nice_stores').update(storeData).eq('id', editingStoreId).select();
    } else {
        // 新規
        dbResponse = await supabase.from('nice_stores').insert([storeData]).select();
    }

    const { data, error } = dbResponse;

    if (error) {
        showToast('データベースの保存に失敗しました', 'error');
        console.error('DB save error:', error);
    } else {
        showToast('保存が完了しました！', 'success');
        document.getElementById('edit-modal').style.display = 'none';
        loadStores(); // リストを再読み込みして最新の状態を表示
    }
}

async function deleteStore(id, name) {
    if (!confirm(`本当に「${name}」を削除しますか？`)) {
        return;
    }
    showToast('削除処理中...', 'info');
    const { error } = await supabase.from('nice_stores').delete().eq('id', id);
    if (error) {
        showToast('削除に失敗しました', 'error');
        console.error('Delete error:', error);
    } else {
        showToast('削除が完了しました', 'success');
        loadStores();
    }
}


// ===================================
// ファイル処理 & ヘルパー関数
// ===================================
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    currentMainImageFile = file; // アップロード用にファイルを保持

    // プレビュー表示
    const previewContainer = document.getElementById('main-image-preview-container');
    const reader = new FileReader();
    reader.onload = (e) => {
        previewContainer.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px; object-fit: contain;">`;
    };
    reader.readAsDataURL(file);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Supabaseクライアントの初期化 (supabase-config.js から呼び出されることを想定)
let supabase = {};
function initializeSupabaseAdmin() {
    try {
        const { createClient } = window.supabase;
        const SUPABASE_URL = 'https://pbwjjqdbrsblidmcbqis.supabase.co';
        // 注意: 本番環境ではService Role Keyをこのように直接記述しないでください。
        // これはデモ目的です。通常は安全なバックエンド経由で扱います。
        const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBid2pxZGJyc2JsaWRtY2JxaXMiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzE2ODgxMDU0LCJleHAiOjIwMzI0NTcwNTR9.P1lMAp2bJ7_UPM3o9PLflzJ2soANMbcW1Tj0i8vA5S4';
        supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
        console.log('Supabase admin client initialized.');
    } catch (e) {
        console.error('Error initializing Supabase admin:', e);
        showToast('Supabaseの初期化に失敗しました', 'error');
    }
} 