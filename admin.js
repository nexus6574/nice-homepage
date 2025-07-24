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
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 管理画面 DOM読み込み完了 - 初期化開始');
    
    try {
        // 🔗 Supabase初期化
        console.log('🔗 Supabase初期化中...');
        await initializeSupabaseAdmin();
        console.log('✅ Supabase初期化完了');
        
        // 📱 UI初期化
        console.log('📱 UI初期化中...');
        checkAuthStatus();
        
        console.log('🎉 管理画面初期化完了');
        
    } catch (error) {
        console.error('❌ 管理画面初期化エラー:', error);
        showToast('管理画面の初期化に失敗しました', 'error');
        
        // エラー時でもUIは表示
        setTimeout(() => {
            checkAuthStatus();
        }, 1000);
    }
});

function checkAuthStatus() {
    console.log('🔐 認証状態確認開始');
    
    // このデモでは認証を簡略化し、常に管理者として扱います。
    // 実際のアプリケーションでは、ここにしっかりとした認証ロジックを実装してください。
    
    try {
        const loginScreen = document.getElementById('login-screen');
        const adminScreen = document.getElementById('admin-screen');
        
        if (loginScreen) {
            loginScreen.style.display = 'none';
            console.log('✅ ログイン画面を非表示');
        }
        
        if (adminScreen) {
            adminScreen.style.display = 'block';
            console.log('✅ 管理画面を表示');
        } else {
            console.error('❌ admin-screen要素が見つかりません');
            showToast('管理画面の要素が見つかりません', 'error');
            return;
        }
        
        // 🔗 イベントリスナーを設定
        setupEventListeners();
        console.log('✅ イベントリスナー設定完了');
        
        // 🚨 緊急修復ボタンのイベントリスナーを設定
        setupEmergencyFixButton();
        console.log('✅ 緊急修復ボタン設定完了');
        
        // 📊 店舗データを読み込み
        console.log('📊 店舗データ読み込み開始');
        setTimeout(() => {
            loadStores();
        }, 500); // 少し遅延させて確実に実行
        
        console.log('🔐 認証状態確認完了');
        
    } catch (error) {
        console.error('❌ 認証状態確認エラー:', error);
        showToast('管理画面の初期化に失敗しました', 'error');
    }
}

async function loadStores() {
    console.log('🔍 管理画面: 店舗データ読み込み開始');
    showToast('店舗データを読み込んでいます...', 'info');
    
    try {
        // 🔗 Supabaseクライアントの状態確認
        if (!supabase || !supabase.from) {
            console.error('❌ Supabaseクライアントが未初期化');
            await initializeSupabaseAdmin();
            if (!supabase || !supabase.from) {
                throw new Error('Supabaseクライアントの初期化に失敗');
            }
        }
        
        console.log('📊 Supabaseからデータを取得中...');
        const { data, error } = await supabase.from('nice_stores').select('*').order('id');
        
        if (error) {
            console.error('❌ Supabaseエラー:', error);
            showToast(`データ読み込みエラー: ${error.message}`, 'error');
            
            // 🔄 フォールバック: ローカルストレージから読み込み
            console.log('🔄 フォールバック: ローカルストレージを確認');
            const localData = localStorage.getItem('nice_stores');
            if (localData) {
                try {
                    const localStores = JSON.parse(localData);
                    console.log('📦 ローカルストレージから読み込み成功:', localStores.length, '件');
                    currentStores = localStores;
                    renderStores();
                    showToast('ローカルデータから読み込みました', 'warning');
                    return;
                } catch (parseError) {
                    console.error('❌ ローカルストレージ解析エラー:', parseError);
                }
            }
            
            // 🏗️ 最終フォールバック: デフォルトデータ
            console.log('🏗️ デフォルトデータを表示');
            currentStores = [];
            renderStores();
            showToast('データが見つかりません。新規作成してください。', 'error');
            return;
        }
        
        // ✅ データ取得成功
        console.log('✅ Supabaseデータ取得成功:', data ? data.length : 0, '件');
        
        if (!data || data.length === 0) {
            console.log('📋 データベースが空です');
            currentStores = [];
            renderStores();
            showToast('店舗データがありません。最初の店舗を追加してください。', 'info');
            return;
        }
        
        // 📊 データの詳細をログ出力
        console.log('📊 取得したデータ:', data);
        data.forEach((store, index) => {
            console.log(`店舗 ${index + 1}:`, {
                id: store.id,
                name: store.name,
                description: store.description ? store.description.substring(0, 50) + '...' : '未設定',
                price: store.price || '未設定',
                badge: store.badge || '未設定'
            });
        });
        
        // 🎯 データをセット
        currentStores = data;
        
        // 💾 ローカルストレージも更新
        localStorage.setItem('nice_stores', JSON.stringify(data));
        console.log('💾 ローカルストレージも更新しました');
        
        // 📱 UIを更新
        renderStores();
        
        showToast(`店舗データを読み込みました (${data.length}件)`, 'success');
        console.log('✅ 管理画面: データ読み込み完了');
        
    } catch (error) {
        console.error('❌ 予期しないエラー:', error);
        showToast('データ読み込みで予期しないエラーが発生しました', 'error');
        
        // エラー発生時もUIを更新
        currentStores = [];
        renderStores();
    }
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
    console.log('🎨 UI描画開始 - currentStores:', currentStores ? currentStores.length : 0, '件');
    
    const storesList = document.getElementById('stores-list');
    if (!storesList) {
        console.error('❌ stores-list要素が見つかりません');
        return;
    }
    
    // 🧹 既存のコンテンツをクリア
    storesList.innerHTML = '';
    
    // 📊 データ状況の詳細チェック
    if (!currentStores) {
        console.log('📋 currentStores が null/undefined');
        storesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>⚠️ データが読み込まれていません</h3>
                <p>ページを再読み込みするか、「📊 データ確認」ボタンを押してください。</p>
                <button onclick="location.reload()" style="margin: 10px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">🔄 ページ再読み込み</button>
                <button onclick="checkSupabaseData()" style="margin: 10px; padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">🚨 緊急デバッグ</button>
            </div>
        `;
        return;
    }
    
    if (currentStores.length === 0) {
        console.log('📋 currentStores が空配列');
        storesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>📝 店舗データがありません</h3>
                <p>最初の店舗を追加してください。</p>
                <button onclick="openEditModal(null)" style="margin: 10px; padding: 15px 30px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">➕ 新規店舗追加</button>
                <button onclick="createTestStore()" style="margin: 10px; padding: 15px 30px; background: #f39c12; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">🧪 テスト店舗作成</button>
            </div>
        `;
        return;
    }
    
    // 🎯 店舗データを描画
    console.log('🎯 店舗カード描画開始:', currentStores.length, '件');
    
    currentStores.forEach((store, index) => {
        console.log(`🏪 店舗カード作成 ${index + 1}:`, store.name);
        
        const card = document.createElement('div');
        card.className = 'store-card';
        
        // 📸 画像URLの処理
        let imageUrl = 'nice-storefront.jpg'; // デフォルト画像
        if (store.image) {
            imageUrl = store.image;
        } else if (store.images && Array.isArray(store.images) && store.images.length > 0) {
            imageUrl = store.images[0];
        }
        
        // 📄 説明文の処理（長すぎる場合は省略）
        let description = store.description || '詳細情報はありません';
        if (description.length > 100) {
            description = description.substring(0, 100) + '...';
        }
        
        // 💰 料金情報の処理
        const price = store.price || '料金要相談';
        
        // 🏷️ バッジ情報の処理
        const badge = store.badge || '';
        
        card.innerHTML = `
            <div style="position: relative;">
                <img src="${imageUrl}" 
                     alt="${store.name}" 
                     class="store-image"
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px 8px 0 0;"
                     onerror="this.src='nice-storefront.jpg'">
                ${badge ? `<div style="position: absolute; top: 10px; right: 10px; background: #e74c3c; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold;">${badge}</div>` : ''}
            </div>
            <div class="store-info" style="padding: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px;">${store.name}</h3>
                <p style="color: #7f8c8d; font-size: 14px; line-height: 1.4; margin: 0 0 10px 0;">${description}</p>
                <div style="color: #e74c3c; font-weight: bold; margin: 0 0 15px 0;">💰 ${price}</div>
                <div class="store-actions" style="display: flex; gap: 10px;">
                    <button class="edit-btn" style="flex: 1; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">✏️ 編集</button>
                    <button class="delete-btn" style="flex: 1; padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">🗑️ 削除</button>
                </div>
            </div>
        `;
        
        // 🔘 イベントリスナーを追加
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                console.log('✏️ 編集ボタンクリック:', store.name);
                openEditModal(store.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                console.log('🗑️ 削除ボタンクリック:', store.name);
                deleteStore(store.id, store.name);
            });
        }
        
        storesList.appendChild(card);
    });
    
    console.log('✅ UI描画完了:', currentStores.length, '件の店舗カードを作成');
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
            form.elements['name'].value = store.name || '';
            form.elements['description'].value = store.description || '';
            form.elements['price'].value = store.price || '';
            form.elements['badge'].value = store.badge || '';
            // 特徴タグの設定（新旧形式対応）
            let featuresArray = [];
            if (Array.isArray(store.features)) {
                featuresArray = store.features;
            } else if (store.features && typeof store.features === 'object' && store.features.features) {
                featuresArray = store.features.features;
            }
            form.elements['features'].value = featuresArray.join(', ');
            
            // 営業時間の設定（複数ソース対応）
            let businessHours = store.business_hours || store.businessHours;
            if (!businessHours && store.features && typeof store.features === 'object' && store.features.businessHours) {
                businessHours = store.features.businessHours;
            }
            
            if (businessHours && businessHours.start && businessHours.end) {
                form.elements['hoursStart'].value = businessHours.start;
                form.elements['hoursEnd'].value = businessHours.end;
            } else {
                form.elements['hoursStart'].value = '20:00';
                form.elements['hoursEnd'].value = '02:00';
            }
            
            // 定休日の設定（複数ソース対応）
            let closedDays = store.closed_days || store.closedDays;
            if (!closedDays && store.features && typeof store.features === 'object' && store.features.closedDays) {
                closedDays = store.features.closedDays;
            }
            const finalClosedDays = closedDays || [];
            
            form.querySelectorAll('input[name="closedDays"]').forEach(checkbox => {
                checkbox.checked = finalClosedDays.includes(checkbox.value);
            });
            
            previewContainer.innerHTML = `<img src="${store.image || 'nice-storefront.jpg'}" style="max-width: 100%; max-height: 200px; object-fit: contain;">`;

            // ギャラリー画像プレビュー
            const existingGallery = store.images || [];
            renderGalleryPreview(existingGallery);
        }
    } else {
        title.textContent = '新規店舗追加';
        form.reset();
        
        // 新規作成時のデフォルト値設定
        form.elements['hoursStart'].value = '20:00';
        form.elements['hoursEnd'].value = '02:00';
        
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
    let imageUrl = null;
    
    // デバッグ: フォームの全要素を確認
    console.log('=== フォーム送信開始 ===');
    console.log('editingStoreId:', editingStoreId);
    for (let i = 0; i < form.elements.length; i++) {
        const element = form.elements[i];
        console.log(`フォーム要素[${i}]:`, {
            name: element.name,
            value: element.value,
            type: element.type
        });
    }

    // 保存時に既存ストアのギャラリーURLを保持
    let existingGalleryUrls = [];
    if (editingStoreId) {
        const existingStore = currentStores.find(s => s.id === editingStoreId);
        existingGalleryUrls = existingStore?.images || [];
    }

    // 1. メイン画像をアップロード（必要な場合）
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
    console.log('=== データ準備開始 ===');
    
    // 個別のフィールド値を安全に取得
    const nameValue = form.querySelector('input[name="name"]').value;
    const descriptionValue = form.querySelector('textarea[name="description"]').value;
    const priceValue = form.querySelector('input[name="price"]').value;
    const badgeValue = form.querySelector('select[name="badge"]').value;
    const featuresValue = form.querySelector('input[name="features"]').value;
    const hoursStartValue = form.querySelector('input[name="hoursStart"]').value;
    const hoursEndValue = form.querySelector('input[name="hoursEnd"]').value;
    
    console.log('取得したフィールド値:', {
        name: nameValue,
        description: descriptionValue,
        price: priceValue,
        badge: badgeValue,
        features: featuresValue,
        hoursStart: hoursStartValue,
        hoursEnd: hoursEndValue
    });
    
    const featuresArray = featuresValue.split(',').map(f => f.trim()).filter(f => f);
    const closedDaysArray = Array.from(form.querySelectorAll('input[name="closedDays"]:checked')).map(cb => cb.value);
    
    // descriptionに営業時間と定休日の情報を追加
    let finalDescription = descriptionValue;
    if (hoursStartValue && hoursEndValue) {
        finalDescription += `\n営業時間: ${hoursStartValue} - ${hoursEndValue}`;
    }
    if (closedDaysArray.length > 0) {
        finalDescription += `\n定休日: ${closedDaysArray.join('、')}`;
    }
    
    // idフィールドを明示的に除外してオブジェクト作成
    const storeData = {};
    storeData.name = nameValue;
    storeData.description = finalDescription; // 営業時間・定休日情報を含む
    storeData.price = priceValue;
    storeData.badge = badgeValue || '';
    
    // featuresを拡張形式で保存（配列＋メタデータ）
    const enhancedFeatures = {
        features: featuresArray, // 従来の特徴タグ配列
        businessHours: (hoursStartValue && hoursEndValue) ? {
            start: hoursStartValue,
            end: hoursEndValue
        } : null,
        closedDays: closedDaysArray.length > 0 ? closedDaysArray : null
    };
    
    storeData.features = enhancedFeatures;
    
    console.log('作成したstoreData:', storeData);
    console.log('storeDataにidフィールドが含まれているか:', 'id' in storeData);
    
    // 営業時間と定休日の詳細ログ
    console.log('🔍 営業時間設定確認:');
    console.log('  - 開始時間:', hoursStartValue);
    console.log('  - 終了時間:', hoursEndValue);
    console.log('🔍 定休日設定確認:');
    console.log('  - 選択された曜日:', closedDaysArray);
    console.log('  - 最終的なdescription:', finalDescription);

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
    
    // 新規作成時は確実にidフィールドを削除
    if (!editingStoreId) {
        delete storeData.id;
        console.log('新規作成: idフィールドを削除しました');
    }
    
    console.log('最終的な送信データ:', storeData);

    // 3. データベースに保存 (新規 or 更新)
    let dbResponse;
    if (editingStoreId) {
        // 更新
        console.log('=== 更新処理 ===');
        console.log('更新ID:', editingStoreId);
        if (!imageUrl) {
            const existingStore = currentStores.find(s => s.id === editingStoreId);
            storeData.image = existingStore.image;
        }
        console.log('更新データ:', storeData);
        dbResponse = await supabase.from('nice_stores').update(storeData).eq('id', editingStoreId).select();
    } else {
        // 新規
        console.log('=== 新規作成処理 ===');
        
        // 最終確認: すべてのidに関するフィールドを削除
        const finalData = { ...storeData };
        delete finalData.id;
        delete finalData.ID;
        delete finalData._id;
        
        // オブジェクトのキーを確認
        const keys = Object.keys(finalData);
        console.log('送信データのキー:', keys);
        console.log('最終送信データ:', finalData);
        
        // idが含まれていないことを確認
        if ('id' in finalData || 'ID' in finalData || '_id' in finalData) {
            console.error('⚠️ まだidフィールドが含まれています!');
            const errorMsg = 'エラー: idフィールドが除去されていません';
            showToast(errorMsg, 'error');
            alert(errorMsg);
            return;
        }
        
        console.log('✅ idフィールドが正常に除去されました');
        dbResponse = await supabase.from('nice_stores').insert([finalData]).select();
    }

    const { data, error } = dbResponse;

    if (error) {
        console.error('DB save error:', error);
        console.error('Attempted to save data:', storeData);
        const errorMsg = `データベースの保存に失敗しました: ${error.message || error.toString()}`;
        showToast(errorMsg, 'error');
        // 確実にエラーメッセージを表示
        alert(errorMsg);
    } else {
        console.log('✅ データベース保存成功:', data);
        showToast('保存が完了しました！', 'success');
        
        // 🚀 フロントエンドとの同期を即座に実行
        await syncWithFrontend(data[0]); // 保存されたデータを同期
        
        document.getElementById('edit-modal').style.display = 'none';
        loadStores(); // リストを再読み込みして最新の状態を表示
        
        // ✨ 成功メッセージでデータ反映を通知
        setTimeout(() => {
            showToast('フロントエンドに反映されました！', 'success');
        }, 1000);
    }
}

// 🚀 フロントエンドとの即座同期機能
async function syncWithFrontend(savedStore) {
    try {
        console.log('🔄 フロントエンドとの同期開始:', savedStore);
        
        // 1. 全ての店舗データを再取得
        const { data: allStores, error } = await supabase.from('nice_stores').select('*').order('id');
        
        if (error) {
            console.error('❌ 同期用データ取得エラー:', error);
            return;
        }
        
        // 2. データの整形（IDの確保など）
        const processedStores = allStores.map((store, index) => {
            if (!store.id || store.id === '' || store.id === null || store.id === undefined) {
                store.id = index + 1;
            }
            
            // 数値IDに統一
            const numericId = parseInt(store.id);
            if (!isNaN(numericId)) {
                store.id = numericId;
            }
            
            return store;
        });
        
        // 3. ローカルストレージを強制更新（フロントエンドが参照するデータ）
        localStorage.setItem('nice_stores', JSON.stringify(processedStores));
        
        console.log('✅ ローカルストレージを更新:', processedStores.length, '件');
        console.log('📊 同期されたデータ:', processedStores.map(s => ({ id: s.id, name: s.name })));
        
        // 4. 別のタブやウィンドウに通知（StorageEventで他のページに反映）
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'nice_stores',
            newValue: JSON.stringify(processedStores),
            storageArea: localStorage
        }));
        
        // 5. 管理画面のプレビューリンクを新しいタブで開く提案
        const shouldOpenPreview = confirm(`店舗データが保存されました！\n\n「${savedStore.name}」が正常に反映されたか確認しますか？\n\n（新しいタブで店舗一覧を開きます）`);
        
        if (shouldOpenPreview) {
            window.open('cabaret-list.html', '_blank');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ フロントエンド同期エラー:', error);
        showToast('同期エラーが発生しました', 'error');
        return false;
    }
}

// 📊 リアルタイムデータ確認機能（強化版）
async function checkSupabaseData() {
    try {
        console.log('📊 Supabaseデータ確認中...');
        showToast('データを確認中...', 'info');
        
        const { data, error } = await supabase.from('nice_stores').select('*').order('id');
        
        if (error) {
            console.error('データ確認エラー:', error);
            showToast(`エラー: ${error.message}`, 'error');
            return;
        }
        
        console.log('📊 現在のSupabaseデータ:', data);
        
        // 📱 緊急デバッグモードを開始
        showEmergencyDebugPanel(data);
        
        // ローカルストレージも同時に更新
        if (data.length > 0) {
            localStorage.setItem('nice_stores', JSON.stringify(data));
            showToast('ローカルストレージも更新しました', 'success');
        }
        
        showToast(`確認完了: ${data.length}件の店舗データ`, 'success');
        
    } catch (error) {
        console.error('データ確認で予期しないエラー:', error);
        showToast('データ確認に失敗しました', 'error');
    }
}

// 🚨 緊急デバッグパネル表示
function showEmergencyDebugPanel(supabaseData) {
    // 既存のパネルを削除
    const existingPanel = document.getElementById('emergency-debug-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    const panel = document.createElement('div');
    panel.id = 'emergency-debug-panel';
    panel.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        padding: 20px;
        border-radius: 15px;
        z-index: 20000;
        font-family: monospace;
        font-size: 12px;
        line-height: 1.4;
        max-height: 80vh;
        overflow-y: auto;
        border: 2px solid #e74c3c;
    `;
    
    // ローカルストレージの状況を確認
    const localData = localStorage.getItem('nice_stores');
    let localStores = [];
    try {
        localStores = localData ? JSON.parse(localData) : [];
    } catch (error) {
        console.error('ローカルストレージパースエラー:', error);
    }
    
    let debugInfo = `🚨 緊急デバッグパネル\n${'='.repeat(60)}\n\n`;
    
    // Supabaseデータ
    debugInfo += `📊 Supabaseデータ (${supabaseData.length}件):\n`;
    if (supabaseData.length > 0) {
        supabaseData.forEach((store, index) => {
            debugInfo += `  ${index + 1}. ${store.name} (ID: ${store.id})\n`;
            debugInfo += `     料金: ${store.price || '未設定'}\n`;
            debugInfo += `     バッジ: ${store.badge || '未設定'}\n`;
            debugInfo += `     作成日: ${store.created_at || '未設定'}\n`;
            if (store.images) {
                debugInfo += `     画像: ${store.images.length}枚\n`;
            }
            debugInfo += `\n`;
        });
    } else {
        debugInfo += `  ❌ Supabaseにデータがありません！\n\n`;
    }
    
    // ローカルストレージデータ
    debugInfo += `💾 ローカルストレージ (${localStores.length}件):\n`;
    if (localStores.length > 0) {
        localStores.forEach((store, index) => {
            debugInfo += `  ${index + 1}. ${store.name} (ID: ${store.id})\n`;
        });
    } else {
        debugInfo += `  ❌ ローカルストレージが空です！\n`;
    }
    
    debugInfo += `\n🔍 データ整合性チェック:\n`;
    debugInfo += `  - Supabase: ${supabaseData.length}件\n`;
    debugInfo += `  - ローカル: ${localStores.length}件\n`;
    debugInfo += `  - 同期状態: ${supabaseData.length === localStores.length ? '✅ 一致' : '❌ 不一致'}\n\n`;
    
    debugInfo += `🛠️ 解決アクション:\n`;
    debugInfo += `1. 「強制同期実行」ボタンでデータ同期\n`;
    debugInfo += `2. 「テスト店舗作成」で動作確認\n`;
    debugInfo += `3. 「フロント確認」で店舗一覧を確認\n`;
    debugInfo += `4. 問題が続く場合は「完全リセット」を実行\n`;
    
    panel.innerHTML = `
        <div style="white-space: pre-wrap; margin-bottom: 20px;">${debugInfo}</div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="emergencySync()" style="background: #27ae60; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">🔄 強制同期実行</button>
            <button onclick="createTestStore()" style="background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">🧪 テスト店舗作成</button>
            <button onclick="openFrontendCheck()" style="background: #f39c12; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">🔍 フロント確認</button>
            <button onclick="emergencyReset()" style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">⚠️ 完全リセット</button>
            <button onclick="closeEmergencyPanel()" style="background: #95a5a6; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">❌ 閉じる</button>
        </div>
    `;
    
    document.body.appendChild(panel);
}

// 🚨 緊急同期実行
async function emergencySync() {
    try {
        showToast('🚨 緊急同期を実行中...', 'info');
        
        // 1. Supabaseから最新データを取得
        const { data: latestStores, error } = await supabase.from('nice_stores').select('*').order('id');
        
        if (error) {
            throw error;
        }
        
        console.log('🚨 緊急同期: Supabaseデータ取得成功', latestStores);
        
        // 2. データ処理（ID確保など）
        const processedStores = latestStores.map((store, index) => {
            if (!store.id) {
                store.id = index + 1;
            }
            return store;
        });
        
        // 3. ローカルストレージを強制更新
        localStorage.setItem('nice_stores', JSON.stringify(processedStores));
        
        // 4. 複数の方法でフロントエンドに通知
        
        // 方法1: StorageEvent
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'nice_stores',
            newValue: JSON.stringify(processedStores),
            storageArea: localStorage
        }));
        
        // 方法2: カスタムイベント
        window.dispatchEvent(new CustomEvent('localDataUpdate', {
            detail: { stores: processedStores }
        }));
        
        // 方法3: 新しいタブで強制確認
        const confirmOpen = confirm(`🚨 緊急同期完了！\n\n同期されたデータ: ${processedStores.length}件\n\n店舗一覧を新しいタブで開いて確認しますか？\n（推奨: 必ず確認してください）`);
        
        if (confirmOpen) {
            // 複数のページを開いて確認
            window.open('cabaret-list.html?debug=1&timestamp=' + Date.now(), '_blank');
            setTimeout(() => {
                window.open('index.html?debug=1&timestamp=' + Date.now(), '_blank');
            }, 1000);
        }
        
        showToast('🚨 緊急同期完了！', 'success');
        
        // デバッグパネルを更新
        setTimeout(() => {
            checkSupabaseData();
        }, 2000);
        
    } catch (error) {
        console.error('🚨 緊急同期エラー:', error);
        showToast('緊急同期に失敗しました', 'error');
        alert(`緊急同期エラー: ${error.message}\n\n管理者に連絡してください。`);
    }
}

// 🧪 テスト店舗作成
async function createTestStore() {
    try {
        showToast('🧪 テスト店舗を作成中...', 'info');
        
        const testStore = {
            name: `テスト店舗_${Date.now()}`,
            description: 'これは動作確認用のテスト店舗です。',
            price: '1,000円〜',
            badge: 'テスト',
            features: {
                features: ['テスト機能', '動作確認'],
                businessHours: { start: '20:00', end: '02:00' },
                closedDays: ['月曜日']
            },
            image: 'nice-storefront.jpg'
        };
        
        console.log('🧪 テスト店舗データ:', testStore);
        
        const { data, error } = await supabase.from('nice_stores').insert([testStore]).select();
        
        if (error) {
            throw error;
        }
        
        console.log('🧪 テスト店舗作成成功:', data);
        showToast('🧪 テスト店舗作成成功！', 'success');
        
        // 即座に同期
        await emergencySync();
        
        // 店舗リストを更新
        loadStores();
        
    } catch (error) {
        console.error('🧪 テスト店舗作成エラー:', error);
        showToast('テスト店舗作成に失敗しました', 'error');
        alert(`テスト店舗作成エラー: ${error.message}`);
    }
}

// 🔍 フロントエンド確認
function openFrontendCheck() {
    // タイムスタンプを付けてキャッシュを回避
    const timestamp = Date.now();
    
    const urls = [
        `cabaret-list.html?emergency=1&t=${timestamp}`,
        `index.html?emergency=1&t=${timestamp}`,
        `store-detail.html?id=1&emergency=1&t=${timestamp}`
    ];
    
    const confirmOpen = confirm(`🔍 フロントエンド確認\n\n以下のページを新しいタブで開きます：\n1. 店舗一覧ページ\n2. メインページ\n3. 店舗詳細ページ\n\n開いて確認しますか？`);
    
    if (confirmOpen) {
        urls.forEach((url, index) => {
            setTimeout(() => {
                window.open(url, '_blank');
            }, index * 500);
        });
    }
}

// ⚠️ 完全リセット
async function emergencyReset() {
    const confirmReset = confirm(`⚠️ 完全リセット\n\nこの操作により以下が実行されます：\n1. 全ての店舗データを削除\n2. ローカルストレージをクリア\n3. デフォルトデータを再作成\n\n本当に実行しますか？\n\n※この操作は取り消せません`);
    
    if (!confirmReset) return;
    
    const finalConfirm = confirm('⚠️ 最終確認\n\n本当に全てのデータを削除してリセットしますか？');
    
    if (!finalConfirm) return;
    
    try {
        showToast('⚠️ 完全リセットを実行中...', 'info');
        
        // 1. Supabaseの全データを削除
        const { error: deleteError } = await supabase.from('nice_stores').delete().neq('id', 0);
        
        if (deleteError) {
            console.error('削除エラー:', deleteError);
        }
        
        // 2. ローカルストレージをクリア
        localStorage.removeItem('nice_stores');
        
        // 3. デフォルトデータを作成
        const defaultStores = [
            {
                name: 'Premium Club TOKYO',
                description: '最高級のサービスと洗練された空間で特別な時間をお過ごしください。\n営業時間: 20:00 - 02:00\n定休日: 日曜日',
                price: '1,500円〜',
                badge: '人気No.1',
                features: {
                    features: ['VIP個室あり', '送迎サービス', 'カラオケ完備', '高級シャンパン'],
                    businessHours: { start: '20:00', end: '02:00' },
                    closedDays: ['日曜日']
                },
                image: 'nice-storefront.jpg'
            },
            {
                name: 'Club Elegance',
                description: 'エレガントで落ち着いた雰囲気の中で、上品なキャストがお客様を優雅にお迎えいたします。\n営業時間: 19:30 - 01:30\n定休日: 月曜日',
                price: '1,200円〜',
                badge: '上品さNo.1',
                features: {
                    features: ['落ち着いた雰囲気', '上品なキャスト', '個室完備', 'ワイン豊富'],
                    businessHours: { start: '19:30', end: '01:30' },
                    closedDays: ['月曜日']
                },
                image: 'nice-storefront.jpg'
            }
        ];
        
        const { data, error } = await supabase.from('nice_stores').insert(defaultStores).select();
        
        if (error) {
            throw error;
        }
        
        console.log('⚠️ デフォルトデータ作成成功:', data);
        
        // 4. 同期実行
        await emergencySync();
        
        showToast('⚠️ 完全リセット完了！', 'success');
        
        // 管理画面を更新
        loadStores();
        
        alert('✅ 完全リセットが完了しました！\n\nデフォルトの店舗データが作成されました。\n店舗一覧ページで確認してください。');
        
    } catch (error) {
        console.error('⚠️ 完全リセットエラー:', error);
        showToast('完全リセットに失敗しました', 'error');
        alert(`完全リセットエラー: ${error.message}`);
    }
}

// 緊急パネルを閉じる
function closeEmergencyPanel() {
    const panel = document.getElementById('emergency-debug-panel');
    if (panel) {
        panel.remove();
    }
}

// 🚨 シンプル緊急修復ボタンのセットアップ
function setupEmergencyFixButton() {
    const emergencyBtn = document.getElementById('emergency-fix-btn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', performEmergencyFix);
        console.log('✅ 緊急修復ボタンのクリックイベント設定完了');
    } else {
        console.error('❌ 緊急修復ボタンが見つかりません');
    }
}

// 🚨 緊急修復実行（シンプル版）
async function performEmergencyFix() {
    console.log('🚨 緊急修復開始');
    
    try {
        // ボタンを無効化
        const btn = document.getElementById('emergency-fix-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '🔄 修復中...';
            btn.style.background = '#95a5a6';
        }
        
        showToast('🚨 緊急修復を開始します...', 'info');
        
        // ステップ1: Supabaseからデータを強制取得
        console.log('📊 ステップ1: Supabaseデータ取得');
        showToast('📊 データベースから情報を取得中...', 'info');
        
        let stores = [];
        try {
            if (!supabase || !supabase.from) {
                console.log('🔗 Supabase再初期化');
                await initializeSupabaseAdmin();
            }
            
            const { data, error } = await supabase.from('nice_stores').select('*').order('id');
            
            if (error) {
                throw error;
            }
            
            stores = data || [];
            console.log('✅ Supabaseデータ取得成功:', stores.length, '件');
            
        } catch (error) {
            console.error('❌ Supabaseエラー:', error);
            showToast('⚠️ データベース接続エラー - ローカルデータを確認中...', 'warning');
            
            // フォールバック: ローカルストレージ
            const localData = localStorage.getItem('nice_stores');
            if (localData) {
                stores = JSON.parse(localData);
                console.log('📦 ローカルデータ使用:', stores.length, '件');
            }
        }
        
        // ステップ2: データが無い場合はテスト店舗を作成
        if (stores.length === 0) {
            console.log('🏗️ ステップ2: テスト店舗作成');
            showToast('📝 テスト店舗を作成しています...', 'info');
            
            const testStore = {
                name: 'テスト店舗（動作確認用）',
                description: 'これは管理画面の動作確認用に作成されたテスト店舗です。\n営業時間: 20:00 - 02:00\n定休日: 月曜日',
                price: '1,000円〜',
                badge: '動作確認',
                features: {
                    features: ['動作確認', 'テスト機能'],
                    businessHours: { start: '20:00', end: '02:00' },
                    closedDays: ['月曜日']
                },
                image: 'nice-storefront.jpg'
            };
            
            try {
                const { data, error } = await supabase.from('nice_stores').insert([testStore]).select();
                if (error) {
                    throw error;
                }
                stores = data;
                console.log('✅ テスト店舗作成成功');
                showToast('✅ テスト店舗を作成しました', 'success');
            } catch (error) {
                console.error('❌ テスト店舗作成エラー:', error);
                // それでもダメな場合はローカルのみで動作
                stores = [testStore];
                showToast('⚠️ ローカルモードで動作します', 'warning');
            }
        }
        
        // ステップ3: 管理画面を更新
        console.log('🎨 ステップ3: 管理画面更新');
        showToast('🎨 画面を更新しています...', 'info');
        
        currentStores = stores;
        
        // ローカルストレージも更新
        localStorage.setItem('nice_stores', JSON.stringify(stores));
        
        // UI更新
        renderStores();
        
        // ステップ4: フロントエンドと同期
        console.log('🔄 ステップ4: フロントエンド同期');
        showToast('🔄 フロントエンドと同期中...', 'info');
        
        // StorageEventで他のタブに通知
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'nice_stores',
            newValue: JSON.stringify(stores),
            storageArea: localStorage
        }));
        
        // カスタムイベントで同期
        window.dispatchEvent(new CustomEvent('localDataUpdate', {
            detail: { stores: stores }
        }));
        
        // ステップ5: 完了
        console.log('✅ 緊急修復完了');
        showToast(`🎉 修復完了！ ${stores.length}件の店舗データが表示されました`, 'success');
        
        // 成功メッセージ表示
        setTimeout(() => {
            const confirmOpen = confirm(`🎉 データ表示修復が完了しました！\n\n修復されたデータ: ${stores.length}件\n\n✅ 管理画面に店舗が表示されているか確認してください\n✅ 店舗一覧ページも確認しますか？\n\n「OK」を押すと店舗一覧ページが開きます。`);
            
            if (confirmOpen) {
                window.open('cabaret-list.html?emergency=1&t=' + Date.now(), '_blank');
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ 緊急修復で予期しないエラー:', error);
        showToast('❌ 修復に失敗しました。ページを再読み込みしてください。', 'error');
        
        setTimeout(() => {
            alert(`緊急修復エラー: ${error.message}\n\nページを再読み込みして再試行してください。`);
        }, 1000);
        
    } finally {
        // ボタンを再有効化
        const btn = document.getElementById('emergency-fix-btn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = '🚨 データ表示修復';
            btn.style.background = '#e74c3c';
        }
    }
}

// 🔄 強制同期ボタン機能
async function forceSyncToFrontend() {
    try {
        showToast('フロントエンドとの強制同期中...', 'info');
        
        const { data: allStores, error } = await supabase.from('nice_stores').select('*').order('id');
        
        if (error) {
            throw error;
        }
        
        // データ処理
        const processedStores = allStores.map((store, index) => {
            if (!store.id) store.id = index + 1;
            const numericId = parseInt(store.id);
            if (!isNaN(numericId)) store.id = numericId;
            return store;
        });
        
        // 強制更新
        localStorage.setItem('nice_stores', JSON.stringify(processedStores));
        
        console.log('🔄 強制同期完了:', processedStores.length, '件');
        showToast(`強制同期完了: ${processedStores.length}件`, 'success');
        
        // 確認ダイアログ
        const confirmOpen = confirm(`強制同期が完了しました！\n\n同期されたデータ: ${processedStores.length}件\n\n店舗一覧ページを新しいタブで開いて確認しますか？`);
        
        if (confirmOpen) {
            window.open('cabaret-list.html', '_blank');
        }
        
    } catch (error) {
        console.error('❌ 強制同期エラー:', error);
        showToast('強制同期に失敗しました', 'error');
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

// 削除: 重複するshowToast関数

// Supabaseクライアントの初期化 (supabase-config.js から呼び出されることを想定)
let supabase = {};
let isSupabaseAdminInitialized = false;

async function initializeSupabaseAdmin() {
    console.log('🔗 Supabase管理クライアント初期化開始');
    
    try {
        // window.supabaseが読み込まれるまで待機
        let attempts = 0;
        while (!window.supabase && attempts < 10) {
            console.log(`⏳ Supabaseライブラリの読み込み待機中... (${attempts + 1}/10)`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (!window.supabase) {
            throw new Error('Supabaseライブラリが読み込まれていません');
        }
        
        const { createClient } = window.supabase;
        if (!createClient) {
            throw new Error('createClient関数が見つかりません');
        }
        
        const SUPABASE_URL = 'https://rkjclmiievzgqkfgkhfl.supabase.co';
        // 注意: 本番環境ではService Role Keyをこのように直接記述しないでください。
        // これはデモ目的です。通常は安全なバックエンド経由で扱います。
        const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJramNsbWlpZXZ6Z3FrZmdraGZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ1ODUxNCwiZXhwIjoyMDY4MDM0NTE0fQ.ObHx2wCXaw6cWCaRTTmu5UgDp62da1P2CFtigpKIEII';
        
        console.log('🔗 Supabaseクライアント作成中...');
        supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
        
        // 接続テスト
        console.log('🧪 Supabase接続テスト中...');
        const { data, error } = await supabase.from('nice_stores').select('count', { count: 'exact' });
        
        if (error) {
            console.warn('⚠️ 接続テストでエラー（テーブルが空の可能性）:', error);
            // テーブルが空でもクライアントは正常なので続行
        } else {
            console.log('✅ Supabase接続テスト成功:', data);
        }
        
        isSupabaseAdminInitialized = true;
        console.log('✅ Supabase管理クライアント初期化完了');
        
        return supabase;
        
    } catch (error) {
        console.error('❌ Supabase管理クライアント初期化エラー:', error);
        showToast(`Supabaseの初期化に失敗しました: ${error.message}`, 'error');
        isSupabaseAdminInitialized = false;
        throw error;
    }
}

// ===================================
// 管理機能
// ===================================

// デバッグ: テーブル構造確認
async function checkTableStructure() {
    try {
        console.log('🔍 テーブル構造確認中...');
        
        // まず空の挿入を試してエラーメッセージからカラム情報を取得
        const { error } = await supabase.from('nice_stores').insert([{}]);
        if (error) {
            console.log('テーブル構造エラー:', error);
            showToast(`テーブル構造: ${error.message}`, 'info');
        }
        
        // 既存データの構造確認
        const { data: existingData, error: selectError } = await supabase
            .from('nice_stores')
            .select('*')
            .limit(1);
            
        if (selectError) {
            console.error('データ取得エラー:', selectError);
        } else if (existingData && existingData.length > 0) {
            console.log('既存データの構造:', Object.keys(existingData[0]));
            showToast(`既存データカラム: ${Object.keys(existingData[0]).join(', ')}`, 'info');
        }
        
    } catch (e) {
        console.error('構造確認エラー:', e);
        showToast(`構造確認エラー: ${e.message}`, 'error');
    }
}

// デバッグ: 最小限データでテスト保存
async function testMinimalSave() {
    try {
        console.log('🧪 最小限データでテスト保存中...');
        showToast('最小限データでテスト保存中...', 'info');
        
        const minimalData = {
            name: 'テスト店舗',
            description: 'テスト説明'
        };
        
        console.log('保存データ:', minimalData);
        
        const { data, error } = await supabase
            .from('nice_stores')
            .insert([minimalData])
            .select();
            
        if (error) {
            console.error('最小限テスト保存エラー:', error);
            showToast(`最小限テスト失敗: ${error.message}`, 'error');
        } else {
            console.log('最小限テスト保存成功:', data);
            showToast('最小限テスト保存成功！', 'success');
            loadStores();
        }
        
    } catch (e) {
        console.error('テスト保存例外:', e);
        showToast(`テスト保存例外: ${e.message}`, 'error');
    }
}

// Supabaseデータ確認機能
async function checkSupabaseData() {
    showToast('Supabaseデータを確認中...', 'info');
    
    try {
        // 1. テーブル存在確認とデータ詳細表示
        const { data: stores, error: storesError } = await supabase
            .from('nice_stores')
            .select('*')
            .order('id');
        
        if (storesError) {
            showToast(`データベースエラー: ${storesError.message}`, 'error');
            return;
        }
        
        // 詳細データログ表示
        console.log('🔍 Supabaseから取得した全店舗データ:');
        stores.forEach((store, index) => {
            console.log(`店舗${index + 1}: ${store.name}`);
            console.log('  - business_hours:', store.business_hours);
            console.log('  - closed_days:', store.closed_days);
            console.log('  - description:', store.description);
            console.log('  - features:', store.features);
            console.log('---');
        });
        
        // 2. Storage確認
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        const hasStorageBucket = buckets && buckets.find(b => b.name === 'nice-store-images');
        
        // 3. 結果表示
        const storeCount = stores ? stores.length : 0;
        const storageStatus = hasStorageBucket ? '✅ 正常' : '❌ 未作成';
        
        showToast(`📊 データ確認完了`, 'success');
        
        // 詳細結果をダイアログ表示
        alert(`🔍 Supabaseデータ確認結果\n\n` +
              `📊 店舗データ: ${storeCount}件\n` +
              `🗂️ Storageバケット: ${storageStatus}\n` +
              `🔗 プロジェクトURL: rkjclmiievzgqkfgkhfl.supabase.co\n\n` +
              `${storeCount > 0 ? '店舗一覧:\n' + stores.map(s => `・${s.name}`).join('\n') : '店舗データはありません。'}`);
        
    } catch (error) {
        showToast(`確認中にエラーが発生: ${error.message}`, 'error');
        console.error('Error checking Supabase data:', error);
    }
}

// トースト通知表示
function showToast(message, type = 'info') {
    // 既存のトーストを削除
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 新しいトーストを作成
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 999999999;
        font-size: 14px;
        max-width: 400px;
        word-wrap: break-word;
        line-height: 1.4;
        font-weight: bold;
        border: 2px solid white;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 3秒後に自動削除
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
} 