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
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
        name: 'シャンデリア 1'
    },
    {
        id: 10,
        url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&crop=center',
        name: 'レストランバー 1'
    },
    {
        id: 11,
        url: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop&crop=center',
        name: 'エレガントな空間 2'
    },
    {
        id: 12,
        url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&h=600&fit=crop&crop=center',
        name: 'モダンなバー 2'
    },
    {
        id: 13,
        url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center',
        name: 'ラグジュアリーラウンジ 2'
    },
    {
        id: 14,
        url: 'https://images.unsplash.com/photo-1586985289906-406988974504?w=800&h=600&fit=crop&crop=center',
        name: 'VIPルーム 2'
    },
    {
        id: 15,
        url: 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=800&h=600&fit=crop&crop=center',
        name: 'カウンターバー 2'
    },
    {
        id: 16,
        url: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&h=600&fit=crop&crop=center',
        name: 'レストランバー 2'
    },
    {
        id: 17,
        url: 'https://images.unsplash.com/photo-1530841344095-c5a1dd5c0dd5?w=800&h=600&fit=crop&crop=center',
        name: 'モダンクラブ 2'
    },
    {
        id: 18,
        url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop&crop=center',
        name: 'シャンデリア 2'
    },
    {
        id: 19,
        url: 'https://images.unsplash.com/photo-1609142025341-dd87b1b38d0d?w=800&h=600&fit=crop&crop=center',
        name: '高級クラブ内装 2'
    },
    {
        id: 20,
        url: 'https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=800&h=600&fit=crop&crop=center',
        name: '豪華な内装 2'
    }
];

// グローバル変数
let currentStores = [];
let isAuthenticated = false;
let editingStoreId = null;
let currentImageType = '';
let currentGalleryIndex = 0;
let currentStoreImages = [];

// DOM要素
let loginScreen, adminScreen, loginForm, loginError, logoutBtn, addStoreBtn, 
    saveAllBtn, resetDataBtn, storesList, editModal, storeForm, imageGallery;

// Supabaseクライアント
let supabaseClient = null;
let supabaseDB = null;

// Supabase設定のインポート
async function initializeSupabaseAdmin() {
    try {
        console.log('🔧 Supabase管理画面初期化中...');
        
        // supabase-config.jsの初期化関数を使用
        if (typeof window.initializeSupabase === 'function') {
            const success = window.initializeSupabase();
            if (!success) {
                console.warn('⚠️ Supabase初期化失敗。ローカルモードで動作します。');
                return false;
            }
        } else {
            console.error('❌ initializeSupabase関数が見つかりません');
            return false;
        }
        
        // SupabaseDBインスタンスを初期化
        console.log('🔍 利用可能なグローバルオブジェクト:', {
            SupabaseDB: typeof window.SupabaseDB,
            createSupabaseDB: typeof window.createSupabaseDB,
            SUPABASE_CONFIG: typeof window.SUPABASE_CONFIG
        });
        
        if (typeof window.SupabaseDB !== 'undefined') {
            supabaseDB = new window.SupabaseDB();
            const dbSuccess = await supabaseDB.initialize();
            if (!dbSuccess) {
                console.warn('⚠️ SupabaseDB初期化失敗。ローカルモードで動作します。');
                // ローカルモードでも成功扱いにして続行
                return true;
            }
            console.log('✅ SupabaseDBインスタンス初期化成功');
        } else if (typeof window.createSupabaseDB !== 'undefined') {
            supabaseDB = window.createSupabaseDB();
            const dbSuccess = await supabaseDB.initialize();
            if (!dbSuccess) {
                console.warn('⚠️ SupabaseDB初期化失敗。ローカルモードで動作します。');
                return true;
            }
            console.log('✅ SupabaseDBインスタンス初期化成功（createSupabaseDB経由）');
        } else {
            console.warn('⚠️ SupabaseDBクラスが見つかりません。ローカルモードで動作します。');
            // SupabaseDBが見つからなくても続行（ローカルモード）
            return true;
        }
        
        console.log('✅ Supabase管理画面初期化成功');
        
        // Supabase接続をテスト
        await testSupabaseConnection();
        
        // クラウド同期状態をUIに反映
        updateCloudSyncStatus(true);
        
        return true;
    } catch (error) {
        console.warn('⚠️ Supabase設定の読み込みに失敗（ローカルモードで動作）:', error);
        updateCloudSyncStatus(false);
        return false;
    }
}

// Supabase接続テスト（詳細診断機能付き）
async function testSupabaseConnection() {
    console.log('🔍 Supabase接続テスト開始...');
    
    try {
        // ステップ1: Supabase SDK の読み込み確認
        console.log('📋 ステップ1: Supabase SDK確認');
        if (typeof window.supabase === 'undefined') {
            throw new Error('❌ Supabase SDK が読み込まれていません');
        }
        console.log('✅ Supabase SDK が読み込まれています');
        
        // ステップ2: createClient 関数確認
        console.log('📋 ステップ2: createClient関数確認');
        if (typeof window.supabase.createClient !== 'function') {
            throw new Error('❌ createClient関数が利用できません');
        }
        console.log('✅ createClient関数が利用可能です');
        
        // ステップ3: 設定確認
        console.log('📋 ステップ3: 設定確認');
        console.log('URL:', SUPABASE_CONFIG.url);
        console.log('API Key:', SUPABASE_CONFIG.anonKey ? '設定済み (****)' : '❌ 未設定');
        
        // ステップ4: クライアント初期化確認
        console.log('📋 ステップ4: クライアント初期化確認');
        if (!window.supabaseClient) {
            console.log('⚠️ supabaseClientが未初期化、初期化を試行...');
            window.supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        }
        console.log('✅ Supabaseクライアント初期化完了');
        
        // ステップ5: 基本的な接続テスト
        console.log('📋 ステップ5: 基本接続テスト');
        const { data, error } = await window.supabaseClient
            .from('nice_stores')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('❌ 接続エラー詳細:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            
            if (error.code === 'PGRST116') {
                throw new Error('❌ テーブル "nice_stores" が存在しません');
            } else if (error.message.includes('permission denied')) {
                throw new Error('❌ 権限エラー: RLS (Row Level Security) 設定を確認してください');
            } else {
                throw error;
            }
        }
        
        console.log('✅ 接続成功！データ:', data);
        console.log('✅ Supabase接続テスト完了');
        
        alert('✅ Supabase接続テスト成功！\n詳細はコンソールログを確認してください。');
        
    } catch (error) {
        console.error('❌ Supabase接続テストエラー:', error.message);
        alert('❌ Supabase接続エラー:\n' + error.message + '\n\n詳細はコンソールログ (F12) を確認してください。');
        throw error;
    }
}

// Supabase直接データ保存テスト
async function testSupabaseSave() {
    try {
        if (!window.supabase) {
            throw new Error('Supabaseクライアントが初期化されていません');
        }
        
        console.log('🧪 Supabaseデータ保存テスト開始...');
        
        // テスト店舗データ
        const testStore = {
            id: Date.now(), // 現在時刻をIDに使用
            name: 'テスト店舗 ' + new Date().toLocaleTimeString(),
            price: '9,999円〜',
            badge: 'テスト',
            description: 'Supabase接続テスト用の店舗データです',
            features: ['テスト', '接続確認'],
            session_id: 'test_session_' + Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('📤 テストデータをSupabaseに保存中...', testStore);
        
        const { data, error } = await window.supabase
            .from('nice_stores')
            .upsert(testStore)
            .select();
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Supabaseデータ保存テスト成功！', data);
        alert('✅ Supabaseデータ保存テスト成功！\n店舗「' + testStore.name + '」を保存しました。');
        
        // テストデータをすぐに削除
        setTimeout(async () => {
            try {
                await window.supabase
                    .from('nice_stores')
                    .delete()
                    .eq('id', testStore.id);
                console.log('🗑️ テストデータを削除しました');
            } catch (deleteError) {
                console.warn('⚠️ テストデータ削除エラー:', deleteError);
            }
        }, 3000);
        
    } catch (error) {
        console.error('❌ Supabaseデータ保存テストエラー:', error);
        alert('❌ Supabaseデータ保存エラー:\n' + error.message);
        throw error;
    }
}

// クラウド同期状態をUIに更新
function updateCloudSyncStatus(isOnline) {
    // 既存の状態表示を削除
    const existingStatus = document.querySelector('.cloud-sync-status');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // 新しい状態表示を作成
    const statusElement = document.createElement('div');
    statusElement.className = 'cloud-sync-status';
    statusElement.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    `;
    
    if (isOnline) {
        statusElement.innerHTML = '🌐 クラウド同期が有効になりました！';
        statusElement.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
        statusElement.style.color = 'white';
    } else {
        statusElement.innerHTML = '💾 ローカルモード（オフライン）';
        statusElement.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
        statusElement.style.color = 'white';
    }
    
    document.body.appendChild(statusElement);
    
    // 5秒後に薄く表示
    setTimeout(() => {
        statusElement.style.opacity = '0.7';
        statusElement.style.transform = 'scale(0.9)';
    }, 5000);
}

// Supabaseからデータを読み込み
async function loadStoresFromSupabase() {
    console.log('📥 loadStoresFromSupabase実行中...');
    
    if (!supabaseDB || !supabaseDB.isOnline) {
        console.log('⚠️ SupabaseDB未初期化またはオフライン。ローカルデータを使用します。');
        return false;
    }

    try {
        const stores = await supabaseDB.loadStores();
        
        if (stores && stores.length > 0) {
            currentStores = stores;
            console.log(`✅ Supabaseから${currentStores.length}件の店舗データを読み込みました`);
            return true;
        } else {
            console.log('📥 Supabaseにデータが見つかりません');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Supabaseデータ読み込みエラー:', error);
        return false;
    }
}

// Supabaseにデータを保存
async function saveStoresToSupabase() {
    console.log('💾 saveStoresToSupabase実行中...');
    
    if (!supabaseDB || !supabaseDB.isOnline) {
        console.log('⚠️ SupabaseDB未初期化またはオフライン。ローカル保存を使用します。');
        return false;
    }

    try {
        showMessage('クラウドに保存中...', 'info');
        
        // 各店舗を個別に保存
        let successCount = 0;
        let errorCount = 0;
        
        for (const store of currentStores) {
            try {
                const success = await supabaseDB.saveStore(store);
                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error(`店舗 ${store.name} の保存エラー:`, error);
                errorCount++;
            }
                 }
         
         // 結果の報告
         if (errorCount === 0) {
             console.log(`✅ ${successCount}件の店舗をSupabaseに保存しました`);
             showMessage(`✅ ${successCount}件の店舗をクラウドに保存しました！`, 'success');
             notifyMobileDevices();
             return true;
         } else if (successCount > 0) {
             console.log(`⚠️ ${successCount}件成功、${errorCount}件失敗`);
             showMessage(`⚠️ ${successCount}件成功、${errorCount}件失敗`, 'warning');
             return true;
         } else {
             console.log(`❌ 全ての店舗の保存に失敗しました`);
             showMessage('❌ クラウド保存に失敗しました', 'error');
             return false;
         }
         
    } catch (error) {
        console.error('❌ Supabase保存エラー:', error);
        showMessage('クラウド保存エラー: ' + error.message, 'error');
        return false;
    }
}

// 単一店舗をSupabaseに保存
async function saveStoreToSupabase(store) {
    console.log('💾 saveStoreToSupabase実行中...', store);
    
    if (!supabaseDB || !supabaseDB.isOnline) {
        console.log('⚠️ SupabaseDB未初期化またはオフライン');
        return false;
    }

    try {
        const success = await supabaseDB.saveStore(store);
        
        if (success) {
            console.log('✅ Supabaseに店舗データを保存しました');
            return true;
        } else {
            console.log('❌ Supabase保存に失敗');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Supabase保存エラー:', error);
        return false;
    }
}

// デフォルトデータ
const DEFAULT_STORES = [
    {
        id: 1,
        name: "Club Elegance",
        description: "銀座の中心に位置する高級キャバクラ。洗練された大人の女性が、上質なひとときをお約束いたします。",
        features: ["高級店", "銀座", "上品"],
        price: "30,000円〜",
        badge: "人気",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
        gallery: [
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center"
        ]
    },
    {
        id: 2,
        name: "Royal Lounge",
        description: "六本木の夜を彩る最高級ラウンジ。VIPルームも完備し、特別な夜をお過ごしいただけます。",
        features: ["ラグジュアリー", "六本木", "VIP"],
        price: "50,000円〜",
        badge: "王室級",
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center",
        gallery: [
            "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1574391884720-bfafb0d70327?w=800&h=600&fit=crop&crop=center"
        ]
    },
    {
        id: 3,
        name: "Modern Bar TOKYO",
        description: "新宿の新スポット。モダンなデザインと最新の音響設備で、新感覚のエンターテイメントを提供。",
        features: ["新店", "新宿", "モダン"],
        price: "20,000円〜",
        badge: "新店",
        image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&h=600&fit=crop&crop=center",
        gallery: [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop&crop=center",
            "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&h=600&fit=crop&crop=center"
        ]
    }
];

// 初期化
async function initializeApp() {
    console.log('🚀 管理画面初期化開始...');
    
    try {
        // DOM要素を取得
        console.log('📋 DOM要素を取得中...');
        loginScreen = document.getElementById('login-screen');
        adminScreen = document.getElementById('admin-screen');
        loginForm = document.getElementById('login-form');
        loginError = document.getElementById('login-error');
        logoutBtn = document.getElementById('logout-btn');
        addStoreBtn = document.getElementById('add-store-btn');
        saveAllBtn = document.getElementById('save-all-btn');
        resetDataBtn = document.getElementById('reset-data-btn');
        storesList = document.getElementById('stores-list');
        editModal = document.getElementById('edit-modal');
        storeForm = document.getElementById('store-form');
        imageGallery = document.getElementById('image-gallery');

        console.log('📋 重要なDOM要素の確認:');
        console.log('- storeForm:', !!storeForm);
        console.log('- editModal:', !!editModal);
        console.log('- addStoreBtn:', !!addStoreBtn);

        // Supabaseを初期化
        console.log('☁️ Supabase初期化中...');
        await initializeSupabaseAdmin();
        
        // 認証状態をチェック
        console.log('🔐 認証状態をチェック中...');
        checkAuthStatus();
        
        // データを初期化
        console.log('📊 データ初期化中...');
        await initializeStoreData();
        
        // イベントリスナーを設定
        console.log('⚡ イベントリスナー設定中...');
        setupEventListeners();
        
        console.log('✅ 管理画面初期化完了');
        
    } catch (error) {
        console.error('❌ 管理画面初期化エラー:', error);
        showMessage('初期化エラー: ' + error.message, 'error');
    }
}

// 認証状態チェック
function checkAuthStatus() {
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth === 'authenticated') {
        isAuthenticated = true;
        showAdminScreen();
    } else {
        showLoginScreen();
    }
}

// データ初期化
async function initializeStoreData() {
    // まずSupabaseからデータを試行
    const supabaseLoaded = await loadStoresFromSupabase();
    
    if (!supabaseLoaded) {
        // Supabaseから読み込めない場合、ローカルストレージを確認
        const savedData = localStorage.getItem('nice_stores');
        if (savedData) {
            try {
                currentStores = JSON.parse(savedData);
                console.log('ローカルストレージからデータを読み込みました');
            } catch (error) {
                console.error('ローカルデータの解析エラー:', error);
                currentStores = [...DEFAULT_STORES];
            }
        } else {
            currentStores = [...DEFAULT_STORES];
            console.log('デフォルトデータを使用します');
        }
    }
    
    if (isAuthenticated) {
        renderStores();
    }
}

// イベントリスナー設定
function setupEventListeners() {
    console.log('📋 イベントリスナー設定開始...');
    
    try {
        // ログイン
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
            console.log('✅ ログインフォームイベント設定完了');
        }
        
        // ログアウト
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
            console.log('✅ ログアウトボタンイベント設定完了');
        }
        
        // 店舗管理
        if (addStoreBtn) {
            addStoreBtn.addEventListener('click', showAddStoreModal);
            console.log('✅ 新規店舗追加ボタンイベント設定完了');
        }
        
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', handleSaveAll);
            console.log('✅ 全保存ボタンイベント設定完了');
        }
        
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', handleResetData);
            console.log('✅ リセットボタンイベント設定完了');
        }
        
        // フォーカス管理
        setupFocusManagement();
        
        console.log('✅ 基本イベントリスナー設定完了');
        
        // デバッグ用テストボタンを追加
        addDebugTestButtons();
        
    } catch (error) {
        console.error('❌ イベントリスナー設定エラー:', error);
    }
}

// デバッグ用テストボタンを追加
function addDebugTestButtons() {
    // テスト保存ボタン
    const testSaveBtn = document.createElement('button');
    testSaveBtn.textContent = '🧪 テスト保存';
    testSaveBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 10000;
        padding: 10px 15px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 12px;
        cursor: pointer;
    `;
    testSaveBtn.addEventListener('click', function() {
        console.log('🧪 テスト保存実行...');
        const testStore = {
            id: Date.now(),
            name: 'テスト店舗 ' + new Date().toLocaleTimeString(),
            description: 'これはテスト店舗です',
            price: '1,000円〜',
            badge: 'テスト',
            features: ['テスト機能'],
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center',
            gallery: [],
            businessHours: { start: '20:00', end: '02:00' },
            closedDays: []
        };
        
        saveStore(testStore).then(success => {
            if (success) {
                console.log('✅ テスト保存成功');
                renderStores();
            } else {
                console.log('❌ テスト保存失敗');
            }
        });
    });
    document.body.appendChild(testSaveBtn);
    
    // ログ確認ボタン
    const logBtn = document.createElement('button');
    logBtn.textContent = '📋 ログ確認';
    logBtn.style.cssText = `
        position: fixed;
        top: 50px;
        right: 10px;
        z-index: 10000;
        padding: 10px 15px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 12px;
        cursor: pointer;
    `;
    logBtn.addEventListener('click', function() {
        console.log('📋 現在の状態:');
        console.log('- 認証状態:', isAuthenticated);
        console.log('- 現在の店舗数:', currentStores.length);
        console.log('- Supabaseクライアント:', !!supabaseClient);
        console.log('- DOM要素の存在:');
        console.log('  - storeForm:', !!storeForm);
        console.log('  - addStoreBtn:', !!addStoreBtn);
        console.log('  - editModal:', !!editModal);
        console.log('- ローカルストレージ:', !!localStorage.getItem('nice_stores'));
    });
    document.body.appendChild(logBtn);
    
    console.log('🧪 デバッグテストボタンを追加しました');
}

// フォーカス管理
function setupFocusManagement() {
    console.log('🎯 フォーカス管理設定開始...');
    
    try {
        // モーダルボタン
        const closeBtn = document.querySelector('.close-btn');
        const cancelBtn = document.querySelector('.cancel-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', hideModal);
            console.log('✅ 閉じるボタンイベント設定完了');
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hideModal);
            console.log('✅ キャンセルボタンイベント設定完了');
        }
        
        // 🔥 重要: 店舗フォーム送信イベント
        if (storeForm) {
            storeForm.addEventListener('submit', handleStoreSubmit);
            console.log('✅ 店舗フォーム送信イベント設定完了');
        } else {
            console.error('❌ 店舗フォーム要素が見つかりません');
        }
        
        // モーダル外クリックで閉じる
        if (editModal) {
            editModal.addEventListener('click', function(e) {
                if (e.target === editModal) {
                    hideModal();
                }
            });
            console.log('✅ モーダル外クリックイベント設定完了');
        }
        
        console.log('✅ フォーカス管理設定完了');
        
    } catch (error) {
        console.error('❌ フォーカス管理設定エラー:', error);
    }
}

// 全体診断機能
function NICE_GALLERY_TEST() {
    console.log('🧪 簡単ギャラリーテスト開始');
    
    // 店舗編集モードでない場合は最初の店舗を編集
    if (!editingStoreId && currentStores.length > 0) {
        console.log('📝 テスト用に最初の店舗を編集モードに');
        editStore(currentStores[0].id);
        setTimeout(() => {
            console.log('⏰ 3秒後にギャラリー1番目のアップロードテスト');
            uploadImage('gallery', 0);
        }, 3000);
    } else if (editingStoreId) {
        console.log('📝 既に編集モード、ギャラリー1番目のアップロードテスト');
        uploadImage('gallery', 0);
    } else {
        console.log('❌ テスト不可：店舗データがありません');
        alert('テスト不可：店舗データがありません');
    }
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
    console.log('🔄 renderStores実行中...');
    console.log('現在の店舗数:', currentStores.length);
    console.log('currentStores内容:', currentStores);
    
    if (!storesList) {
        console.error('❌ storesListエレメントが見つかりません');
        return;
    }
    
    try {
        storesList.innerHTML = '';
        
        if (currentStores.length === 0) {
            console.log('⚠️ 店舗データが空です');
            storesList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">店舗データがありません</p>';
            return;
        }
        
        currentStores.forEach((store, index) => {
            try {
                console.log(`🏪 店舗${index + 1}を描画中:`, store.name);
                const storeCard = createStoreCard(store);
                storesList.appendChild(storeCard);
            } catch (error) {
                console.error(`❌ 店舗${index + 1}の描画エラー:`, error, store);
            }
        });
        
        console.log('✅ 店舗一覧の描画完了');
        
    } catch (error) {
        console.error('❌ renderStoresエラー:', error);
        storesList.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 20px;">店舗一覧の表示でエラーが発生しました</p>';
    }
}

function createStoreCard(store) {
    try {
        console.log('🏗️ 店舗カード作成中:', store.name);
        
        const card = document.createElement('div');
        card.className = 'store-card';
        
        // データの安全性チェック
        const safeName = store.name || '名前未設定';
        const safeDescription = store.description || '説明なし';
        const safePrice = store.price || '価格未設定';
        const safeImage = store.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center';
        const safeBadge = store.badge || '';
        const safeFeatures = Array.isArray(store.features) ? store.features : [];
        
        card.innerHTML = `
            <img src="${safeImage}" alt="${safeName}" class="store-image" onerror="this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center'">
            <div class="store-info">
                <div class="store-header">
                    <h3>${safeName}</h3>
                    ${safeBadge ? `<span class="badge">${safeBadge}</span>` : ''}
                </div>
                <p class="store-description">${safeDescription}</p>
                <div class="store-features">
                    ${safeFeatures.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="store-price">${safePrice}</div>
                <div class="store-actions">
                    <button onclick="editStore(${store.id})" class="edit-btn">編集</button>
                    <button onclick="deleteStore(${store.id})" class="delete-btn">削除</button>
                </div>
            </div>
        `;
        
        console.log('✅ 店舗カード作成完了:', safeName);
        return card;
        
    } catch (error) {
        console.error('❌ 店舗カード作成エラー:', error, store);
        
        // エラー時のフォールバック
        const errorCard = document.createElement('div');
        errorCard.className = 'store-card error-card';
        errorCard.innerHTML = `
            <div class="store-info">
                <h3>エラー: 店舗データの表示に失敗</h3>
                <p>店舗ID: ${store.id || '不明'}</p>
                <button onclick="deleteStore(${store.id || 0})" class="delete-btn">削除</button>
            </div>
        `;
        return errorCard;
    }
}

function editStore(id) {
    console.log('🖊️ editStore実行開始、店舗ID:', id);
    
    const store = currentStores.find(s => s.id === id);
    if (!store) {
        console.error('❌ 店舗が見つかりません:', id);
        showMessage('店舗が見つかりません', 'error');
        return;
    }

    console.log('🏪 編集対象店舗:', store);
    editingStoreId = id;
    
    // 現在の画像配列を初期化（5スロット）
    currentStoreImages = store.gallery ? [...store.gallery] : [];
    
    // 配列が5要素未満の場合は空文字で埋める
    while (currentStoreImages.length < 5) {
        currentStoreImages.push('');
    }
    
    console.log('📷 初期ギャラリー配列:', currentStoreImages);

    // フォームに値を設定
    document.getElementById('store-id').value = store.id;
    document.getElementById('store-name').value = store.name;
    document.getElementById('store-description').value = store.description;
    document.getElementById('store-features').value = store.features.join(', ');
    document.getElementById('store-price').value = store.price;
    document.getElementById('store-badge').value = store.badge;
    document.getElementById('main-image-url').value = store.image;
    
    // 営業時間の設定（デフォルト値: 20:00-02:00）
    document.getElementById('store-hours-start').value = store.businessHours?.start || '20:00';
    document.getElementById('store-hours-end').value = store.businessHours?.end || '02:00';
    
    // 定休日の設定
    const allDays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    const closedDaysIds = ['closed-sunday', 'closed-monday', 'closed-tuesday', 'closed-wednesday', 'closed-thursday', 'closed-friday', 'closed-saturday'];
    
    // まず全ての曜日チェックボックスをクリア
    closedDaysIds.forEach(id => {
        document.getElementById(id).checked = false;
    });
    
    // 店舗の定休日をチェック
    if (store.closedDays && Array.isArray(store.closedDays)) {
        allDays.forEach((day, index) => {
            if (store.closedDays.includes(day)) {
                document.getElementById(closedDaysIds[index]).checked = true;
            }
        });
    }

    updateGalleryPreview();
    showModal();
    
    console.log('✅ editStore完了');
}

function setMainImage(imageUrl) {
    document.getElementById('main-image-url').value = imageUrl;
    hideImageGallery();
}

function updateGalleryPreview() {
    console.log('🖼️ updateGalleryPreview実行開始');
    console.log('現在のcurrentStoreImages:', currentStoreImages);
    
    // currentStoreImagesが存在しない場合は初期化
    if (!currentStoreImages || !Array.isArray(currentStoreImages)) {
        console.log('⚠️ currentStoreImagesが無効なため初期化');
        currentStoreImages = ['', '', '', '', ''];
    }
    
    // 5スロット分の配列を確保
    while (currentStoreImages.length < 5) {
        currentStoreImages.push('');
    }
    
    const galleryPreview = document.getElementById('gallery-preview');
    if (!galleryPreview) {
        console.error('❌ gallery-previewエレメントが見つかりません');
        return;
    }
    
    galleryPreview.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'gallery-slot';
        slot.setAttribute('data-index', i);
        
        const imageUrl = currentStoreImages[i];
        console.log(`スロット${i}: "${imageUrl}"`);
        
        if (imageUrl && imageUrl.trim() !== '') {
            slot.innerHTML = `
                <img src="${imageUrl}" alt="ギャラリー画像 ${i + 1}" class="gallery-image">
                <button type="button" class="remove-gallery-btn" onclick="removeGalleryImage(${i})">×</button>
                <button type="button" class="upload-gallery-btn" onclick="uploadImage('gallery', ${i})">📷</button>
            `;
        } else {
            slot.innerHTML = `
                <div class="empty-slot">
                    <span>画像 ${i + 1}</span>
                    <button type="button" class="upload-gallery-btn" onclick="uploadImage('gallery', ${i})">📷 選択</button>
                </div>
            `;
        }
        
        galleryPreview.appendChild(slot);
    }
    
    console.log('✅ updateGalleryPreview完了');
}

function showImageGallery(type, index = 0) {
    console.log('🎭 showImageGallery実行:', { type, index });
    
    currentImageType = type;
    currentGalleryIndex = index;
    
    const galleryContent = document.getElementById('gallery-content');
    galleryContent.innerHTML = '';
    
    AVAILABLE_IMAGES.forEach(image => {
        const imageItem = document.createElement('div');
        imageItem.className = 'gallery-item';
        imageItem.innerHTML = `
            <img src="${image.url}" alt="${image.name}" onclick="selectImage('${image.url}')">
            <p>${image.name}</p>
        `;
        galleryContent.appendChild(imageItem);
    });
    
    imageGallery.style.display = 'flex';
    console.log('✅ 画像ギャラリーを表示しました');
}

function selectImage(imageUrl) {
    console.log('🖱️ selectImage実行:', { 
        imageUrl, 
        currentImageType, 
        currentGalleryIndex, 
        editingStoreId 
    });
    
    if (currentImageType === 'main') {
        setMainImage(imageUrl);
    } else if (currentImageType === 'gallery') {
        if (!currentStoreImages || !Array.isArray(currentStoreImages)) {
            console.log('⚠️ currentStoreImagesを初期化');
            currentStoreImages = ['', '', '', '', ''];
        }
        
        // 指定されたインデックスに画像URLを設定
        currentStoreImages[currentGalleryIndex] = imageUrl;
        console.log(`📷 ギャラリー${currentGalleryIndex}に画像設定:`, imageUrl);
        console.log('現在のcurrentStoreImages:', currentStoreImages);
        
        // プレビューを更新
        updateGalleryPreview();
        
        showMessage(`ギャラリー${currentGalleryIndex + 1}に画像を設定しました`, 'success');
    }
    
    hideImageGallery();
}

function removeGalleryImage(index) {
    console.log('🗑️ removeGalleryImage実行:', index);
    
    if (!currentStoreImages || !Array.isArray(currentStoreImages)) {
        console.log('⚠️ currentStoreImagesを初期化');
        currentStoreImages = ['', '', '', '', ''];
    }
    
    if (index >= 0 && index < currentStoreImages.length) {
        const removedImage = currentStoreImages[index];
        currentStoreImages[index] = '';
        console.log(`🗑️ スロット${index}から画像削除:`, removedImage);
        console.log('更新後のcurrentStoreImages:', currentStoreImages);
        
        updateGalleryPreview();
        showMessage(`ギャラリー${index + 1}の画像を削除しました`, 'success');
    } else {
        console.error('❌ 無効なインデックス:', index);
    }
}

function hideImageGallery() {
    imageGallery.style.display = 'none';
}

function deleteStore(id) {
    if (confirm('この店舗を削除しますか？')) {
        currentStores = currentStores.filter(store => store.id !== id);
        renderStores();
        saveStores();
        showMessage('店舗を削除しました', 'success');
    }
}

function showAddStoreModal() {
    editingStoreId = null;
    currentStoreImages = ['', '', '', '', ''];
    
    // フォームをリセット
    storeForm.reset();
    document.getElementById('store-id').value = '';
    
    updateGalleryPreview();
    showModal();
}

async function handleStoreSubmit(e) {
    e.preventDefault();
    
    console.log('💾 handleStoreSubmit実行開始');
    console.log('編集中店舗ID:', editingStoreId);
    console.log('フォーム要素:', e.target);
    
    try {
        // フォームデータを手動で収集（FormDataの代わり）
        const storeName = document.getElementById('store-name')?.value || '';
        const storeDescription = document.getElementById('store-description')?.value || '';
        const storePrice = document.getElementById('store-price')?.value || '';
        const storeBadge = document.getElementById('store-badge')?.value || '';
        const storeFeatures = document.getElementById('store-features')?.value || '';
        const storeImage = document.getElementById('main-image-url')?.value || '';
        
        console.log('📝 収集したフォームデータ:', {
            name: storeName,
            description: storeDescription,
            price: storePrice,
            badge: storeBadge,
            features: storeFeatures,
            image: storeImage
        });
        
        // 特徴を配列に変換
        const features = storeFeatures ? storeFeatures.split(',').map(f => f.trim()).filter(f => f) : [];
        
        // currentStoreImagesが正しく初期化されているか確認
        if (!currentStoreImages || !Array.isArray(currentStoreImages)) {
            console.log('⚠️ currentStoreImagesを初期化');
            currentStoreImages = ['', '', '', '', ''];
        }
        
        // 空の要素を除去してギャラリー配列を作成
        const gallery = currentStoreImages.filter(img => img && img.trim() !== '');
        
        // 営業時間の取得
        const businessHours = {
            start: document.getElementById('store-hours-start')?.value || '20:00',
            end: document.getElementById('store-hours-end')?.value || '02:00'
        };
        
        // 定休日の取得
        const closedDaysCheckboxes = document.querySelectorAll('input[name="closedDays"]:checked');
        const closedDays = Array.from(closedDaysCheckboxes).map(checkbox => checkbox.value);
        
        const storeData = {
            name: storeName,
            description: storeDescription,
            features: features,
            price: storePrice,
            badge: storeBadge,
            image: storeImage,
            gallery: gallery,
            businessHours: businessHours,
            closedDays: closedDays
        };
        
        console.log('📝 完成した店舗データ:', storeData);
        
        // 必須フィールドの検証
        if (!storeData.name || !storeData.description || !storeData.price) {
            showMessage('店舗名、説明、価格は必須項目です', 'error');
            return;
        }

        let savedStore = null;

        if (editingStoreId) {
            // 既存店舗の更新
            const index = currentStores.findIndex(store => store.id === editingStoreId);
            if (index !== -1) {
                savedStore = { ...currentStores[index], ...storeData };
                currentStores[index] = savedStore;
                console.log('✅ 既存店舗を更新しました:', savedStore.name);
            } else {
                console.error('❌ 編集対象の店舗が見つかりません');
                showMessage('編集対象の店舗が見つかりません', 'error');
                return;
            }
        } else {
            // 新規店舗の追加
            const newId = Math.max(...currentStores.map(s => s.id), 0) + 1;
            savedStore = { id: newId, ...storeData };
            currentStores.push(savedStore);
            console.log('✅ 新規店舗を追加しました:', savedStore.name);
        }

        if (savedStore) {
            // 自動保存を実行
            console.log('💾 保存処理開始...');
            const saveSuccess = await saveStore(savedStore);
            
            if (saveSuccess) {
                console.log('✅ 保存成功、画面を更新');
                renderStores();
                hideModal();
            } else {
                console.error('❌ 保存に失敗しました');
                showMessage('保存に失敗しました', 'error');
            }
        }
        
    } catch (error) {
        console.error('❌ handleStoreSubmitエラー:', error);
        showMessage('フォーム送信エラー: ' + error.message, 'error');
    }
    
    console.log('💾 handleStoreSubmit完了');
}

function handleSaveAll() {
    saveStores();
    showMessage('すべてのデータを保存しました', 'success');
}

function handleResetData() {
    if (confirm('すべてのデータをリセットしますか？この操作は取り消せません。')) {
        currentStores = [...DEFAULT_STORES];
        renderStores();
        saveStores();
        showMessage('データをリセットしました', 'success');
    }
}

function saveStores() {
    try {
        localStorage.setItem('nice_stores', JSON.stringify(currentStores));
        console.log('ローカルストレージに保存しました');
        
        // モバイル向け通知を送信
        notifyMobileDevices();
        
        // Supabaseにも保存を試行（自動）
        saveStoresToSupabase().then(success => {
            if (success) {
                console.log('✅ クラウド同期完了');
            } else {
                console.log('⚠️ クラウド同期失敗、ローカル保存は完了');
            }
        });
    } catch (error) {
        console.error('保存エラー:', error);
        showMessage('保存に失敗しました', 'error');
    }
}

// 単一店舗の保存（編集時の自動保存用）
async function saveStore(store) {
    console.log('💾 saveStore開始:', store.name);
    
    try {
        // 入力データの検証
        if (!store || !store.name) {
            throw new Error('無効な店舗データです');
        }
        
        // ローカルに保存
        console.log('💾 ローカルストレージに保存中...');
        
        const index = currentStores.findIndex(s => s.id === store.id);
        if (index !== -1) {
            currentStores[index] = store;
            console.log('✅ 既存店舗をローカル配列で更新');
        } else {
            currentStores.push(store);
            console.log('✅ 新規店舗をローカル配列に追加');
        }
        
        localStorage.setItem('nice_stores', JSON.stringify(currentStores));
        console.log('✅ ローカルストレージに保存完了');
        
        // Supabaseに自動保存
        console.log('☁️ Supabaseに保存を試行...');
        const cloudSaved = await saveStoreToSupabase(store);
        
        if (cloudSaved) {
            console.log('✅ クラウド保存成功');
            showMessage(`✅ ${store.name} をクラウドに保存しました`, 'success');
        } else {
            console.log('⚠️ クラウド保存失敗、ローカル保存のみ');
            showMessage(`💾 ${store.name} をローカルに保存しました（クラウド接続なし）`, 'info');
        }
        
        // モバイル向け通知
        console.log('📱 モバイルデバイスに通知送信...');
        notifyMobileDevices();
        
        console.log('✅ saveStore完了');
        return true;
        
    } catch (error) {
        console.error('❌ 店舗保存エラー:', error);
        showMessage('保存に失敗しました: ' + error.message, 'error');
        return false;
    }
}

// モバイルデバイスへの通知
function notifyMobileDevices() {
    // StorageEventを発火してモバイルに通知
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'nice_stores',
        oldValue: null,
        newValue: JSON.stringify(currentStores),
        url: window.location.href,
        storageArea: localStorage
    }));
    
    // モバイル向けの視覚的フィードバック
    const mobileNotification = document.createElement('div');
    mobileNotification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(45deg, #27ae60, #2ecc71);
        color: white;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
        z-index: 10001;
        box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
        animation: slideInRight 0.3s ease-out;
    `;
    mobileNotification.innerHTML = '📱 モバイル版に変更を通知しました';
    
    document.body.appendChild(mobileNotification);
    
    setTimeout(() => {
        mobileNotification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            mobileNotification.remove();
        }, 300);
    }, 2500);
    
    console.log('📱 モバイルデバイスに変更通知を送信しました');
}

// モバイル向けCSS アニメーションを追加
function addMobileAnimationStyles() {
    if (document.getElementById('mobile-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'mobile-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes slideDown {
            from {
                transform: translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// 初期化時にモバイル向けスタイルを追加
document.addEventListener('DOMContentLoaded', function() {
    addMobileAnimationStyles();
});

function showModal() {
    editModal.style.display = 'flex';
}

function hideModal() {
    editModal.style.display = 'none';
    editingStoreId = null;
    currentStoreImages = [];
}

function showMessage(message, type = 'success') {
    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // メッセージのスタイル
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#f44336';
    } else if (type === 'warning') {
        messageDiv.style.backgroundColor = '#ff9800';
    } else {
        messageDiv.style.backgroundColor = '#2196F3';
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
    }, 3000);
}

function uploadImage(type, index = 0) {
    console.log('📤 uploadImage実行開始:', { type, index, editingStoreId });
    
    // 編集中でない場合のチェック
    if (!editingStoreId) {
        console.error('❌ 店舗が編集モードではありません');
        showMessage('先に店舗を編集モードにしてください', 'error');
        return;
    }
    
    // currentStoreImagesの初期化チェック
    if (!currentStoreImages || !Array.isArray(currentStoreImages)) {
        console.log('⚠️ currentStoreImagesを初期化');
        currentStoreImages = ['', '', '', '', ''];
    }
    
    console.log('現在のcurrentStoreImages:', currentStoreImages);
    
    // ファイル入力要素が既に存在する場合は削除
    const existingInput = document.getElementById('image-upload-input');
    if (existingInput) {
        existingInput.remove();
    }
    
    // ファイル入力要素を作成
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'image-upload-input';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    console.log('📁 ファイル入力要素を作成しました');
    
    // アップロード処理のイベントハンドラー
    const handleUpload = async (event) => {
        console.log('📁 ファイル選択イベント発生');
        const file = event.target.files[0];
        
        if (!file) {
            console.log('❌ ファイルが選択されませんでした');
            return;
        }
        
        console.log('📁 選択されたファイル:', file.name, file.size, 'bytes');
        
        try {
            await handleFileUpload(event);
        } catch (error) {
            console.error('❌ アップロードエラー:', error);
            showMessage('画像のアップロードに失敗しました: ' + error.message, 'error');
        }
    };
    
    fileInput.addEventListener('change', handleUpload);
    document.body.appendChild(fileInput);
    
    // currentImageTypeとcurrentGalleryIndexを設定
    currentImageType = type;
    currentGalleryIndex = index;
    
    console.log('🎯 設定完了:', { currentImageType, currentGalleryIndex });
    
    // ファイル選択ダイアログを開く
    fileInput.click();
    
    console.log('📤 uploadImage実行完了');
}

async function handleFileUpload(event) {
    console.log('📤 handleFileUpload実行開始');
    
    const file = event.target.files[0];
    if (!file) {
        console.error('❌ ファイルが選択されていません');
        return;
    }
    
    console.log('📁 アップロード対象ファイル:', {
        name: file.name,
        size: file.size,
        type: file.type
    });
    
    // ファイルサイズチェック（10MB制限）
    if (file.size > 10 * 1024 * 1024) {
        showMessage('ファイルサイズは10MB以下にしてください', 'error');
        return;
    }
    
    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
        showMessage('画像ファイルを選択してください', 'error');
        return;
    }
    
    console.log('✅ ファイル検証通過');
    
    let imageUrl = null;
    
    try {
        // Supabaseアップロードを試行
        if (supabaseClient) {
            console.log('☁️ Supabaseアップロードを試行...');
            imageUrl = await handleSupabaseUpload(file);
        }
        
        // Supabaseアップロードに失敗した場合はローカル処理
        if (!imageUrl) {
            console.log('💾 ローカルアップロードにフォールバック');
            imageUrl = await handleLocalUpload(file);
        }
        
        if (imageUrl) {
            console.log('✅ アップロード成功:', imageUrl);
            
            if (currentImageType === 'main') {
                setMainImage(imageUrl);
                showMessage('メイン画像を設定しました', 'success');
            } else if (currentImageType === 'gallery') {
                // currentStoreImagesが正しく初期化されているか確認
                if (!currentStoreImages || !Array.isArray(currentStoreImages)) {
                    console.log('⚠️ currentStoreImagesを初期化');
                    currentStoreImages = ['', '', '', '', ''];
                }
                
                currentStoreImages[currentGalleryIndex] = imageUrl;
                console.log(`📷 ギャラリー${currentGalleryIndex}に画像設定:`, imageUrl);
                console.log('更新後のcurrentStoreImages:', currentStoreImages);
                
                updateGalleryPreview();
                showMessage(`ギャラリー${currentGalleryIndex + 1}に画像をアップロードしました`, 'success');
            }
        } else {
            throw new Error('画像URLの取得に失敗しました');
        }
        
    } catch (error) {
        console.error('❌ アップロードエラー:', error);
        showMessage('画像のアップロードに失敗しました: ' + error.message, 'error');
    }
    
    // ファイル入力要素を削除
    if (event.target) {
        event.target.remove();
    }
    
    console.log('📤 handleFileUpload実行完了');
}

async function handleSupabaseUpload(file) {
    try {
        console.log('☁️ Supabaseアップロード開始:', file.name);
        
        // ファイル名にタイムスタンプを追加してユニークにする
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `store-image-${timestamp}.${fileExtension}`;
        
        console.log('📁 Supabaseファイル名:', fileName);
        
        // Supabase Storageにアップロード
        const { data, error } = await supabaseClient.storage
            .from('nice-store-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) {
            console.error('☁️ Supabaseアップロードエラー:', error);
            throw error;
        }
        
        console.log('☁️ Supabaseアップロード成功:', data);
        
        // パブリックURLを取得
        const { data: urlData } = supabaseClient.storage
            .from('nice-store-images')
            .getPublicUrl(fileName);
        
        if (urlData && urlData.publicUrl) {
            console.log('✅ Supabase画像URL取得成功:', urlData.publicUrl);
            return urlData.publicUrl;
        } else {
            throw new Error('パブリックURLの取得に失敗しました');
        }
        
    } catch (error) {
        console.error('☁️ Supabaseアップロードエラー:', error);
        throw error;
    }
}

async function handleLocalUpload(file) {
    try {
        console.log('💾 ローカルアップロード開始:', file.name);
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const base64 = e.target.result;
                console.log('✅ ローカル画像変換成功, サイズ:', base64.length, '文字');
                resolve(base64);
            };
            
            reader.onerror = function(error) {
                console.error('💾 ローカル変換エラー:', error);
                reject(new Error('ファイルの読み込みに失敗しました'));
            };
            
            reader.readAsDataURL(file);
        });
        
    } catch (error) {
        console.error('💾 ローカルアップロードエラー:', error);
        throw error;
    }
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', initializeApp);