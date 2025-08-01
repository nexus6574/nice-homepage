// 店舗詳細ページのJavaScript

// ギャラリースライダーの状態管理
let gallerySliderState = {
    currentSlide: 0,
    totalSlides: 0,
    autoSlideInterval: null,
    isTransitioning: false,
    isInitialized: false
};

// モバイル向けデータ読み込み状態
let mobileLoadState = {
    retryCount: 0,
    maxRetries: 3,
    isLoading: false
};

// グローバル変数
let currentStore = null;
let supabaseClient = null;
let isEditMode = false;

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 店舗詳細ページ初期化開始');
    
    initializeStoreDetailPage();
    initializeMobileMenu();
    
    // すべての環境でデバッグボタンを表示（デスクトップ版も含む）
    console.log('🔧 デバッグボタン追加中...');
    addUniversalDebugButton();
    
    // パソコン版での緊急修復機能を追加
    if (window.innerWidth > 768) {
        console.log('🖥️ パソコン版：緊急修復機能を初期化');
        addDesktopEmergencyFix();
    }
    
    // モバイル版での詳細初期化
    if (window.innerWidth <= 768) {
        console.log('📱 店舗詳細ページ: モバイル版初期化');
        initializeMobileStoreDetail();
        
        // モバイル版専用の最終チェック
        setTimeout(() => {
            performFinalMobileCheck();
        }, 2000);
    } else {
        console.log('🖥️ 店舗詳細ページ: デスクトップ版初期化');
        
        // デスクトップ版での最終チェック
        setTimeout(() => {
            performFinalDesktopCheck();
        }, 2000);
    }
    
    // 店舗詳細読み込み
    loadStoreDetail();
});

// すべての環境用デバッグボタンを追加
function addUniversalDebugButton() {
    const debugBtn = document.createElement('button');
    debugBtn.innerHTML = window.innerWidth <= 768 ? '📱 Debug' : '🖥️ Debug';
    debugBtn.style.cssText = `
        position: fixed;
        bottom: ${window.innerWidth <= 768 ? '80px' : '20px'};
        right: 20px;
        z-index: 9999;
        background: ${window.innerWidth <= 768 ? '#e74c3c' : '#3498db'};
        color: white;
        border: none;
        padding: 12px 18px;
        border-radius: 50px;
        font-size: 13px;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    debugBtn.addEventListener('click', showUniversalDebugInfo);
    document.body.appendChild(debugBtn);
    
    // 10秒後に半透明化
    setTimeout(() => {
        debugBtn.style.opacity = '0.5';
        debugBtn.style.transform = 'scale(0.9)';
    }, 10000);
}

// デスクトップ版最終チェック
function performFinalDesktopCheck() {
    console.log('🖥️ デスクトップ版最終チェック開始');
    
    const currentUrl = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('id');
    
    console.log('🖥️ 最終チェック情報:', {
        currentUrl: currentUrl,
        storeId: storeId,
        hasStoreContent: !!document.getElementById('store-content'),
        hasErrorContent: !!document.getElementById('error-content'),
        isLoading: document.getElementById('loading').style.display !== 'none'
    });
    
    // エラー状態をチェック
    const errorContent = document.getElementById('error-content');
    if (errorContent && errorContent.style.display !== 'none') {
        console.log('🖥️ エラー状態を検出 - デスクトップ版専用処理');
        showDesktopErrorHelp();
    }
    
    // 成功状態をチェック
    const storeContent = document.getElementById('store-content');
    if (storeContent && storeContent.style.display !== 'none') {
        console.log('🖥️ ✅ 店舗詳細が正常に表示されています');
        const storeName = document.getElementById('store-name')?.textContent || 'Unknown';
        console.log(`🖥️ 表示中の店舗: ${storeName}`);
    }
}

// デスクトップ版エラーヘルプ
function showDesktopErrorHelp() {
    const helpDiv = document.createElement('div');
    helpDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(241, 196, 15, 0.95);
        color: #2c3e50;
        padding: 20px;
        border-radius: 15px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
        max-width: 350px;
    `;
    
    helpDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 15px;">🖥️ デスクトップ版トラブルシューティング</div>
        <div style="margin-bottom: 10px;">• ページを再読み込みしてください</div>
        <div style="margin-bottom: 10px;">• ブラウザコンソールを確認してください</div>
        <div style="margin-bottom: 10px;">• 管理画面でデータを確認してください</div>
        <div style="margin-bottom: 15px;">• キャバクラ一覧から再度選択してください</div>
        <button id="desktop-error-close" style="
            background: #2c3e50;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 12px;
            margin-right: 10px;
        ">閉じる</button>
        <button id="desktop-reload" style="
            background: #27ae60;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 12px;
        ">再読み込み</button>
    `;
    
    document.body.appendChild(helpDiv);
    
    document.getElementById('desktop-error-close').addEventListener('click', () => helpDiv.remove());
    document.getElementById('desktop-reload').addEventListener('click', () => location.reload());
    
    // 10秒後に自動削除
    setTimeout(() => {
        if (helpDiv.parentNode) {
            helpDiv.remove();
        }
    }, 10000);
}

// 全環境対応デバッグ情報表示
function showUniversalDebugInfo() {
    const debugInfo = document.createElement('div');
    const isDesktop = window.innerWidth > 768;
    
    debugInfo.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        padding: 25px;
        border-radius: 15px;
        z-index: 10000;
        font-family: monospace;
        font-size: ${isDesktop ? '12px' : '11px'};
        line-height: 1.5;
        max-height: 80vh;
        overflow-y: auto;
        white-space: pre-wrap;
        border: 2px solid ${isDesktop ? '#3498db' : '#e74c3c'};
    `;
    
    // 現在の状況を収集
    const storeId = getStoreIdFromURL();
    const storeName = decodeURIComponent(window.location.search.split('name=')[1] || '');
    
    let debugText = `${isDesktop ? '🖥️' : '📱'} 全環境対応デバッグ情報 (v3.0)
${'='.repeat(50)}
🔍 基本情報:
  - 環境: ${isDesktop ? 'デスクトップ' : 'モバイル'}
  - 現在のURL: ${window.location.href}
  - 検索パラメータ: ${window.location.search}
  - 店舗ID: ${storeId || '未設定'}
  - 店舗名: ${storeName || '未設定'}

📊 デバイス情報:
  - 画面サイズ: ${window.innerWidth}x${window.innerHeight}
  - UserAgent: ${navigator.userAgent.substring(0, 80)}...
  - タッチサポート: ${'ontouchstart' in window ? 'Yes' : 'No'}

💾 データ確認:`;

    // ローカルストレージ確認
    const savedStores = localStorage.getItem('nice_stores');
    if (savedStores) {
        try {
            const stores = JSON.parse(savedStores);
            debugText += `
  - 店舗数: ${stores.length}
  - データ整合性: ${stores.every(s => s.id !== undefined && s.name) ? 'OK' : 'NG'}
  - 全店舗リスト:`;
            stores.forEach((store, index) => {
                debugText += `
    ${index + 1}. ${store.name} (ID: ${store.id || '未設定'})`;
                // 特定のIDの店舗をハイライト
                if (storeId && (store.id == storeId || store.id === storeId)) {
                    debugText += ` ← ★検索対象`;
                }
            });
            
            // リアルタイム検索テスト
            if (storeId) {
                const foundByStrict = stores.find(s => s.id === storeId);
                const foundByLoose = stores.find(s => s.id == storeId);
                const foundByString = stores.find(s => s.id?.toString() === storeId.toString());
                const foundByNumber = stores.find(s => parseInt(s.id) === parseInt(storeId));
                
                debugText += `
  
  🧪 リアルタイム検索テスト:
  - 対象ID: ${storeId} (型: ${typeof storeId})
  - 厳密一致 (===): ${foundByStrict ? `✅ ${foundByStrict.name}` : '❌'}
  - 緩い一致 (==): ${foundByLoose ? `✅ ${foundByLoose.name}` : '❌'}
  - 文字列一致: ${foundByString ? `✅ ${foundByString.name}` : '❌'}
  - 数値一致: ${foundByNumber ? `✅ ${foundByNumber.name}` : '❌'}`;
                
                if (!foundByStrict && !foundByLoose && !foundByString && !foundByNumber) {
                    debugText += `
  - ⚠️ すべての検索方法で失敗`;
                    debugText += `
  - 💡 可能な原因: IDの型不一致、データ破損、URLパラメータエラー`;
                }
            }
            
        } catch (error) {
            debugText += `
  - ❌ JSONパースエラー: ${error.message}`;
        }
    } else {
        debugText += `
  - ⚠️ ローカルストレージが空です`;
    }

    debugText += `

🔧 システム状況:
  - window.loadStoreData: ${typeof window.loadStoreData === 'function' ? '✅ 利用可能' : '❌ 利用不可'}
  - currentStore: ${currentStore ? `✅ ${currentStore.name}` : '❌ 未設定'}
  - エラー要素: ${document.getElementById('error-content')?.style.display !== 'none' ? '⚠️ 表示中' : '✅ 非表示'}
  - コンテンツ要素: ${document.getElementById('store-content')?.style.display !== 'none' ? '✅ 表示中' : '⚠️ 非表示'}
  - ローディング要素: ${document.getElementById('loading')?.style.display !== 'none' ? '⚠️ 表示中' : '✅ 非表示'}

📱 修正履歴:
  - v3.0: 全環境対応デバッグ機能
  - v3.0: 緊急フォールバック強化
  - v3.0: デスクトップ版対応追加
  - v3.0: リアルタイム検索テスト

🛠️ 推奨対処法:
1. 🔄 「再テスト」ボタンで再実行
2. 📋 「店舗一覧」から再選択
3. 🔁 ページを手動で再読み込み
4. 🗃️ ブラウザキャッシュをクリア
5. 🔧 管理画面でデータを確認`;

    debugInfo.textContent = debugText;
    
    // ボタンコンテナ
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        display: flex;
        gap: 10px;
    `;
    
    // 閉じるボタン
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '❌';
    closeBtn.style.cssText = `
        background: #e74c3c;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 50%;
        font-size: 10px;
        cursor: pointer;
    `;
    closeBtn.addEventListener('click', () => debugInfo.remove());
    
    // 再テストボタン
    const testBtn = document.createElement('button');
    testBtn.innerHTML = '🧪';
    testBtn.style.cssText = `
        background: #27ae60;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 50%;
        font-size: 10px;
        cursor: pointer;
    `;
    testBtn.addEventListener('click', () => {
        debugInfo.remove();
        console.log('🧪 デバッグ：再テスト実行');
        loadStoreDetail();
    });
    
    // 店舗一覧ボタン
    const listBtn = document.createElement('button');
    listBtn.innerHTML = '📋';
    listBtn.style.cssText = `
        background: #f39c12;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 50%;
        font-size: 10px;
        cursor: pointer;
    `;
    listBtn.addEventListener('click', () => {
        window.location.href = 'cabaret-list.html';
    });
    
    buttonContainer.appendChild(closeBtn);
    buttonContainer.appendChild(testBtn);
    buttonContainer.appendChild(listBtn);
    debugInfo.appendChild(buttonContainer);
    document.body.appendChild(debugInfo);
    
    // 20秒後に自動で閉じる
    setTimeout(() => {
        if (debugInfo.parentNode) {
            debugInfo.remove();
        }
    }, 20000);
}

// モバイル版最終チェック
function performFinalMobileCheck() {
    console.log('📱 モバイル版最終チェック開始');
    
    const currentUrl = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('id');
    
    console.log('📱 最終チェック情報:', {
        currentUrl: currentUrl,
        storeId: storeId,
        hasStoreContent: !!document.getElementById('store-content'),
        hasErrorContent: !!document.getElementById('error-content'),
        isLoading: document.getElementById('loading').style.display !== 'none'
    });
    
    // エラー状態をチェック
    const errorContent = document.getElementById('error-content');
    if (errorContent && errorContent.style.display !== 'none') {
        console.log('📱 エラー状態を検出 - 追加情報を表示');
        showMobileTroubleshootingTips();
    }
    
    // 成功状態をチェック
    const storeContent = document.getElementById('store-content');
    if (storeContent && storeContent.style.display !== 'none') {
        console.log('📱 ✅ 店舗詳細が正常に表示されています');
        const storeName = document.getElementById('store-name')?.textContent || 'Unknown';
        showMobileSuccessMessage(`${storeName}の詳細が表示されました`);
    }
}

// モバイル版トラブルシューティングのヒント
function showMobileTroubleshootingTips() {
    const tipsDiv = document.createElement('div');
    tipsDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: rgba(241, 196, 15, 0.95);
        color: #2c3e50;
        padding: 15px;
        border-radius: 10px;
        font-size: 12px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
    `;
    
    tipsDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">📱 モバイル版トラブルシューティング</div>
        <div style="margin-bottom: 8px;">• ページを再読み込みしてください</div>
        <div style="margin-bottom: 8px;">• 管理画面で店舗データを確認してください</div>
        <div style="margin-bottom: 8px;">• 店舗一覧から再度選択してください</div>
        <div style="margin-bottom: 10px;">• ブラウザのコンソールログを確認してください</div>
        <button id="mobile-troubleshoot-close" style="
            background: #2c3e50;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 15px;
            font-size: 11px;
            cursor: pointer;
            width: 100%;
        ">閉じる</button>
    `;
    
    document.body.appendChild(tipsDiv);
    
    // 閉じるボタンのイベント
    document.getElementById('mobile-troubleshoot-close').addEventListener('click', () => {
        tipsDiv.remove();
    });
    
    // 10秒後に自動削除
    setTimeout(() => {
        if (tipsDiv.parentNode) {
            tipsDiv.remove();
        }
    }, 10000);
}

// モバイル版成功メッセージ
function showMobileSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.textContent = `✅ ${message}`;
    successDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(46, 204, 113, 0.95);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
    `;
    
    document.body.appendChild(successDiv);
    
    // フェードイン
    setTimeout(() => {
        successDiv.style.opacity = '1';
    }, 10);
    
    // フェードアウト
    setTimeout(() => {
        successDiv.style.opacity = '0';
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 300);
    }, 3000);
}

// モバイル版デバッグボタンを追加
function addMobileDebugButton() {
    const debugBtn = document.createElement('button');
    debugBtn.innerHTML = '🔍 Debug';
    debugBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 9999;
        background: #e74c3c;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 50px;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    debugBtn.addEventListener('click', showMobileDebugInfo);
    document.body.appendChild(debugBtn);
    
    // 5秒後に自動で非表示
    setTimeout(() => {
        debugBtn.style.opacity = '0.3';
        debugBtn.style.transform = 'scale(0.8)';
    }, 5000);
}

// モバイル版デバッグ情報を表示
function showMobileDebugInfo() {
    const debugInfo = document.createElement('div');
    debugInfo.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        font-family: monospace;
        font-size: 11px;
        line-height: 1.4;
        max-height: 70vh;
        overflow-y: auto;
        white-space: pre-wrap;
    `;
    
    // 現在の状況を収集
    const storeId = getStoreIdFromURL();
    const storeName = decodeURIComponent(window.location.search.split('name=')[1] || '');
    
    let debugText = `📱 モバイル版デバッグ情報 (v2.0)
===================
🔍 URL情報:
  - 現在のURL: ${window.location.href}
  - 検索パラメータ: ${window.location.search}
  - 店舗ID: ${storeId || '未設定'}
  - 店舗名: ${storeName || '未設定'}

📊 環境情報:
  - 画面サイズ: ${window.innerWidth}x${window.innerHeight}
  - UserAgent: ${navigator.userAgent.substring(0, 60)}...
  - タッチサポート: ${'ontouchstart' in window ? 'Yes' : 'No'}
  - デバイス回転: ${window.orientation || 'unknown'}

💾 データ状況:`;

    // ローカルストレージ確認
    const savedStores = localStorage.getItem('nice_stores');
    if (savedStores) {
        try {
            const stores = JSON.parse(savedStores);
            debugText += `
  - 店舗数: ${stores.length}
  - 店舗データ整合性: ${stores.every(s => s.id !== undefined) ? 'OK' : 'NG'}
  - 店舗リスト:`;
            stores.forEach((store, index) => {
                debugText += `
    ${index + 1}. ${store.name} (ID: ${store.id || '未設定'})`;
                // 特定のIDの店舗をハイライト
                if (storeId && (store.id == storeId || store.id === storeId)) {
                    debugText += ` ← ★検索対象`;
                }
            });
            
            // 検索対象の店舗が見つかるかテスト
            if (storeId) {
                const foundStore = stores.find(s => s.id == storeId || s.id === storeId);
                debugText += `
  
  🔍 検索テスト結果:
  - 対象ID: ${storeId}
  - 検索結果: ${foundStore ? `✅ 発見 (${foundStore.name})` : '❌ 見つからず'}`;
                
                if (!foundStore) {
                    debugText += `
  - 可能な原因: IDの型不一致またはデータ不整合`;
                }
            }
            
        } catch (error) {
            debugText += `
  - JSONパースエラー: ${error.message}`;
        }
    } else {
        debugText += `
  - ローカルストレージ: データなし`;
    }

    debugText += `

🔧 システム状況:
  - window.loadStoreData: ${typeof window.loadStoreData === 'function' ? '利用可能' : '利用不可'}
  - currentStore: ${currentStore ? currentStore.name : '未設定'}
  - エラー要素表示: ${document.getElementById('error-content')?.style.display !== 'none' ? 'Yes' : 'No'}
  - コンテンツ要素表示: ${document.getElementById('store-content')?.style.display !== 'none' ? 'Yes' : 'No'}

📱 モバイル版修正履歴:
  - v2.0: 強化された検索アルゴリズム
  - v2.0: 複数フォールバック機能
  - v2.0: インデックスベース検索
  - v2.0: モバイル専用緊急復旧

🛠️ 推奨対処法:
1. ページを再読み込みしてください
2. 管理画面で店舗データを確認
3. キャバクラ一覧から再度選択
4. ブラウザキャッシュをクリア`;

    debugInfo.textContent = debugText;
    
    // 閉じるボタン
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '❌ 閉じる';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        background: #e74c3c;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 10px;
        cursor: pointer;
    `;
    closeBtn.addEventListener('click', () => debugInfo.remove());
    
    // テスト実行ボタン
    const testBtn = document.createElement('button');
    testBtn.innerHTML = '🧪 再テスト';
    testBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 80px;
        background: #3498db;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 10px;
        cursor: pointer;
    `;
    testBtn.addEventListener('click', () => {
        debugInfo.remove();
        console.log('📱 デバッグ：再テスト実行');
        loadStoreDetail();
    });
    
    debugInfo.appendChild(closeBtn);
    debugInfo.appendChild(testBtn);
    document.body.appendChild(debugInfo);
    
    // 15秒後に自動で閉じる
    setTimeout(() => {
        if (debugInfo.parentNode) {
            debugInfo.remove();
        }
    }, 15000);
}

// 店舗詳細ページの初期化
async function initializeStoreDetailPage() {
    try {
        // Supabase初期化
        await initializeSupabase();
        
        // 編集フォームのイベントリスナーを設定
        setupEditFormListeners();
        
        console.log('✅ 店舗詳細ページの初期化完了');
    } catch (error) {
        console.warn('⚠️ 店舗詳細ページの初期化で一部エラー:', error);
    }
}

// Supabase初期化
async function initializeSupabase() {
    try {
        // Supabase SDK が読み込まれているかチェック
        if (typeof window.supabase === 'undefined') {
            console.warn('⚠️ Supabase SDK が読み込まれていません。ローカルモードで動作します。');
            return false;
        }
        
        // 設定をチェック
        if (typeof SUPABASE_CONFIG === 'undefined') {
            console.warn('⚠️ Supabase設定が見つかりません。supabase-config.jsを確認してください。');
            return false;
        }
        
        // Supabaseクライアントを初期化
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        
        console.log('✅ Supabase初期化成功（店舗詳細ページ）');
        return true;
    } catch (error) {
        console.warn('⚠️ Supabase初期化失敗（ローカルモードで動作）:', error);
        return false;
    }
}

// 編集フォームのイベントリスナー設定
function setupEditFormListeners() {
    const editForm = document.getElementById('store-edit-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }
}

// モバイル向け店舗詳細初期化
function initializeMobileStoreDetail() {
    console.log('📱 モバイル店舗詳細機能を初期化中...');
    
    // タッチ操作の最適化
    optimizeMobileTouchEvents();
    
    // データ読み込み失敗時のリトライ機能
    setupMobileRetryMechanism();
    

}

// モバイルタッチ操作最適化
function optimizeMobileTouchEvents() {
    // タッチ遅延を減らす
    document.addEventListener('touchstart', function() {}, { passive: true });
    
    // ギャラリースワイプの感度を調整
    const sliderContainer = document.querySelector('.gallery-slider-container');
    if (sliderContainer) {
        let startY = 0;
        let startX = 0;
        
        sliderContainer.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        sliderContainer.addEventListener('touchmove', function(e) {
            const currentY = e.changedTouches[0].clientY;
            const currentX = e.changedTouches[0].clientX;
            const diffY = Math.abs(currentY - startY);
            const diffX = Math.abs(currentX - startX);
            
            // 横スワイプの場合はスクロールを防ぐ
            if (diffX > diffY) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// モバイルリトライ機能設定
function setupMobileRetryMechanism() {
    // データ読み込み失敗時の自動リトライ
    window.addEventListener('error', function(e) {
        if (mobileLoadState.retryCount < mobileLoadState.maxRetries && !mobileLoadState.isLoading) {
            console.log(`📱 エラー検出 - リトライ ${mobileLoadState.retryCount + 1}/${mobileLoadState.maxRetries}`);
            setTimeout(() => {
                retryMobileStoreLoad();
            }, 2000 * (mobileLoadState.retryCount + 1)); // 段階的に遅延を増加
        }
    });
}

// モバイル向け店舗データ再読み込み
function retryMobileStoreLoad() {
    if (mobileLoadState.isLoading) return;
    
    mobileLoadState.isLoading = true;
    mobileLoadState.retryCount++;
    
    console.log('📱 店舗データを再読み込み中...');
    showMobileRetryMessage();
    
    setTimeout(() => {
        loadStoreDetail();
        mobileLoadState.isLoading = false;
    }, 1000);
}

// モバイルリトライメッセージ表示
function showMobileRetryMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(52, 152, 219, 0.95);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    message.innerHTML = `
        📱 データを再読み込み中...<br>
        <small>リトライ ${mobileLoadState.retryCount}/${mobileLoadState.maxRetries}</small>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}



// URLパラメータから店舗IDを取得
function getStoreIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 店舗名からIDを生成（日本語名を安全なIDに変換）
function generateStoreId(storeName) {
    return storeName
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '')
        .toLowerCase();
}

// 複数のフォールバック付きデータ取得（根本的修正版）
async function getStoresWithFallback() {
    console.log('🔄 店舗データ取得開始（根本的修正版）');
    
    // まず最優先でデフォルトデータを確保
    let defaultStores = getDefaultStoreDataWithImages();
    console.log('🗃️ デフォルトデータ準備完了:', defaultStores.length, '件');
    
    // 1. script.jsのloadStoreData()を試行
    if (typeof window.loadStoreData === 'function') {
        try {
            console.log('📥 window.loadStoreDataを使用してデータ取得中...');
            const stores = await window.loadStoreData();
            if (stores && stores.length > 0) {
                console.log('✅ window.loadStoreDataでデータ取得成功');
                // データにIDが設定されているか確認
                const processedStores = ensureValidStoreData(stores);
                if (processedStores && processedStores.length > 0) {
                    return processedStores;
                }
            }
        } catch (error) {
            console.error('❌ window.loadStoreDataエラー:', error);
        }
    }
    
    // 2. ローカルストレージから直接読み込み
    try {
        console.log('📂 ローカルストレージから直接読み込み中...');
        const stores = loadStoreDataLocal();
        if (stores && stores.length > 0) {
            console.log('✅ ローカルストレージから直接読み込み成功');
            const processedStores = ensureValidStoreData(stores);
            if (processedStores && processedStores.length > 0) {
                return processedStores;
            }
        }
    } catch (error) {
        console.error('❌ ローカルストレージ読み込みエラー:', error);
    }
    
    // 3. デフォルトデータを使用（最終フォールバック）
    console.log('🔄 デフォルトデータを使用（最終フォールバック）');
    
    // デフォルトデータをローカルストレージに保存
    try {
        localStorage.setItem('nice_stores', JSON.stringify(defaultStores));
        console.log('💾 デフォルトデータをローカルストレージに保存');
    } catch (error) {
        console.error('❌ ローカルストレージ保存エラー:', error);
    }
    
    return defaultStores;
}

// 店舗データの有効性を確保する関数
function ensureValidStoreData(stores) {
    if (!stores || !Array.isArray(stores)) {
        console.warn('⚠️ 無効な店舗データ形式');
        return null;
    }
    
    console.log('🔍 店舗データ有効性チェック開始');
    
    const validStores = stores.map((store, index) => {
        // 必須フィールドの確認
        if (!store.name || store.name.trim() === '') {
            console.warn(`⚠️ 店舗${index}: 名前が無効`);
            return null;
        }
        
        // IDの確保
        let storeId = store.id;
        if (!storeId || storeId === '' || storeId === null || storeId === undefined) {
            storeId = index + 1;
            console.log(`🔢 店舗 ${store.name}: IDを自動設定 (${storeId})`);
        }
        
        // 数値IDの確保
        const numericId = parseInt(storeId);
        if (!isNaN(numericId)) {
            storeId = numericId;
        }
        
        return {
            ...store,
            id: storeId,
            // 必須フィールドのデフォルト値設定
            image: store.image || 'nice-storefront.jpg',
            price: store.price || '要問合せ',
            description: store.description || `${store.name}の詳細情報です。`,
            features: store.features || ['店舗サービス'],
            badge: store.badge || '店舗'
        };
    }).filter(store => store !== null);
    
    console.log(`✅ 有効な店舗データ: ${validStores.length}/${stores.length}件`);
    
    return validStores.length > 0 ? validStores : null;
}

// 店舗詳細を読み込んで表示（緊急修正版）
async function loadStoreDetail() {
    const storeId = getStoreIdFromURL();
    const storeName = decodeURIComponent(window.location.search.split('name=')[1] || '');
    
    console.log('🔍 店舗詳細読み込み開始（緊急修正版）:', { storeId, storeName });
    console.log('🔍 現在のURL:', window.location.href);
    console.log('🔍 URLパラメータ:', window.location.search);
    
    // デスクトップ版でも詳細ログを有効化
    const isDesktop = window.innerWidth > 768;
    if (isDesktop) {
        console.log('🖥️ デスクトップ版店舗詳細読み込み');
            } else {
        console.log('📱 モバイル版店舗詳細読み込み');
        showMobileLoadingMessage('店舗情報を読み込み中...📱');
    }
    
    if (!storeId && !storeName) {
        console.error('❌ 店舗情報が指定されていません');
        showError('店舗情報が指定されていません。');
        return;
    }
    
    // ローディング表示
    showLoading();
    
    try {
        // 確実にデータを取得
        let stores = await getStoresWithFallback();
        
        if (!stores || stores.length === 0) {
            console.error('❌ すべてのフォールバックが失敗');
            showError('店舗データの読み込みに失敗しました。ページを再読み込みしてください。');
            return;
        }
        
        console.log('📊 最終取得データ:', {
            totalStores: stores.length,
            storeNames: stores.map(s => s.name),
            storeIds: stores.map(s => ({ name: s.name, id: s.id }))
        });
        
        // デスクトップ版でのデータ確認
        if (isDesktop) {
            console.log('🖥️ デスクトップ版データ確認:');
            stores.forEach((store, index) => {
                console.log(`🖥️ 店舗${index + 1}: ${store.name} (ID: ${store.id})`);
            });
            } else {
            showMobileLoadingMessage(`${stores.length}件の店舗データを取得📊`);
        }
        
        // 店舗検索（緊急修正版）
        const store = findStoreByAnyMeans(stores, storeId, storeName);
        
        console.log('📋 最終検索結果:', store ? `✅ ${store.name} (ID: ${store.id})` : '❌ 店舗が見つかりませんでした');
        
        if (!store) {
            console.log('🔍 詳細デバッグ情報:');
            console.log('  - 検索対象 storeId:', storeId);
            console.log('  - 検索対象 storeName:', storeName);
            console.log('  - 利用可能な店舗:');
            stores.forEach((s, index) => {
                console.log(`    ${index + 1}. ${s.name} (ID: ${s.id})`);
            });
            
            // 緊急フォールバック：最初の店舗を使用
            console.log('🚨 緊急フォールバック：最初の店舗を表示');
            const fallbackStore = stores[0];
            if (fallbackStore) {
                console.log('✅ 緊急フォールバック成功:', fallbackStore.name);
                displayStoreDetail(fallbackStore);
                hideLoading();
                
                // ユーザーに通知
                setTimeout(() => {
                    alert(`指定された店舗が見つからなかったため、${fallbackStore.name}の詳細を表示しています。`);
                }, 1000);
                
                return;
            }
            
            showError(`店舗が見つかりません。利用可能な店舗数: ${stores.length}件`);
            return;
        }
        
        // 店舗詳細を表示
        console.log('📋 店舗詳細表示開始:', store.name);
        displayStoreDetail(store);
        hideLoading();
        
    } catch (error) {
        console.error('❌ 店舗詳細読み込みエラー:', error);
        console.error('❌ エラー詳細:', error.stack);
        
        // 緊急フォールバック：デフォルトデータで再試行
        try {
            console.log('🚨 緊急復旧：デフォルトデータで再試行');
            const defaultStores = getDefaultStoreDataWithImages();
            if (defaultStores && defaultStores.length > 0) {
                const fallbackStore = defaultStores[0];
                displayStoreDetail(fallbackStore);
                hideLoading();
                
                setTimeout(() => {
                    alert(`エラーが発生したため、サンプル店舗（${fallbackStore.name}）を表示しています。`);
                }, 1000);
                
                return;
            }
        } catch (fallbackError) {
            console.error('❌ 緊急復旧も失敗:', fallbackError);
        }
        
        showError(`店舗データの読み込みに失敗しました。\nエラー: ${error.message}`);
    }
}

// あらゆる手段で店舗を検索する関数
function findStoreByAnyMeans(stores, storeId, storeName) {
    console.log('🔍 あらゆる手段で店舗検索:', { storeId, storeName });
    
    if (!stores || stores.length === 0) {
        return null;
    }
    
    // 方法1: IDによる検索（複数パターン）
    if (storeId) {
        console.log('🔍 方法1: IDによる検索');
        
        // 完全一致
        let store = stores.find(s => s.id === storeId);
        if (store) {
            console.log('✅ ID完全一致で発見:', store.name);
            return store;
        }
        
        // 緩い一致
        store = stores.find(s => s.id == storeId);
        if (store) {
            console.log('✅ ID緩い一致で発見:', store.name);
            return store;
        }
        
        // 文字列として一致
        store = stores.find(s => s.id?.toString() === storeId.toString());
        if (store) {
            console.log('✅ ID文字列一致で発見:', store.name);
            return store;
        }
        
        // 数値として一致
        const numericId = parseInt(storeId);
        if (!isNaN(numericId)) {
            store = stores.find(s => parseInt(s.id) === numericId);
            if (store) {
                console.log('✅ ID数値一致で発見:', store.name);
                return store;
            }
        }
        
        // インデックスとして検索
        const index = numericId - 1;
        if (index >= 0 && index < stores.length) {
            store = stores[index];
            if (store) {
                console.log('✅ インデックス検索で発見:', store.name);
                return store;
            }
        }
    }
    
    // 方法2: 店舗名による検索
    if (storeName) {
        console.log('🔍 方法2: 店舗名による検索');
        
        let store = stores.find(s => s.name === storeName);
        if (store) {
            console.log('✅ 店舗名完全一致で発見:', store.name);
            return store;
        }
        
        store = stores.find(s => s.name.includes(storeName) || storeName.includes(s.name));
        if (store) {
            console.log('✅ 店舗名部分一致で発見:', store.name);
            return store;
        }
    }
    
    console.log('❌ すべての検索方法で見つかりませんでした');
    return null;
}

// ギャラリースライダーの初期化
function initializeGallerySlider(images) {
    const sliderContainer = document.querySelector('.gallery-slider');
    const dotsContainer = document.querySelector('.gallery-dots');
    
    if (!sliderContainer || !dotsContainer) {
        console.error('ギャラリースライダーコンテナが見つかりません');
        return;
    }
    
    // スライダーをリセット
    sliderContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    // 画像スライドを生成
    images.forEach((imageSrc, index) => {
        const slide = document.createElement('div');
        slide.className = 'gallery-slide';
        slide.innerHTML = `<img src="${imageSrc}" alt="店舗写真 ${index + 1}" loading="lazy">`;
        sliderContainer.appendChild(slide);
        
        // ドットを生成
        const dot = document.createElement('span');
        dot.className = `gallery-dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.slide = index;
        dotsContainer.appendChild(dot);
    });
    
    // スライダー状態を初期化
    gallerySliderState.currentSlide = 0;
    gallerySliderState.totalSlides = images.length;
    gallerySliderState.isTransitioning = false;
    
    // イベントリスナーを設定
    setupGallerySliderEvents();
    
    // 自動スライドを開始（複数の画像がある場合のみ）
    if (images.length > 1) {
        startGalleryAutoSlide();
    }
    
    gallerySliderState.isInitialized = true;
    console.log(`ギャラリースライダーが初期化されました（${images.length}枚の写真）`);
}

// ギャラリースライダーのイベントリスナーを設定
function setupGallerySliderEvents() {
    const prevBtn = document.querySelector('.gallery-prev-btn');
    const nextBtn = document.querySelector('.gallery-next-btn');
    const dots = document.querySelectorAll('.gallery-dot');
    const sliderContainer = document.querySelector('.gallery-slider-container');
    
    // ボタンクリックイベント
    if (nextBtn) {
        nextBtn.onclick = function(e) {
            e.preventDefault();
            nextGallerySlide();
        };
    }
    
    if (prevBtn) {
        prevBtn.onclick = function(e) {
            e.preventDefault();
            prevGallerySlide();
        };
    }
    
    // ドットクリックイベント
    dots.forEach((dot, index) => {
        dot.onclick = function(e) {
            e.preventDefault();
            goToGallerySlide(index);
        };
    });
    
    // マウス・タッチイベント
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopGalleryAutoSlide);
        sliderContainer.addEventListener('mouseleave', startGalleryAutoSlide);
        
        // タッチスワイプ対応
        let startX = 0;
        let endX = 0;
        
        sliderContainer.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            stopGalleryAutoSlide();
        }, { passive: true });
        
        sliderContainer.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            handleGallerySwipe();
            if (gallerySliderState.totalSlides > 1) {
                startGalleryAutoSlide();
            }
        }, { passive: true });
        
        function handleGallerySwipe() {
            const threshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextGallerySlide();
                } else {
                    prevGallerySlide();
                }
            }
        }
    }
}

// ギャラリースライダーの位置を更新
function updateGallerySliderPosition() {
    const sliderContainer = document.querySelector('.gallery-slider');
    if (sliderContainer) {
        const translateX = -gallerySliderState.currentSlide * 100;
        sliderContainer.style.transform = `translateX(${translateX}%)`;
    }
}

// ギャラリースライダーのドットを更新
function updateGallerySliderDots() {
    const dots = document.querySelectorAll('.gallery-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === gallerySliderState.currentSlide);
    });
}

// 次のギャラリースライドに移動
function nextGallerySlide() {
    if (gallerySliderState.isTransitioning || gallerySliderState.totalSlides <= 1) return;
    gallerySliderState.isTransitioning = true;
    
    gallerySliderState.currentSlide = (gallerySliderState.currentSlide + 1) % gallerySliderState.totalSlides;
    updateGallerySliderPosition();
    updateGallerySliderDots();
    
    setTimeout(() => {
        gallerySliderState.isTransitioning = false;
    }, 500);
}

// 前のギャラリースライドに移動
function prevGallerySlide() {
    if (gallerySliderState.isTransitioning || gallerySliderState.totalSlides <= 1) return;
    gallerySliderState.isTransitioning = true;
    
    gallerySliderState.currentSlide = (gallerySliderState.currentSlide - 1 + gallerySliderState.totalSlides) % gallerySliderState.totalSlides;
    updateGallerySliderPosition();
    updateGallerySliderDots();
    
    setTimeout(() => {
        gallerySliderState.isTransitioning = false;
    }, 500);
}

// 指定したギャラリースライドに移動
function goToGallerySlide(slideIndex) {
    if (gallerySliderState.isTransitioning || slideIndex === gallerySliderState.currentSlide || gallerySliderState.totalSlides <= 1) return;
    gallerySliderState.isTransitioning = true;
    
    gallerySliderState.currentSlide = slideIndex;
    updateGallerySliderPosition();
    updateGallerySliderDots();
    
    setTimeout(() => {
        gallerySliderState.isTransitioning = false;
    }, 500);
}

// ギャラリースライダーの自動スライドを開始
function startGalleryAutoSlide() {
    if (gallerySliderState.totalSlides <= 1) return;
    
    if (gallerySliderState.autoSlideInterval) {
        clearInterval(gallerySliderState.autoSlideInterval);
    }
    gallerySliderState.autoSlideInterval = setInterval(nextGallerySlide, 4000);
}

// ギャラリースライダーの自動スライドを停止
function stopGalleryAutoSlide() {
    if (gallerySliderState.autoSlideInterval) {
        clearInterval(gallerySliderState.autoSlideInterval);
        gallerySliderState.autoSlideInterval = null;
    }
}

// 詳細説明を生成 - 管理画面の備考・説明のみを表示
function generateDetailedDescription(store) {
    // 管理画面で設定された description をそのまま使用
    const description = store.description || '';
    
    // 改行を <br> に変換し、段落に分ける
    if (description.trim()) {
        // 改行で分割して段落にする
        const paragraphs = description.split('\n').filter(line => line.trim() !== '');
        return paragraphs.map(paragraph => `<p>${paragraph.trim()}</p>`).join('');
    } else {
        // 説明が空の場合のデフォルトメッセージ
        return '<p>店舗の詳細説明はまだ設定されていません。</p>';
    }
}

// ローディング表示
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('store-content').style.display = 'none';
    document.getElementById('error-content').style.display = 'none';
}

// ローディング非表示
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// エラー表示
function showError(message) {
    console.error('Error:', message);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('store-content').style.display = 'none';
    document.getElementById('error-content').style.display = 'block';
    
    // エラーメッセージを更新
    const errorContainer = document.getElementById('error-content');
    const errorMessage = errorContainer.querySelector('p');
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

// 店舗データを読み込み（複数の写真を含む）- ローカル版
function loadStoreDataLocal() {
    const savedStores = localStorage.getItem('nice_stores');
    if (savedStores) {
        // 保存されているデータがあるが、写真を追加する必要がある
        const stores = JSON.parse(savedStores);
        return addImageDataToStores(stores);
    }
    
    // デフォルトの店舗データ（複数写真付き）
    return getDefaultStoreDataWithImages();
}

// 既存の店舗データに写真配列を追加
function addImageDataToStores(stores) {
    console.log('📸 ギャラリー画像データを処理中...');
    const imageData = getImageDataForStores();
    
    return stores.map((store, index) => {
        // 管理画面の images 配列を優先的に使用
        let galleryImages = [];
        
        if (store.images && Array.isArray(store.images) && store.images.length > 0) {
            // 管理画面で設定されたギャラリー画像を使用
            galleryImages = store.images.filter(img => img && img.trim() !== '');
            console.log(`📱 店舗 ${store.name}: 管理画面のギャラリー画像を使用 (${galleryImages.length}枚)`);
        } else if (imageData[store.name]) {
            // デフォルトの画像データを使用
            galleryImages = imageData[store.name];
            console.log(`📱 店舗 ${store.name}: デフォルト画像を使用 (${galleryImages.length}枚)`);
        } else {
            // メイン画像のみを使用
            galleryImages = [store.image || "nice-storefront.jpg"];
            console.log(`📱 店舗 ${store.name}: メイン画像のみを使用`);
        }

        // IDフィールドがない場合は自動で追加
        let storeId = store.id;
        if (!storeId || storeId === '' || storeId === null || storeId === undefined) {
            storeId = index + 1;
            console.log(`🔢 店舗 ${store.name}: IDを自動設定 (ID: ${storeId})`);
        }

        return {
            ...store,
            id: storeId,
            images: galleryImages
        };
    });
}

// 店舗ごとの写真データを取得
function getImageDataForStores() {
    return {
        "Premium Club TOKYO": [
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center"
        ],
        "Club Elegance": [
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center"
        ],
        "Night Paradise": [
            "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center"
        ],
        "Luxury Lounge": [
            "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center"
        ],
        "Royal Cabinet": [
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center"
        ],
        "Diamond Club": [
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center"
        ]
    };
}

// 複数写真付きのデフォルト店舗データ
function getDefaultStoreDataWithImages() {
    const imageData = getImageDataForStores();
    
    return [
        {
            id: 1,
            name: "Premium Club TOKYO",
            image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
            images: imageData["Premium Club TOKYO"],
            price: "1,500円〜",
            description: "最高級のサービスと洗練された空間で特別な時間をお過ごしください。厳選されたキャストが心を込めておもてなしいたします。\n営業時間: 20:00 - 翌02:00\n定休日: 日曜日",
            features: ["VIP個室あり", "送迎サービス", "カラオケ完備", "高級シャンパン"],
            badge: "人気No.1",
            businessHours: { start: "20:00", end: "02:00" },
            closedDays: ["日曜日"]
        },
        {
            id: 2,
            name: "Club Elegance",
            image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center",
            images: imageData["Club Elegance"],
            price: "1,200円〜",
            description: "エレガントで落ち着いた雰囲気の中で、上品なキャストがお客様を優雅にお迎えいたします。\n営業時間: 19:30 - 01:30\n定休日: 月曜日",
            features: ["落ち着いた雰囲気", "上品なキャスト", "個室完備", "ワイン豊富"],
            badge: "上品さNo.1",
            businessHours: { start: "19:30", end: "01:30" },
            closedDays: ["月曜日"]
        },
        {
            id: 3,
            name: "Night Paradise",
            image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
            images: imageData["Night Paradise"],
            price: "1,000円〜",
            description: "夜の楽園をコンセプトにしたアットホームな空間で、楽しい時間をお過ごしください。\n営業時間: 20:00 - 03:00\n定休日: なし",
            features: ["アットホーム", "リーズナブル", "イベント多数", "若いキャスト"],
            badge: "コスパNo.1",
            businessHours: { start: "20:00", end: "03:00" },
            closedDays: []
        },
        {
            id: 4,
            name: "Luxury Lounge",
            image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center",
            images: imageData["Luxury Lounge"],
            price: "2,000円〜",
            description: "ラグジュアリーな空間と最高級のサービスで、贅沢なひとときをお約束いたします。\n営業時間: 19:00 - 02:00\n定休日: 日曜日, 月曜日",
            features: ["最高級サービス", "豪華内装", "プレミアムドリンク", "VIPルーム"],
            badge: "高級志向",
            businessHours: { start: "19:00", end: "02:00" },
            closedDays: ["日曜日", "月曜日"]
        },
        {
            id: 5,
            name: "Royal Cabinet",
            image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center",
            images: imageData["Royal Cabinet"],
            price: "1,750円〜",
            description: "王室のような気品あふれる空間で、最上級のホスピタリティをご体験ください。\n営業時間: 19:30 - 01:00\n定休日: 火曜日",
            features: ["格調高い", "知的なキャスト", "プライベート空間", "高級酒豊富"],
            badge: "気品No.1",
            businessHours: { start: "19:30", end: "01:00" },
            closedDays: ["火曜日"]
        },
        {
            id: 6,
            name: "Diamond Club",
            image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
            images: imageData["Diamond Club"],
            price: "1,400円〜",
            description: "ダイヤモンドのように輝く特別な時間をお約束いたします。美しいキャストがお迎えします。\n営業時間: 20:30 - 02:30\n定休日: 水曜日",
            features: ["煌びやか", "美しいキャスト", "特別サービス", "記念日対応"],
            badge: "輝きNo.1",
            businessHours: { start: "20:30", end: "02:30" },
            closedDays: ["水曜日"]
        }
    ];
}
 
// 編集モードの切り替え
function toggleEditMode() {
    const editSection = document.getElementById('edit-section');
    const editToggleBtn = document.querySelector('.edit-toggle-btn');
    
    isEditMode = !isEditMode;
    
    if (isEditMode) {
        // 編集モードに切り替え
        editSection.style.display = 'block';
        editToggleBtn.textContent = '👁️ 表示モード';
        editToggleBtn.style.background = '#e74c3c';
        
        // 現在の店舗データをフォームに設定
        populateEditForm();
        
        // 編集セクションにスムーズにスクロール
        editSection.scrollIntoView({ behavior: 'smooth' });
        
        console.log('📝 編集モードに切り替えました');
    } else {
        // 表示モードに切り替え
        editSection.style.display = 'none';
        editToggleBtn.textContent = '✏️ 編集モード';
        editToggleBtn.style.background = '#3498db';
        
        console.log('👁️ 表示モードに切り替えました');
    }
}

// 編集キャンセル
function cancelEdit() {
    toggleEditMode();
}

// 編集フォームに現在のデータを設定
function populateEditForm() {
    if (!currentStore) {
        console.error('❌ 現在の店舗データがありません');
        return;
    }
    
    document.getElementById('edit-store-id').value = currentStore.id || '';
    document.getElementById('edit-store-name').value = currentStore.name || '';
    document.getElementById('edit-store-description').value = currentStore.description || '';
    document.getElementById('edit-store-price').value = currentStore.price || '';
    document.getElementById('edit-store-badge').value = currentStore.badge || '';
    document.getElementById('edit-store-features').value = 
        Array.isArray(currentStore.features) ? currentStore.features.join(', ') : '';
    
    console.log('📝 編集フォームにデータを設定しました');
}

// 編集フォーム送信処理
async function handleEditSubmit(e) {
    e.preventDefault();
    
    console.log('💾 店舗編集フォーム送信開始');
    
    const formData = new FormData(e.target);
    const features = formData.get('edit-store-features') 
        ? formData.get('edit-store-features').split(',').map(f => f.trim()).filter(f => f)
        : [];
    
    const updatedStore = {
        ...currentStore,
        name: document.getElementById('edit-store-name').value,
        description: document.getElementById('edit-store-description').value,
        price: document.getElementById('edit-store-price').value,
        badge: document.getElementById('edit-store-badge').value,
        features: features
    };
    
    console.log('📝 更新データ:', updatedStore);
    
    try {
        // ローカルストレージを更新
        updateStoreInLocalStorage(updatedStore);
        
        // Supabaseに保存
        const cloudSaved = await saveStoreToSupabase(updatedStore);
        
        if (cloudSaved) {
            showEditMessage('✅ クラウドに保存しました！', 'success');
        } else {
            showEditMessage('💾 ローカルに保存しました', 'info');
        }
        
        // 現在の店舗データを更新
        currentStore = updatedStore;
        
        // 画面表示を更新
        updateStoreDisplay(updatedStore);
        
        // 編集モードを終了
        toggleEditMode();
        
        console.log('✅ 店舗編集完了');
        
    } catch (error) {
        console.error('❌ 店舗編集エラー:', error);
        showEditMessage('保存に失敗しました: ' + error.message, 'error');
    }
}

// ローカルストレージの店舗データを更新
function updateStoreInLocalStorage(updatedStore) {
    try {
        const savedStores = localStorage.getItem('nice_stores');
        if (savedStores) {
            const stores = JSON.parse(savedStores);
            const index = stores.findIndex(store => store.id === updatedStore.id);
            
            if (index !== -1) {
                stores[index] = updatedStore;
                localStorage.setItem('nice_stores', JSON.stringify(stores));
                console.log('✅ ローカルストレージを更新しました');
            }
        }
    } catch (error) {
        console.error('❌ ローカルストレージ更新エラー:', error);
    }
}

// Supabaseに店舗データを保存
async function saveStoreToSupabase(store) {
    if (!supabaseClient) {
        console.log('⚠️ Supabaseクライアントが初期化されていません');
        return false;
    }

    try {
        const supabaseData = {
            id: store.id,
            name: store.name,
            description: store.description,
            features: store.features,
            price: store.price,
            badge: store.badge,
            image: store.image,
            images: store.images || [],
            business_hours: store.businessHours || { start: '20:00', end: '02:00' },
            closed_days: store.closedDays || [],
            session_id: `detail_edit_${Date.now()}`,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabaseClient
            .from('nice_stores')
            .upsert(supabaseData);

        if (error) {
            console.error('❌ Supabase保存エラー:', error);
            return false;
        }

        console.log('✅ Supabaseに保存しました:', store.name);
        return true;
    } catch (error) {
        console.error('❌ Supabase保存エラー:', error);
        return false;
    }
}

// 画面表示を更新
function updateStoreDisplay(store) {
    // 基本情報を更新
    document.getElementById('store-badge').textContent = store.badge || '';
    document.getElementById('store-name').textContent = store.name || '';
    document.getElementById('store-description').textContent = store.description || '';
    document.getElementById('store-price').textContent = store.price || '';
    
    // 詳細情報を更新
    document.getElementById('detail-name').textContent = store.name || '';
    document.getElementById('detail-price').textContent = store.price || '';
    
    // 特徴・サービスを更新
    const featuresContainer = document.getElementById('store-features');
    if (featuresContainer) {
        featuresContainer.innerHTML = '';
        if (store.features && Array.isArray(store.features)) {
            store.features.forEach(feature => {
                const featureTag = document.createElement('span');
                featureTag.className = 'feature-tag';
                featureTag.textContent = feature;
                featuresContainer.appendChild(featureTag);
            });
        }
    }
    
    // ページタイトルも更新
    document.title = `${store.name} - 店舗詳細 | NICE（ナイス）`;
    
    console.log('✅ 画面表示を更新しました');
}

// 編集メッセージ表示
function showEditMessage(message, type = 'success') {
    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.edit-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `edit-message ${type}`;
    messageDiv.textContent = message;
    
    // メッセージのスタイル
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 25px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 320px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
    } else if (type === 'error') {
        messageDiv.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
    } else if (type === 'info') {
        messageDiv.style.background = 'linear-gradient(45deg, #3498db, #2980b9)';
    } else {
        messageDiv.style.background = 'linear-gradient(45deg, #95a5a6, #7f8c8d)';
    }
    
    document.body.appendChild(messageDiv);
    
    // アニメーション
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateX(0)';
    }, 10);
    
    // 自動削除
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, 4000);
}

// 🖥️ パソコン版専用緊急修復ボタンを追加
function addDesktopEmergencyFix() {
    const emergencyBtn = document.createElement('button');
    emergencyBtn.innerHTML = '🚨 修復';
    emergencyBtn.id = 'desktop-emergency-fix';
    emergencyBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 10000;
        background: #e74c3c;
        color: white;
        border: none;
        padding: 15px 20px;
        border-radius: 30px;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 4px 20px rgba(231, 76, 60, 0.4);
        cursor: pointer;
        transition: all 0.3s ease;
        display: none;
    `;
    
    emergencyBtn.addEventListener('click', performDesktopEmergencyFix);
    emergencyBtn.addEventListener('mouseenter', () => {
        emergencyBtn.style.transform = 'scale(1.1)';
        emergencyBtn.style.boxShadow = '0 6px 25px rgba(231, 76, 60, 0.6)';
    });
    emergencyBtn.addEventListener('mouseleave', () => {
        emergencyBtn.style.transform = 'scale(1)';
        emergencyBtn.style.boxShadow = '0 4px 20px rgba(231, 76, 60, 0.4)';
    });
    
    document.body.appendChild(emergencyBtn);
    
    // 3秒後にボタンを表示（店舗データの読み込み状況を確認後）
    setTimeout(() => {
        const hasStoreContent = document.querySelector('#store-content');
        const hasError = document.querySelector('#error-content');
        const isLoading = document.querySelector('#loading') && document.querySelector('#loading').style.display !== 'none';
        
        if (hasError || isLoading || !hasStoreContent) {
            console.log('🖥️ パソコン版：問題を検出 - 緊急修復ボタンを表示');
            emergencyBtn.style.display = 'block';
            
            // 軽く点滅して注意を引く
            emergencyBtn.style.animation = 'pulse 2s infinite';
            
            // アニメーション用CSS追加
            if (!document.querySelector('#emergency-pulse-style')) {
                const style = document.createElement('style');
                style.id = 'emergency-pulse-style';
                style.textContent = `
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.05); opacity: 0.8; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }, 3000);
}

// 🖥️ パソコン版緊急修復実行
async function performDesktopEmergencyFix() {
    console.log('🖥️ パソコン版緊急修復開始');
    
    const btn = document.getElementById('desktop-emergency-fix');
    if (btn) {
        btn.textContent = '修復中...';
        btn.style.background = '#95a5a6';
        btn.disabled = true;
    }
    
    try {
        // ステップ1: URLパラメータを詳細分析
        console.log('🔍 ステップ1: URLパラメータ分析');
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const storeId = urlParams.get('id');
        const storeName = urlParams.get('name');
        
        console.log('🔍 URL分析結果:', {
            currentUrl,
            storeId,
            storeName,
            search: window.location.search
        });
        
        // ステップ2: 複数ソースからデータを強制取得
        console.log('📊 ステップ2: データ強制取得');
        showLoading();
        
        let stores = [];
        
        // 2.1: Supabaseから直接取得を試行
        try {
            if (window.loadStoreData) {
                console.log('📊 Supabaseから直接取得試行');
                stores = await window.loadStoreData();
                console.log('✅ Supabaseデータ取得成功:', stores ? stores.length : 0, '件');
            }
        } catch (error) {
            console.log('⚠️ Supabaseデータ取得失敗:', error);
        }
        
        // 2.2: ローカルストレージから取得
        if (!stores || stores.length === 0) {
            console.log('📦 ローカルストレージから取得試行');
            const localData = localStorage.getItem('nice_stores');
            if (localData) {
                try {
                    stores = JSON.parse(localData);
                    console.log('✅ ローカルデータ取得成功:', stores.length, '件');
                } catch (error) {
                    console.error('❌ ローカルデータ解析エラー:', error);
                }
            }
        }
        
        // 2.3: デフォルトデータで最終フォールバック
        if (!stores || stores.length === 0) {
            console.log('🏗️ デフォルトデータで最終フォールバック');
            stores = getDefaultStoreDataWithImages();
            console.log('✅ デフォルトデータ使用:', stores.length, '件');
        }
        
        if (!stores || stores.length === 0) {
            throw new Error('すべてのデータソースが失敗しました');
        }
        
        // ステップ3: 店舗検索（複数方法）
        console.log('🔍 ステップ3: 店舗検索');
        let targetStore = null;
        
        // 3.1: IDで検索
        if (storeId && !targetStore) {
            console.log('🔍 ID検索:', storeId);
            targetStore = stores.find(s => s.id == storeId || s.id === storeId || s.id?.toString() === storeId?.toString());
            if (targetStore) {
                console.log('✅ ID検索成功:', targetStore.name);
            }
        }
        
        // 3.2: 名前で検索
        if (storeName && !targetStore) {
            console.log('🔍 名前検索:', storeName);
            targetStore = stores.find(s => s.name === storeName || s.name.includes(storeName));
            if (targetStore) {
                console.log('✅ 名前検索成功:', targetStore.name);
            }
        }
        
        // 3.3: インデックス検索（IDが数値の場合）
        if (storeId && !targetStore) {
            const numericId = parseInt(storeId);
            if (!isNaN(numericId) && numericId > 0 && numericId <= stores.length) {
                targetStore = stores[numericId - 1];
                console.log('✅ インデックス検索成功:', targetStore.name);
            }
        }
        
        // 3.4: 最終フォールバック（最初の店舗）
        if (!targetStore && stores.length > 0) {
            console.log('🚨 最終フォールバック: 最初の店舗を使用');
            targetStore = stores[0];
        }
        
        if (!targetStore) {
            throw new Error('店舗が見つかりません');
        }
        
        // ステップ4: 店舗詳細を表示
        console.log('🎨 ステップ4: 店舗詳細表示');
        displayStoreDetail(targetStore);
        hideLoading();
        
        // ステップ5: 成功メッセージ
        console.log('✅ パソコン版緊急修復完了:', targetStore.name);
        
        // 修復成功の通知
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                font-weight: bold;
                z-index: 10001;
                box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
                animation: slideInRight 0.3s ease;
            `;
            notification.textContent = `✅ 修復完了：${targetStore.name}`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }, 500);
        
        // ボタンを非表示
        if (btn) {
            btn.style.display = 'none';
        }
        
    } catch (error) {
        console.error('❌ パソコン版緊急修復エラー:', error);
        hideLoading();
        
        // エラー表示
        showError(`修復に失敗しました: ${error.message}\n\nページを再読み込みしてください。`);
        
        // ボタンを元に戻す
        if (btn) {
            btn.textContent = '🚨 修復';
            btn.style.background = '#e74c3c';
            btn.disabled = false;
        }
    }
}
 