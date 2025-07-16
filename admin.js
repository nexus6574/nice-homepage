// 管理画面JavaScript

// ===================================
// グローバル変数 & 初期設定
// ===================================
const ADMIN_CREDENTIALS = { username: 'admin', password: 'nice2024' };
let currentStores = [];
let editingStoreId = null;
let currentMainImageFile = null;
let galleryFiles = Array(5).fill(null); // ギャラリー用一時ファイル保持

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
// ギャラリー表示・イベント補助関数
// ===================================
function renderGalleryPreview(existingUrls = []) {
    const container = document.getElementById('gallery-preview');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const url = existingUrls[i] || null;

        const slot = document.createElement('div');
        slot.className = 'gallery-slot';

        const img = document.createElement('img');
        img.id = `gallery-img-${i}`;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '120px';
        img.style.objectFit = 'cover';
        img.src = url || 'nice-storefront.jpg';
        slot.appendChild(img);

        const uploadBtn = document.createElement('button');
        uploadBtn.type = 'button';
        uploadBtn.textContent = 'アップロード';
        uploadBtn.className = 'gallery-upload-btn';
        uploadBtn.dataset.index = i;
        slot.appendChild(uploadBtn);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.dataset.index = i;
        fileInput.id = `gallery-file-input-${i}`;
        fileInput.addEventListener('change', handleGalleryFileSelect);
        slot.appendChild(fileInput);

        container.appendChild(slot);
    }

    // ボタンクリックで対応する file input をトリガー
    container.querySelectorAll('.gallery-upload-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.dataset.index;
            container.querySelector(`#gallery-file-input-${idx}`).click();
        });
    });
}

function handleGalleryFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const idx = parseInt(e.target.dataset.index, 10);
    galleryFiles[idx] = file;

    // プレビュー更新
    const reader = new FileReader();
    reader.onload = (ev) => {
        const imgEl = document.getElementById(`gallery-img-${idx}`);
        if (imgEl) imgEl.src = ev.target.result;
    };
    reader.readAsDataURL(file);
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

    // ギャラリーのプレビュー生成は openEditModal 内で都度呼び出します。
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
    galleryFiles = Array(5).fill(null); // ギャラリー選択をリセット
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

            // ギャラリー画像プレビュー
            const existingGallery = store.images || [];
            renderGalleryPreview(existingGallery);
        }
    } else {
        title.textContent = '新規店舗追加';
        form.reset();
        previewContainer.innerHTML = '<span class="no-image-text">画像を選択してください</span>';

        renderGalleryPreview([]); // 空のギャラリー
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

    // 保存時に既存ストアのギャラリーURLを保持
    let existingGalleryUrls = [];
    if (editingStoreId) {
        const existingStore = currentStores.find(s => s.id === editingStoreId);
        existingGalleryUrls = existingStore?.images || [];
    }

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

    // 2-1. ギャラリー画像のアップロード処理
    let galleryUrls = [...existingGalleryUrls];
    for (let i = 0; i < 5; i++) {
        const gFile = galleryFiles[i];
        if (gFile) {
            showToast(`ギャラリー画像 ${i + 1} をアップロード中...`, 'info');
            const gFileName = `public/gallery/${Date.now()}-${i}-${gFile.name}`;
            const { data: gUploadData, error: gUploadErr } = await supabase.storage
                .from('nice-store-images')
                .upload(gFileName, gFile);
            if (gUploadErr) {
                showToast(`ギャラリー画像 ${i + 1} のアップロードに失敗`, 'error');
                console.error('Gallery upload error:', gUploadErr);
                return; // 1 枚でも失敗したら中断
            }
            const { data: gUrlData } = supabase.storage.from('nice-store-images').getPublicUrl(gFileName);
            galleryUrls[i] = gUrlData.publicUrl;
        }
    }

    // 3. ギャラリー URL をデータに反映
    if (galleryUrls.length > 0) {
        // null / undefined を除いて配列にする
        storeData.images = galleryUrls.filter(Boolean);
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