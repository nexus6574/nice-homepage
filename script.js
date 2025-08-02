// ハンバーガーメニューとスライダーの初期化（統合版のDOMContentLoadedに移行済み）

function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileMenuToggle || !navLinks) return;
    
    // メニューボタンのクリックイベント
    mobileMenuToggle.addEventListener('click', function() {
        const isActive = navLinks.classList.contains('active');
        
        // メニューの表示/非表示を切り替え
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        
        // ARIA属性の更新
        mobileMenuToggle.setAttribute('aria-expanded', !isActive);
        mobileMenuToggle.setAttribute('aria-label', 
            !isActive ? 'メニューを閉じる' : 'メニューを開く'
        );
    });
    
    // メニューリンクがクリックされたらメニューを閉じる
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.setAttribute('aria-label', 'メニューを開く');
        });
    });
    
    // ESCキーでメニューを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.setAttribute('aria-label', 'メニューを開く');
        }
    });
    
    // 画面サイズが変更されたときの処理
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.setAttribute('aria-label', 'メニューを開く');
        }
    });
}

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// フェードインアニメーション
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// ヘッダーの背景変更
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(39, 174, 96, 0.95)';
    } else {
        header.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
    }
});

// Supabase初期化状態
let supabaseDB = null;
let isSupabaseInitialized = false;

// Supabase初期化
async function initializeSupabaseFrontend() {
    try {
        console.log('🔧 フロントエンドSupabase初期化中...');
        
        // supabase-config.jsの初期化関数を使用
        if (typeof window.initializeSupabase === 'function') {
            const success = window.initializeSupabase();
            if (!success) {
                console.warn('⚠️ Supabase初期化失敗。ローカルモードで動作します。');
                return false;
            }
        } else {
            console.warn('⚠️ initializeSupabase関数が見つかりません');
            return false;
        }
        
        // SupabaseDBインスタンスを初期化
        if (typeof window.SupabaseDB !== 'undefined') {
            supabaseDB = new window.SupabaseDB();
            const dbSuccess = await supabaseDB.initialize();
            if (dbSuccess) {
                console.log('✅ フロントエンドSupabaseDB初期化成功');
                isSupabaseInitialized = true;
                return true;
            } else {
                console.warn('⚠️ SupabaseDB初期化失敗。ローカルモードで動作します。');
                return false;
            }
        } else {
            console.warn('⚠️ SupabaseDBクラスが見つかりません。ローカルモードで動作します。');
            return false;
        }
        
    } catch (error) {
        console.error('❌ フロントエンドSupabase初期化エラー:', error);
        return false;
    }
}

// 店舗データ管理（Supabase対応版）
async function loadStoreData() {
    console.log('loadStoreData: データ読み込み開始');
    
    // モバイル版での詳細ログ
    const isMobile = isMobileDevice();
    if (isMobile) {
        console.log('📱 モバイルデバイスでのデータ読み込み');
        console.log('📱 UserAgent:', navigator.userAgent.substring(0, 50) + '...');
        console.log('📱 画面サイズ:', window.innerWidth + 'x' + window.innerHeight);
    }
    
    // まずSupabaseからデータを読み込みを試みる
    if (isSupabaseInitialized && supabaseDB) {
        try {
            console.log('📥 Supabaseからデータ読み込み中...');
            const supabaseStores = await supabaseDB.loadStores();
            
            if (supabaseStores && supabaseStores.length > 0) {
                console.log('✅ Supabaseからデータを読み込み成功');
                console.log('店舗数:', supabaseStores.length);
                console.log('店舗データサンプル:', supabaseStores[0]?.name || 'なし');
                
                // IDフィールドの確認と自動追加
                const processedStores = ensureStoreIds(supabaseStores);
                
                // モバイル版での詳細データチェック
                if (isMobile) {
                    console.log('📱 モバイル版データ詳細確認:');
                    processedStores.forEach((store, index) => {
                        if (index < 3) { // 最初の3店舗のみ表示
                            console.log(`📱 店舗${index + 1}: ${store.name} (ID: ${store.id})`);
                            console.log(`    - 画像数: ${store.images?.length || 0}`);
                            console.log(`    - 画像URL例: ${store.images?.[0] ? store.images[0].substring(0, 50) + '...' : 'なし'}`);
                            console.log(`    - 営業時間: ${store.businessHours?.start || '未設定'} - ${store.businessHours?.end || '未設定'}`);
                            console.log(`    - 定休日: ${store.closedDays?.join('、') || '未設定'}`);
                        }
                    });
                }
                
                // Supabaseのデータを最新として保存
                localStorage.setItem('nice_stores', JSON.stringify(processedStores));
                
                if (isMobile) {
                    console.log('📱 ローカルストレージに保存完了');
                }
                
                return processedStores;
            }
        } catch (error) {
            console.error('❌ Supabaseデータ読み込みエラー:', error);
            if (isMobile) {
                console.error('📱 モバイル版でSupabaseエラー:', error.message);
            }
        }
    }
    
    // Supabaseが利用できない場合、LocalStorageからデータを読み込み
    console.log('📂 LocalStorageからデータを読み込み中...');
    const savedStores = localStorage.getItem('nice_stores');
    if (savedStores) {
        try {
            const parsedData = JSON.parse(savedStores);
            console.log('✅ LocalStorageからデータを読み込み成功');
            console.log('店舗数:', parsedData.length);
            console.log('店舗データサンプル:', parsedData[0]?.name || 'なし');
            
            // IDフィールドの確認と自動追加
            const processedStores = ensureStoreIds(parsedData);
            
            // 更新されたデータをローカルストレージに保存
            if (JSON.stringify(processedStores) !== JSON.stringify(parsedData)) {
                console.log('🔢 IDフィールドを追加して更新保存');
                localStorage.setItem('nice_stores', JSON.stringify(processedStores));
            }
            
            if (isMobile) {
                console.log('📱 モバイル版: ローカルストレージから復旧');
                console.log('📱 データ件数:', processedStores.length);
                // モバイル版でのデータ確認
                if (processedStores.length > 0 && processedStores[0].images?.length > 0) {
                    console.log('📱 ギャラリーデータ確認OK');
                } else {
                    console.log('📱 ⚠️ ギャラリーデータが不足 - 管理画面でデータ更新が必要');
                }
            }
            
            return processedStores;
        } catch (error) {
            console.error('❌ JSONパースエラー:', error);
            console.log('デフォルトデータにフォールバック');
            if (isMobile) {
                console.log('📱 モバイル版: JSONエラーでデフォルトデータ使用');
            }
            return getDefaultStoreData();
        }
    }
    
    console.log('⚠️ LocalStorageにデータなし - デフォルトデータを使用');
    if (isMobile) {
        console.log('📱 モバイル版: ローカルストレージが空 - 管理画面でデータ作成が必要');
    }
    return getDefaultStoreData();
}

// 店舗データにIDフィールドを確実に設定する関数
function ensureStoreIds(stores) {
    if (!stores || !Array.isArray(stores)) {
        return stores;
    }
    
    let hasChanged = false;
    const processedStores = stores.map((store, index) => {
        // IDフィールドがない、または無効な場合は自動設定
        if (!store.id || store.id === '' || store.id === null || store.id === undefined) {
            const newId = index + 1;
            console.log(`🔢 店舗 ${store.name}: IDを自動設定 (${newId})`);
            hasChanged = true;
            return {
                ...store,
                id: newId
            };
        }
        
        // 既存のIDが文字列の場合は数値に変換
        const numericId = parseInt(store.id);
        if (!isNaN(numericId) && store.id !== numericId) {
            console.log(`🔢 店舗 ${store.name}: IDを数値に統一 (${store.id} → ${numericId})`);
            hasChanged = true;
            return {
                ...store,
                id: numericId
            };
        }
        
        return store;
    });
    
    if (hasChanged) {
        console.log('✅ IDフィールドの自動追加・統一が完了しました');
        
        // モバイル版でIDが変更された場合の通知
        if (isMobileDevice()) {
            console.log('📱 モバイル版: 店舗IDが統一されました');
            const processedCount = processedStores.filter(store => store.id !== undefined).length;
            console.log(`📱 処理後の店舗数: ${processedCount}件`);
            
            // IDリストを表示（デバッグ用）
            processedStores.forEach((store, index) => {
                if (index < 5) { // 最初の5店舗のみ表示
                    console.log(`📱 店舗${index + 1}: ${store.name} (ID: ${store.id})`);
                }
            });
        }
    }
    
    return processedStores;
}

// デフォルトの店舗データ
function getDefaultStoreData() {
    return [
        {
            id: 1,
            name: "Premium Club TOKYO",
            image: "nice-storefront.jpg",
            price: "1,500円〜",
            description: "最高級のサービスと洗練された空間で特別な時間をお過ごしください。厳選されたキャストが心を込めておもてなしいたします。",
            features: ["VIP個室あり", "送迎サービス", "カラオケ完備", "高級シャンパン"],
            badge: "人気No.1",
            businessHours: { start: "20:00", end: "02:00" },
            closedDays: ["日曜日"]
        },
        {
            id: 2,
            name: "Club Elegance",
            image: "nice-storefront.jpg",
            price: "1,200円〜",
            description: "エレガントで落ち着いた雰囲気の中で、上品なキャストがお客様を優雅にお迎えいたします。",
            features: ["落ち着いた雰囲気", "上品なキャスト", "個室完備", "ワイン豊富"],
            badge: "上品さNo.1",
            businessHours: { start: "19:30", end: "01:30" },
            closedDays: ["月曜日"]
        },
        {
            id: 3,
            name: "Night Paradise",
            image: "nice-storefront.jpg",
            price: "1,000円〜",
            description: "夜の楽園をコンセプトにしたアットホームな空間で、楽しい時間をお過ごしください。",
            features: ["アットホーム", "リーズナブル", "イベント多数", "若いキャスト"],
            badge: "コスパNo.1",
            businessHours: { start: "20:00", end: "03:00" },
            closedDays: []
        },
        {
            id: 4,
            name: "Luxury Lounge",
            image: "nice-storefront.jpg",
            price: "2,000円〜",
            description: "ラグジュアリーな空間と最高級のサービスで、贅沢なひとときをお約束いたします。",
            features: ["最高級サービス", "豪華内装", "プレミアムドリンク", "VIPルーム"],
            badge: "高級志向",
            businessHours: { start: "19:00", end: "02:00" },
            closedDays: ["日曜日", "月曜日"]
        },
        {
            id: 5,
            name: "Royal Cabinet",
            image: "nice-storefront.jpg",
            price: "1,750円〜",
            description: "王室のような気品あふれる空間で、最上級のホスピタリティをご体験ください。",
            features: ["格調高い", "知的なキャスト", "プライベート空間", "高級酒豊富"],
            badge: "気品No.1",
            businessHours: { start: "19:30", end: "01:00" },
            closedDays: ["火曜日"]
        },
        {
            id: 6,
            name: "Diamond Club",
            image: "nice-storefront.jpg",
            price: "1,400円〜",
            description: "ダイヤモンドのように輝く特別な時間をお約束いたします。美しいキャストがお迎えします。",
            features: ["煌びやか", "美しいキャスト", "特別サービス", "記念日対応"],
            badge: "輝きNo.1",
            businessHours: { start: "20:30", end: "02:30" },
            closedDays: ["水曜日"]
        }
    ];
}

// 店舗一覧ページのデータ更新
async function updateCabaretListPage() {
    const storeData = await loadStoreData();
    if (!storeData || storeData.length === 0) return;
    
    const storeGrid = document.querySelector('.store-grid');
    if (!storeGrid) return;
    
    // 既存の内容をクリア
    storeGrid.innerHTML = '';
    
    // 新しいデータで店舗カードを生成
    storeData.forEach(store => {
        const storeCard = createStoreCard(store);
        storeGrid.appendChild(storeCard);
    });
    
    // フェードインアニメーションを再適用
    document.querySelectorAll('.store-card').forEach(el => {
        observer.observe(el);
    });
}

function createStoreCard(store) {
    const card = document.createElement('div');
    card.className = 'store-card fade-in';
    
    // 安全なフィーチャー処理
    const featuresHTML = (store.features && Array.isArray(store.features)) ? 
        store.features.map(feature => 
            `<span class="feature-tag">${feature}</span>`
        ).join('') : '';
    
    // メイン画像とギャラリー画像の処理を改善
    let galleryImages = [];
    
    // 1. メイン画像（store.image）を最優先
    if (store.image && store.image.trim() !== '') {
        galleryImages.push(store.image);
    }
    
    // 2. ギャラリー画像（store.images）を追加（重複を避ける）
    if (store.images && Array.isArray(store.images)) {
        store.images.forEach(img => {
            if (img && img.trim() !== '' && !galleryImages.includes(img)) {
                galleryImages.push(img);
            }
        });
    }
    
    // 3. フォールバック画像（画像が1つもない場合）
    if (galleryImages.length === 0) {
        galleryImages = ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop&crop=center'];
    }
    
    const hasMultipleImages = galleryImages.length > 1;
    
    // ギャラリー用のHTMLを生成
    const galleryHTML = galleryImages.map((img, index) => 
        `<img src="${img}" alt="${store.name} 店内 ${index + 1}" loading="lazy" 
             style="display: ${index === 0 ? 'block' : 'none'};" data-index="${index}">`
    ).join('');
    
    // インジケーターを生成（複数画像がある場合のみ）
    const indicatorHTML = hasMultipleImages ? 
        `<div class="gallery-indicators">
            ${galleryImages.map((_, index) => 
                `<span class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`
            ).join('')}
         </div>` : '';
    
    // 店舗のバッジ、価格のデフォルト値設定
    const badge = store.badge || (store.features && store.features.length > 0 ? store.features[0] : '店舗');
    const price = store.price || '要問合せ';
    
    card.innerHTML = `
        <div class="store-image">
            <div class="image-gallery">
                ${galleryHTML}
            </div>
            ${indicatorHTML}
            <div class="store-badge">${badge}</div>
            ${hasMultipleImages ? '<div class="gallery-info">📷 ' + galleryImages.length + '枚</div>' : ''}
        </div>
        <div class="store-info">
            <h3 class="store-name">${store.name}</h3>
            <div class="store-details">
                <div class="price-info">
                    <span class="price-label">料金</span>
                    <span class="price-value">${price}</span>
                </div>
            </div>
            <div class="store-features">
                ${featuresHTML}
            </div>
        </div>
        <div class="store-card-overlay">
            <div class="store-card-action">
                <span class="action-text">詳細を見る</span>
                <span class="action-icon">→</span>
            </div>
        </div>
    `;
    
    // ギャラリー機能を追加（複数画像がある場合）
    if (hasMultipleImages) {
        setupCardGallery(card, galleryImages);
    }
    
    // 改善されたクリック・タッチイベント処理
    setupStoreCardNavigation(card, store);
    
    // ホバーエフェクト（デスクトップのみ）
    if (!isMobileDevice()) {
        card.addEventListener('mouseenter', () => {
            const overlay = card.querySelector('.store-card-overlay');
            if (overlay) overlay.style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', () => {
            const overlay = card.querySelector('.store-card-overlay');
            if (overlay) overlay.style.opacity = '0';
        });
    }
    
    return card;
}

// 店舗カードのギャラリー機能セットアップ
function setupCardGallery(card, images) {
    let currentIndex = 0;
    let autoSlideInterval;
    
    const imageElements = card.querySelectorAll('.image-gallery img');
    const indicators = card.querySelectorAll('.gallery-indicators .indicator');
    
    // インジケータークリック・タッチでの画像切り替え
    indicators.forEach((indicator, index) => {
        // デスクトップ版：クリックイベント
        indicator.addEventListener('click', (e) => {
            e.stopPropagation(); // カード全体のクリックイベントを阻止
            showImage(index);
        });
        
        // モバイル版：タッチイベント（改善版）
        if (isMobileDevice()) {
            let touchStartTime = 0;
            
            indicator.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                e.preventDefault();
                touchStartTime = Date.now();
            }, { passive: false });
            
            indicator.addEventListener('touchend', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const touchDuration = Date.now() - touchStartTime;
                
                // 短いタップのみ有効（スワイプと区別）
                if (touchDuration < 300) {
                    showImage(index);
                    
                    // ビジュアルフィードバック
                    indicator.style.transform = 'scale(1.2)';
                    indicator.style.transition = 'transform 0.1s ease';
                    setTimeout(() => {
                        indicator.style.transform = '';
                        indicator.style.transition = '';
                    }, 150);
                }
            }, { passive: false });
        }
    });
    
    // 画像表示関数
    function showImage(index) {
        // 現在の画像とインジケーターを非アクティブに
        imageElements.forEach(img => img.style.display = 'none');
        indicators.forEach(ind => ind.classList.remove('active'));
        
        // 新しい画像とインジケーターをアクティブに
        if (imageElements[index]) {
            imageElements[index].style.display = 'block';
        }
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }
        
        currentIndex = index;
    }
    
    // 自動スライドショー開始
    function startAutoSlide() {
        if (images.length <= 1) return;
        
        autoSlideInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }, 3000); // 3秒間隔
    }
    
    // 自動スライドショー停止
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }
    
    // ホバー時の動作（デスクトップ）
    card.addEventListener('mouseenter', () => {
        if (!isMobileDevice()) {
            startAutoSlide();
        }
    });
    
    card.addEventListener('mouseleave', () => {
        if (!isMobileDevice()) {
            stopAutoSlide();
            showImage(0); // 最初の画像に戻す
        }
    });
    
    // モバイル版でのタッチ操作（改善版）
    if (isMobileDevice()) {
        let touchStartTime = 0;
        let isLongPress = false;
        
        card.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            isLongPress = false;
            
            // 長押し検出用タイマー
            setTimeout(() => {
                if (Date.now() - touchStartTime >= 500) {
                    isLongPress = true;
                }
            }, 500);
        }, { passive: true });
        
        card.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            
            // 長押し（500ms以上）でギャラリー自動スライド開始/停止
            if (isLongPress) {
                e.preventDefault();
                e.stopPropagation();
                
                if (autoSlideInterval) {
                    stopAutoSlide();
                    showImage(0);
                    
                    // フィードバック表示
                    showMobileFeedback(card, 'スライドショー停止 ⏸️');
                } else {
                    startAutoSlide();
                    
                    // フィードバック表示
                    showMobileFeedback(card, 'スライドショー開始 ▶️');
                }
            }
        }, { passive: false });
    }
}

// 🔗 店舗カードのナビゲーション設定（パソコン版強化）
function setupStoreCardNavigation(card, store) {
    console.log('🔗 店舗カードナビゲーション設定:', store.name);
    
    // IDの確保と検証
    let storeId = store.id;
    if (!storeId || storeId === '' || storeId === null || storeId === undefined) {
        console.warn('⚠️ 店舗IDが未設定:', store.name);
        storeId = generateStoreId(store.name);
        console.log('🔧 生成されたID:', storeId);
    }
    
    // パソコン版での強化されたクリック処理
    if (window.innerWidth > 768) {
        console.log('🖥️ パソコン版クリックイベント設定:', store.name);
        
        // クリックイベント
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖥️ パソコン版店舗カードクリック:', {
                storeName: store.name,
                storeId: storeId,
                clickTarget: e.target
            });
            
            // インジケーターのクリックは無視（ギャラリー切り替え用）
            if (e.target.classList.contains('indicator')) {
                console.log('🖥️ インジケータークリックのため無視');
                return;
            }
            
            navigateToStoreDetail(store);
        });
        
        // ダブルクリック防止
        card.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        // カーソルポインター設定
        card.style.cursor = 'pointer';
        
    } else {
        // モバイル版のタッチ処理
        console.log('📱 モバイル版タッチイベント設定:', store.name);
        
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        
        card.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            
            console.log('📱 タッチ開始:', store.name);
        }, { passive: false });
        
        card.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            // タッチの移動距離を計算
            const deltaX = Math.abs(touchEndX - touchStartX);
            const deltaY = Math.abs(touchEndY - touchStartY);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            console.log('📱 タッチ終了:', {
                storeName: store.name,
                duration: touchDuration,
                distance: distance,
                target: e.target
            });
            
            // インジケーターのタッチは無視
            if (e.target.classList.contains('indicator')) {
                console.log('📱 インジケータータッチのため無視');
                return;
            }
            
            // 短いタップで移動距離が少ない場合のみ詳細ページに遷移
            if (touchDuration < 500 && distance < 30) {
                console.log('📱 有効なタップ検出 - 店舗詳細に遷移');
                navigateToStoreDetail(store);
            } else {
                console.log('📱 無効なタップ（スワイプまたは長押し）');
            }
        }, { passive: false });
    }
    
    // キーボードナビゲーション（アクセシビリティ）
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${store.name}の詳細を見る`);
    
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            console.log('⌨️ キーボードナビゲーション:', store.name);
            navigateToStoreDetail(store);
        }
    });
    
    console.log('✅ 店舗カードナビゲーション設定完了:', store.name);
}

// モバイルデバイス判定関数
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768 ||
           ('ontouchstart' in window);
}

// モバイル版データ同期の強化
function forceDataRefreshOnMobile() {
    if (isMobileDevice()) {
        console.log('📱 モバイル版でデータ強制更新');
        
        // キャッシュクリア
        localStorage.removeItem('nice_stores_cache_timestamp');
        
        // 強制的にデータを再読み込み
        setTimeout(async () => {
            try {
                const freshData = await loadStoreData();
                console.log(`📱 モバイル版データ更新完了: ${freshData?.length || 0}件`);
                
                // データの整合性チェック
                if (freshData && freshData.length > 0) {
                    const validIds = freshData.filter(store => store.id !== undefined && store.id !== null);
                    console.log(`📱 有効なIDを持つ店舗: ${validIds.length}/${freshData.length}件`);
                    
                    // モバイル版特有のチェック
                    const mobileTestResult = validateMobileStoreData(freshData);
                    if (mobileTestResult.isValid) {
                        console.log('📱 モバイル版データ検証: ✅ 正常');
                    } else {
                        console.log('📱 モバイル版データ検証: ⚠️ 問題あり:', mobileTestResult.issues);
                    }
                }
                
                // 店舗一覧ページの場合は即座に更新
                if (window.location.pathname.includes('cabaret-list.html')) {
                    updateCabaretListPage();
                }
                
                // メインページのスライダーも更新
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    updateMainPageSlider();
                }
                
            } catch (error) {
                console.error('📱 モバイル版データ更新エラー:', error);
            }
        }, 1000);
    }
}

// モバイル版店舗データ検証
function validateMobileStoreData(stores) {
    const result = {
        isValid: true,
        issues: []
    };
    
    if (!stores || !Array.isArray(stores)) {
        result.isValid = false;
        result.issues.push('店舗データが配列ではありません');
        return result;
    }
    
    stores.forEach((store, index) => {
        // ID検証
        if (!store.id || store.id === '' || store.id === null || store.id === undefined) {
            result.issues.push(`店舗${index + 1}(${store.name}): IDが未設定`);
        }
        
        // 名前検証
        if (!store.name || store.name.trim() === '') {
            result.issues.push(`店舗${index + 1}: 名前が未設定`);
        }
        
        // 画像検証
        if (!store.image || store.image.trim() === '') {
            result.issues.push(`店舗${index + 1}(${store.name}): メイン画像が未設定`);
        }
    });
    
    if (result.issues.length > 0) {
        result.isValid = false;
    }
    
    return result;
}

// モバイル版フィードバック表示
function showMobileFeedback(element, message) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: bold;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
    `;
    
    element.style.position = 'relative';
    element.appendChild(feedback);
    
    // フェードイン
    setTimeout(() => {
        feedback.style.opacity = '1';
    }, 10);
    
    // フェードアウトして削除
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 200);
    }, 1500);
}

// モバイル版ナビゲーションフィードバック
function showMobileNavigationFeedback(card, storeName) {
    const feedback = document.createElement('div');
    feedback.textContent = `${storeName}の詳細へ 🔗`;
    feedback.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(46, 204, 113, 0.95);
        color: white;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
        text-align: center;
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;
    
    card.style.position = 'relative';
    card.appendChild(feedback);
    
    // フェードイン
    setTimeout(() => {
        feedback.style.opacity = '1';
        feedback.style.transform = 'translate(-50%, -50%) scale(1.05)';
    }, 10);
    
    // フェードアウトして削除
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transform = 'translate(-50%, -50%) scale(0.95)';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 200);
    }, 1000);
}

// 店舗詳細ページへのナビゲーション（統一版 - 数値IDを使用）
function navigateToStoreDetail(store) {
    console.log('🔗 navigateToStoreDetail:', store.name);
    
    // IDの存在確認と修正
    let storeId = store.id;
    if (!storeId || storeId === '' || storeId === null || storeId === undefined) {
        console.warn('⚠️ 店舗IDが未設定 - 名前ベースのIDを生成:', store.name);
        storeId = generateStoreId(store.name);
    }
    
    // 確実に数値IDを使用（店舗詳細ページでの検索と統一）
    let finalId = storeId;
    
    // 数値でない場合は数値に変換を試行
    const numericId = parseInt(storeId);
    if (!isNaN(numericId)) {
        finalId = numericId;
    }
    
    const detailUrl = `store-detail.html?id=${finalId}`;
    
    console.log('🔗 生成されたリンク:', {
        storeName: store.name,
        originalId: store.id,
        finalId: finalId,
        detailUrl: detailUrl
    });
    
    // モバイル版での追加ログ
    if (isMobileDevice()) {
        console.log('📱 モバイル版店舗詳細遷移:', {
            currentPage: window.location.pathname,
            targetUrl: detailUrl,
            storeData: {
                name: store.name,
                originalId: store.id,
                finalId: finalId
            }
        });
        
        // モバイル版のローカルストレージ状態を確認
        const savedStores = localStorage.getItem('nice_stores');
        if (savedStores) {
            try {
                const stores = JSON.parse(savedStores);
                const targetStore = stores.find(s => s.id == finalId || s.id === finalId);
                if (targetStore) {
                    console.log('📱 ローカルストレージで対象店舗確認:', targetStore.name);
                } else {
                    console.warn('📱 ローカルストレージで対象店舗が見つかりません');
                    console.log('📱 利用可能な店舗ID:', stores.map(s => s.id));
                }
            } catch (error) {
                console.error('📱 ローカルストレージ確認エラー:', error);
            }
        } else {
            console.warn('📱 ローカルストレージが空です');
        }
    }
    
    // ページ遷移
    try {
        window.location.href = detailUrl;
    } catch (error) {
        console.error('❌ ページ遷移エラー:', error);
        
        // フォールバック遷移
        console.log('🔄 フォールバック遷移を試行');
        window.location.assign(detailUrl);
    }
}

// 店舗名からIDを生成（日本語名を安全なIDに変換）
function generateStoreId(storeName) {
    return storeName
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '')
        .toLowerCase();
}

// メインページのスライダー更新（改善されたタッチイベント付き）
async function updateMainPageSlider() {
    const storeData = await loadStoreData();
    if (!storeData || storeData.length === 0) return;
    
    const slider = document.querySelector('.slider');
    const dots = document.querySelector('.slider-dots');
    
    if (!slider || !dots) return;
    
    // 既存のスライドを削除
    slider.innerHTML = '';
    dots.innerHTML = '';
    
    // 新しいデータでスライドを生成（最大5つ）
    const slidesToShow = storeData.slice(0, 5);
    
    slidesToShow.forEach((store, index) => {
        // 店舗データのIDフィールドを確認・修正
        if (!store.id || store.id === '' || store.id === null || store.id === undefined) {
            store.id = index + 1;
            console.log(`🔢 スライダー: 店舗 ${store.name} にID ${store.id} を設定`);
        }
        
        // スライド作成
        const slide = document.createElement('div');
        slide.className = index === 0 ? 'slide active' : 'slide';
        slide.innerHTML = `
            <img src="${store.image}" alt="${store.name} 店内" loading="lazy">
            <div class="slide-content">
                <h3>${store.name}</h3>
                <span class="price">料金：${store.price}</span>
            </div>
            <div class="slide-overlay">
                <div class="slide-action">
                    <span class="action-text">詳細を見る</span>
                    <span class="action-icon">→</span>
                </div>
            </div>
        `;
        
        // モバイル版でのクリック処理を改善（統一版）
        setupSlideNavigation(slide, store);
        
        slider.appendChild(slide);
        
        // ドット作成
        const dot = document.createElement('span');
        dot.className = index === 0 ? 'dot active' : 'dot';
        dot.setAttribute('data-slide', index);
        dots.appendChild(dot);
    });
    
    // スライダー機能を再初期化
    setTimeout(() => {
        console.log('スライダーを再初期化します');
        initializeSlider();
    }, 200);
}

// スライドのナビゲーション処理（店舗カードと統一）
function setupSlideNavigation(slide, store) {
    slide.style.cursor = 'pointer';
    
    // タッチ状態管理
    let touchState = {
        startTime: 0,
        startX: 0,
        startY: 0,
        hasMoved: false,
        isLongPress: false
    };
    
    // モバイル版でのタッチイベント
    if (isMobileDevice()) {
        // タッチスタート（モバイル）
        slide.addEventListener('touchstart', function(e) {
            const touch = e.touches[0];
            touchState.startTime = Date.now();
            touchState.startX = touch.clientX;
            touchState.startY = touch.clientY;
            touchState.hasMoved = false;
            
            // 自動スライドを一時停止
            if (sliderState.autoSlideInterval) {
                clearInterval(sliderState.autoSlideInterval);
                sliderState.autoSlideInterval = null;
            }
            
            console.log('📱 スライダータッチ開始:', store.name);
        }, { passive: true });
        
        // タッチ移動（スワイプ検出）
        slide.addEventListener('touchmove', function(e) {
            if (touchState.startTime === 0) return;
            
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchState.startX);
            const deltaY = Math.abs(touch.clientY - touchState.startY);
            
            if (deltaX > 10 || deltaY > 10) {
                touchState.hasMoved = true;
            }
        }, { passive: true });
        
        // タッチエンド（モバイル）
        slide.addEventListener('touchend', function(e) {
            if (touchState.startTime === 0) return;
            
            const touchDuration = Date.now() - touchState.startTime;
            
            // スワイプではなく、短時間のタップの場合のみナビゲート
            if (!touchState.hasMoved && touchDuration < 500) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('📱 スライダータップで店舗詳細へ:', {
                    storeName: store.name,
                    storeId: store.id,
                    link: `store-detail.html?id=${store.id}`
                });
                
                // ビジュアルフィードバック
                showMobileNavigationFeedback(slide, store.name);
                
                // 店舗詳細ページに遷移
                setTimeout(() => {
                    navigateToStoreDetail(store);
                }, 200);
                return;
            }
            
            // 自動スライドを再開（遅延）
            setTimeout(() => {
                if (sliderState.isInitialized && !sliderState.autoSlideInterval) {
                    sliderState.autoSlideInterval = setInterval(() => {
                        if (!sliderState.isTransitioning) {
                            const slides = document.querySelectorAll('.slide');
                            if (slides.length > 1) {
                                sliderState.currentSlide = (sliderState.currentSlide + 1) % slides.length;
                                const slider = document.querySelector('.slider');
                                if (slider) {
                                    slider.style.transform = `translateX(-${sliderState.currentSlide * 100}%)`;
                                }
                                const dots = document.querySelectorAll('.dot');
                                dots.forEach((dot, i) => {
                                    dot.classList.toggle('active', i === sliderState.currentSlide);
                                });
                            }
                        }
                    }, 5000);
                }
            }, 2000);
            
            // タッチ状態をリセット
            touchState.startTime = 0;
            
        }, { passive: false });
        
    } else {
        // デスクトップ版のクリックイベント
        slide.addEventListener('click', function(e) {
            console.log('🖱️ スライダークリック（デスクトップ）:', {
                storeName: store.name,
                storeId: store.id,
                link: `store-detail.html?id=${store.id}`
            });
            
            // 数値IDを使用してリンク生成
            navigateToStoreDetail(store);
        });
    }
}

// グローバルスライダー変数
let sliderState = {
    currentSlide: 0,
    isTransitioning: false,
    autoSlideInterval: null,
    isInitialized: false
};

// スライダー初期化関数
function initializeSlider() {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    
    if (!slider || !slides.length) {
        console.log('スライダー要素が見つかりません');
        return;
    }

    // 既に初期化済みの場合はクリーンアップ
    if (sliderState.isInitialized) {
        cleanupSlider();
    }

    // スライダーの位置を更新
    function updateSliderPosition() {
        if (slider) {
            slider.style.transform = `translateX(-${sliderState.currentSlide * 100}%)`;
        }
    }

    // ドットの状態を更新
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === sliderState.currentSlide);
        });
    }

    // 次のスライドに移動
    function nextSlide() {
        if (sliderState.isTransitioning) return;
        sliderState.isTransitioning = true;
        
        sliderState.currentSlide = (sliderState.currentSlide + 1) % slides.length;
        updateSliderPosition();
        updateDots();
        
        setTimeout(() => {
            sliderState.isTransitioning = false;
        }, 500);
    }

    // 前のスライドに移動
    function prevSlide() {
        if (sliderState.isTransitioning) return;
        sliderState.isTransitioning = true;
        
        sliderState.currentSlide = (sliderState.currentSlide - 1 + slides.length) % slides.length;
        updateSliderPosition();
        updateDots();
        
        setTimeout(() => {
            sliderState.isTransitioning = false;
        }, 500);
    }

    // 指定したスライドに移動
    function goToSlide(slideIndex) {
        if (sliderState.isTransitioning || slideIndex === sliderState.currentSlide) return;
        sliderState.isTransitioning = true;
        
        sliderState.currentSlide = slideIndex;
        updateSliderPosition();
        updateDots();
        
        setTimeout(() => {
            sliderState.isTransitioning = false;
        }, 500);
    }

    // 自動スライド
    function startAutoSlide() {
        if (sliderState.autoSlideInterval) {
            clearInterval(sliderState.autoSlideInterval);
        }
        sliderState.autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        if (sliderState.autoSlideInterval) {
            clearInterval(sliderState.autoSlideInterval);
            sliderState.autoSlideInterval = null;
        }
    }

    // イベントリスナーの設定
    if (nextBtn) {
        nextBtn.onclick = function(e) {
            e.preventDefault();
            console.log('次へボタンがクリックされました');
            nextSlide();
        };
    }
    
    if (prevBtn) {
        prevBtn.onclick = function(e) {
            e.preventDefault();
            console.log('前へボタンがクリックされました');
            prevSlide();
        };
    }

    // ドットクリックイベント
    dots.forEach((dot, index) => {
        dot.onclick = function(e) {
            e.preventDefault();
            console.log(`ドット${index}がクリックされました`);
            goToSlide(index);
        };
    });

    // スライダーコンテナのイベント
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        // マウスイベント
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);

        // タッチスワイプ対応
        let startX = 0;
        let endX = 0;

        sliderContainer.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            stopAutoSlide();
        }, { passive: true });

        sliderContainer.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
            startAutoSlide();
        }, { passive: true });

        function handleSwipe() {
            const threshold = 50;
            const diff = startX - endX;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }
    }

    // 初期化完了
    sliderState.currentSlide = 0;
    updateSliderPosition();
    updateDots();
    startAutoSlide();
    sliderState.isInitialized = true;
    
    console.log('スライダーが初期化されました');
}

// スライダーのクリーンアップ
function cleanupSlider() {
    if (sliderState.autoSlideInterval) {
        clearInterval(sliderState.autoSlideInterval);
        sliderState.autoSlideInterval = null;
    }
    sliderState.isInitialized = false;
}

// ページ読み込み時にスライダーを初期化
window.addEventListener('load', async function() {
    console.log('ページ読み込み完了 - 初期化開始');
    
    // モバイル版の詳細初期化
    if (isMobileDevice()) {
        console.log('📱 モバイル版初期化開始');
        // initializeMobileDebugFeatures(); // セキュリティのため無効化
    }
    
    // Supabaseを初期化
    await initializeSupabaseFrontend();
    
    // データを読み込み
    const storeData = await loadStoreData();
    console.log('✅ 店舗データ読み込み完了:', storeData.length, '件');
    
    // メインページの場合はスライダーを更新
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '/NICE/') {
        console.log('メインページを検出 - スライダー更新中...');
        await updateMainPageSlider();
    }
    
    // 店舗一覧ページの場合は店舗リストを更新
    if (window.location.pathname.includes('cabaret-list.html')) {
        console.log('店舗一覧ページを検出 - 店舗リスト更新中...');
        await updateCabaretListPage();
        
        // モバイル版でのリスト更新確認
        if (isMobileDevice()) {
            setTimeout(() => {
                validateMobileStoreList();
            }, 1000);
        }
    }
    
    // 管理画面リンクを追加（開発用） - セキュリティのため無効化
    // addAdminLink();
    
    console.log('🎉 フロントエンド初期化完了');
});

// モバイル版デバッグ機能初期化
function initializeMobileDebugFeatures() {
    console.log('📱 モバイル版デバッグ機能を初期化');
    
    // デバッグ情報収集
    const debugInfo = {
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio || 1,
        touchSupport: 'ontouchstart' in window,
        orientation: window.orientation || 'unknown',
        currentPage: window.location.pathname,
        timestamp: new Date().toISOString()
    };
    
    console.log('📱 モバイル環境情報:', debugInfo);
    
    // パフォーマンス監視
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = {
                    loadTime: Math.round(performance.now()),
                    domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                    pageLoad: performance.timing.loadEventEnd - performance.timing.navigationStart
                };
                console.log('📱 パフォーマンス情報:', perfData);
            }, 1000);
        });
    }
    
    // モバイル専用のエラーハンドリング
    window.addEventListener('error', function(e) {
        console.error('📱 モバイル版エラー:', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            stack: e.error?.stack
        });
    });
    
    // ビューポート変更監視
    window.addEventListener('resize', debounce(() => {
        console.log('📱 ビューポート変更:', `${window.innerWidth}x${window.innerHeight}`);
    }, 500));
    
    // オリエンテーション変更監視
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            console.log('📱 オリエンテーション変更:', window.orientation || 'unknown');
            
            // オリエンテーション変更後のデータ再検証
            if (window.location.pathname.includes('cabaret-list.html')) {
                validateMobileStoreList();
            }
        }, 500);
    });
}

// モバイル版店舗リスト検証
function validateMobileStoreList() {
    console.log('📱 モバイル版店舗リスト検証開始');
    
    const storeCards = document.querySelectorAll('.store-card');
    const storeGrid = document.querySelector('.store-grid');
    
    const validation = {
        storeGridExists: !!storeGrid,
        totalCards: storeCards.length,
        cardsWithImages: 0,
        cardsWithOverlays: 0,
        cardsWithValidIds: 0,
        touchEventsAttached: 0
    };
    
    storeCards.forEach((card, index) => {
        // 画像チェック
        const images = card.querySelectorAll('img');
        if (images.length > 0) {
            validation.cardsWithImages++;
        }
        
        // オーバーレイチェック
        const overlay = card.querySelector('.store-card-overlay');
        if (overlay) {
            validation.cardsWithOverlays++;
        }
        
        // タッチイベントチェック（間接的）
        const hasPointerEvents = card.style.cursor === 'pointer' || 
                                getComputedStyle(card).cursor === 'pointer';
        if (hasPointerEvents) {
            validation.touchEventsAttached++;
        }
        
        // ID検証のための店舗名取得
        const storeName = card.querySelector('.store-name');
        if (storeName) {
            console.log(`📱 店舗カード${index + 1}: ${storeName.textContent}`);
        }
    });
    
    console.log('📱 検証結果:', validation);
    
    // 問題がある場合の警告
    if (validation.totalCards === 0) {
        console.warn('⚠️ 店舗カードが1つも見つかりません');
        showMobileValidationMessage('店舗データが見つかりません', 'warning');
    } else if (validation.cardsWithOverlays < validation.totalCards) {
        console.warn('⚠️ 一部の店舗カードにオーバーレイがありません');
        showMobileValidationMessage('一部の店舗カードに問題があります', 'warning');
    } else {
        console.log('✅ モバイル版店舗リスト検証完了');
        showMobileValidationMessage(`${validation.totalCards}件の店舗が正常に表示されています`, 'success');
    }
    
    return validation;
}

// モバイル版検証メッセージ表示
function showMobileValidationMessage(message, type = 'info') {
    if (window.innerWidth > 768) return; // モバイルのみ
    
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px 15px;
        border-radius: 15px;
        font-size: 11px;
        font-weight: bold;
        z-index: 10000;
        max-width: 80%;
        text-align: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    `;
    
    // 種類に応じて色を設定
    if (type === 'success') {
        messageDiv.style.background = 'rgba(46, 204, 113, 0.9)';
        messageDiv.style.color = 'white';
    } else if (type === 'warning') {
        messageDiv.style.background = 'rgba(241, 196, 15, 0.9)';
        messageDiv.style.color = '#2c3e50';
    } else if (type === 'error') {
        messageDiv.style.background = 'rgba(231, 76, 60, 0.9)';
        messageDiv.style.color = 'white';
    } else {
        messageDiv.style.background = 'rgba(52, 152, 219, 0.9)';
        messageDiv.style.color = 'white';
    }
    
    document.body.appendChild(messageDiv);
    
    // フェードイン
    setTimeout(() => {
        messageDiv.style.opacity = '1';
    }, 10);
    
    // フェードアウトして削除
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, 3000);
}

// デバウンス関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 管理画面へのリンクを追加（デバッグ用） - セキュリティのため無効化
// function addAdminLink() {
//     if (window.location.pathname.includes('admin.html')) return;
//     
//     const adminLink = document.createElement('div');
//     adminLink.style.cssText = `
//         position: fixed;
//         bottom: 20px;
//         right: 20px;
//         z-index: 1000;
//         background: linear-gradient(45deg, #e74c3c, #c0392b);
//         color: white;
//         padding: 10px 15px;
//         border-radius: 25px;
//         font-size: 12px;
//         font-weight: bold;
//         box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
//         cursor: pointer;
//         transition: all 0.3s ease;
//         text-decoration: none;
//         display: inline-block;
//     `;
//     adminLink.innerHTML = '⚙️ 管理画面';
//     adminLink.onclick = () => window.open('admin.html', '_blank');
//     
//     adminLink.addEventListener('mouseenter', function() {
//         this.style.transform = 'translateY(-3px)';
//         this.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.6)';
//     });
//     
//     adminLink.addEventListener('mouseleave', function() {
//         this.style.transform = 'translateY(0)';
//         this.style.boxShadow = '0 5px 15px rgba(231, 76, 60, 0.4)';
//     });
//     
//     document.body.appendChild(adminLink);
// }

// ページ可視性変更時にデータをチェック（タブ切り替え時など）
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('ページが再表示されました');
    }
});

// loadStoreData関数をグローバルに公開（store-detail.jsから使用するため）
window.loadStoreData = loadStoreData;

// モバイル版店舗詳細遷移のテスト関数（デバッグ用） - セキュリティのため無効化
// window.testMobileStoreNavigation = function(storeIndex = 0) {
//     console.log('📱 モバイル版店舗遷移テスト開始');
//     
//     const storeCards = document.querySelectorAll('.store-card');
//     if (storeCards.length === 0) {
//         console.error('❌ 店舗カードが見つかりません');
//         return;
//     }
//     
//     const targetCard = storeCards[storeIndex];
//     if (!targetCard) {
//         console.error(`❌ インデックス ${storeIndex} の店舗カードが見つかりません`);
//         return;
//     }
//     
//     const storeName = targetCard.querySelector('.store-name')?.textContent || 'Unknown';
//     console.log(`📱 テスト対象店舗: ${storeName}`);
//     
//     // クリックイベントをシミュレート
//     const overlay = targetCard.querySelector('.store-card-overlay');
//     if (overlay) {
//         const event = new Event('click', { bubbles: true, cancelable: true });
//         overlay.dispatchEvent(event);
//         console.log('📱 クリックイベントをシミュレートしました');
//     } else {
//         console.error('❌ オーバーレイが見つかりません');
//     }
// };

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ページ読み込み完了 - 初期化開始');
    
    // URLパラメータを確認して緊急モードを判定
    const urlParams = new URLSearchParams(window.location.search);
    const isEmergencyMode = urlParams.get('emergency') === '1';
    const isDebugMode = urlParams.get('debug') === '1';
    
    if (isEmergencyMode) {
        console.log('🚨 緊急モードが有効化されました');
        showEmergencyNotification('緊急モード: Supabaseから直接データを読み込みます');
    }
    
    // デバッグパネルはセキュリティのため無効化
    // if (isDebugMode) {
    //     console.log('🔍 デバッグモードが有効化されました');
    //     addDebugPanel();
    // }
    
    // 基本機能の初期化
    initializeMobileMenu();
    initializeFadeInAnimation();
    initializeHeaderBackground();
    
    // スライダーの初期化
    setTimeout(() => {
        console.log('ページ読み込み完了 - スライダーを初期化します');
        initializeSlider();
    }, 300);
    
    // Supabaseとデータ読み込み
    initializeSupabaseFrontend().then(() => {
        // 緊急モードの場合はSupabaseから直接読み込み
        if (isEmergencyMode) {
            loadStoreDataEmergency().then(stores => {
                if (stores && stores.length > 0) {
                    updatePageContent(stores);
                    showEmergencyNotification(`緊急モード: ${stores.length}件のデータを読み込みました`, 'success');
                } else {
                    showEmergencyNotification('緊急モード: データが見つかりません', 'error');
                }
            });
        } else {
            // 通常モード
            loadStoreData().then(stores => {
                if (stores && stores.length > 0) {
                    updatePageContent(stores);
                }
            });
        }
    });
    
    // 📊 ローカルストレージ変更監視を開始（管理画面との同期用）
    startLocalStorageMonitoring();
    
    // モバイル版でのデータ自動更新機能
    if (isMobileDevice()) {
        console.log('📱 モバイル版機能を初期化中...');
        console.log('📱 モバイルデバイス検出 - データ同期を強化します');
        forceDataRefreshOnMobile(); // 即座に実行
        // initializeMobileDebugFeatures(); // セキュリティのため無効化
        
        // データ更新を定期的にチェック
        setInterval(() => {
            forceDataRefreshOnMobile();
        }, 30000); // 30秒ごと
    }
});

// 🚨 緊急モード用データ読み込み
async function loadStoreDataEmergency() {
    console.log('🚨 緊急モード: Supabaseから直接データ読み込み開始');
    
    try {
        // Supabaseクライアントが初期化されているか確認
        if (!supabaseDB || !isSupabaseInitialized) {
            console.log('🚨 Supabase未初期化 - 初期化を試行');
            await initializeSupabaseFrontend();
        }
        
        // Supabaseから直接データを取得
        const supabaseStores = await supabaseDB.getStores();
        
        if (supabaseStores && supabaseStores.length > 0) {
            console.log('🚨 緊急モード: Supabaseデータ取得成功', supabaseStores.length, '件');
            
            // IDフィールドの確認と自動追加
            const processedStores = ensureStoreIds(supabaseStores);
            
            // ローカルストレージも更新
            localStorage.setItem('nice_stores', JSON.stringify(processedStores));
            console.log('🚨 緊急モード: ローカルストレージも更新');
            
            return processedStores;
        } else {
            console.log('🚨 緊急モード: Supabaseにデータがありません');
            return [];
        }
        
    } catch (error) {
        console.error('🚨 緊急モードエラー:', error);
        
        // フォールバック: ローカルストレージから読み込み
        console.log('🚨 フォールバック: ローカルストレージから読み込み');
        const savedStores = localStorage.getItem('nice_stores');
        if (savedStores) {
            try {
                return JSON.parse(savedStores);
            } catch (parseError) {
                console.error('🚨 フォールバックもエラー:', parseError);
                return getDefaultStoreData();
            }
        }
        
        return getDefaultStoreData();
    }
}

// 📄 ページコンテンツ更新
function updatePageContent(stores) {
    // メインページのスライダーを更新
    if (document.querySelector('.main-slider')) {
        console.log('📄 メインページスライダーを更新');
        updateMainPageSlider(stores);
    }
    
    // キャバクラ一覧ページを更新
    if (document.querySelector('.store-grid')) {
        console.log('📄 店舗一覧ページを更新');
        updateCabaretListPage(stores);
    }
}

// 🚨 緊急通知表示
function showEmergencyNotification(message, type = 'info') {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.emergency-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = 'emergency-notification';
    notification.textContent = message;
    
    let bgColor, textColor;
    switch (type) {
        case 'success':
            bgColor = '#27ae60';
            textColor = 'white';
            break;
        case 'error':
            bgColor = '#e74c3c';
            textColor = 'white';
            break;
        case 'warning':
            bgColor = '#f39c12';
            textColor = 'white';
            break;
        default:
            bgColor = '#3498db';
            textColor = 'white';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: ${textColor};
        padding: 15px 25px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: emergencySlideDown 0.3s ease;
        max-width: 90%;
        text-align: center;
        border: 2px solid white;
    `;
    
    // アニメーション用のCSSを追加
    if (!document.querySelector('#emergency-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'emergency-notification-styles';
        style.textContent = `
            @keyframes emergencySlideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            @keyframes emergencySlideUp {
                from { transform: translateX(-50%) translateY(0); opacity: 1; }
                to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // 自動削除（エラーの場合は長く表示）
    const duration = type === 'error' ? 10000 : 5000;
    setTimeout(() => {
        notification.style.animation = 'emergencySlideUp 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// 🔍 デバッグパネル追加
function addDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'frontend-debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 10px;
        z-index: 9999;
        font-family: monospace;
        font-size: 11px;
        max-width: 300px;
        border: 1px solid #3498db;
    `;
    
    debugPanel.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">🔍 フロントエンドデバッグ</div>
        <div id="debug-info">読み込み中...</div>
        <div style="margin-top: 10px;">
            <button onclick="debugRefreshData()" style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; font-size: 10px; margin-right: 5px;">🔄 更新</button>
            <button onclick="debugShowLocalStorage()" style="background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 3px; font-size: 10px; margin-right: 5px;">💾 LS</button>
            <button onclick="document.getElementById('frontend-debug-panel').remove()" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; font-size: 10px;">❌</button>
        </div>
    `;
    
    document.body.appendChild(debugPanel);
    
    // 初期デバッグ情報を表示
    updateDebugInfo();
}

// 🔍 デバッグ情報更新
function updateDebugInfo() {
    const debugInfo = document.getElementById('debug-info');
    if (!debugInfo) return;
    
    const savedStores = localStorage.getItem('nice_stores');
    let storeCount = 0;
    try {
        if (savedStores) {
            storeCount = JSON.parse(savedStores).length;
        }
    } catch (error) {
        // エラーは無視
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    
    debugInfo.innerHTML = `
        <div>ページ: ${window.location.pathname}</div>
        <div>ローカル店舗数: ${storeCount}件</div>
        <div>緊急モード: ${urlParams.get('emergency') === '1' ? 'ON' : 'OFF'}</div>
        <div>デバッグモード: ${urlParams.get('debug') === '1' ? 'ON' : 'OFF'}</div>
        <div>Supabase: ${isSupabaseInitialized ? '✅' : '❌'}</div>
        <div>更新: ${new Date().toLocaleTimeString()}</div>
    `;
}

// 🔍 デバッグ用データ更新
async function debugRefreshData() {
    console.log('🔍 デバッグ: データ更新を実行');
    const stores = await loadStoreDataEmergency();
    if (stores && stores.length > 0) {
        updatePageContent(stores);
        showEmergencyNotification(`デバッグ: ${stores.length}件のデータを更新`, 'success');
    }
    updateDebugInfo();
}

// 🔍 ローカルス