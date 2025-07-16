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
    initializeStoreDetailPage();
    initializeMobileMenu();
    loadStoreDetail();
    
    // モバイル固有の初期化
    if (window.innerWidth <= 768) {
        initializeMobileStoreDetail();
    }
});

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

// 店舗詳細を読み込んで表示
function loadStoreDetail() {
    const storeId = getStoreIdFromURL();
    const storeName = decodeURIComponent(window.location.search.split('name=')[1] || '');
    
    console.log('Store ID:', storeId);
    console.log('Store Name:', storeName);
    
    if (!storeId && !storeName) {
        showError('店舗情報が指定されていません。');
        return;
    }
    
    // ローディング表示
    showLoading();
    
    // 少し遅延を加えてリアルな読み込み感を演出
    setTimeout(() => {
        const stores = loadStoreData();
        if (!stores || stores.length === 0) {
            showError('店舗データが見つかりません。');
            return;
        }
        
        // 店舗を検索（IDまたは名前で）
        let store = null;
        if (storeId) {
            store = stores.find(s => generateStoreId(s.name) === storeId);
        }
        if (!store && storeName) {
            store = stores.find(s => s.name === storeName);
        }
        
        if (!store) {
            showError('指定された店舗が見つかりません。');
            return;
        }
        
        // 店舗詳細を表示
        displayStoreDetail(store);
        hideLoading();
        
    }, 800); // 0.8秒の遅延
}

// 店舗詳細を画面に表示
function displayStoreDetail(store) {
    console.log('📱 店舗詳細を表示中:', store.name);
    
    // グローバル変数に店舗データを保存（編集機能用）
    currentStore = store;
    
    // ページタイトルを更新
    document.title = `${store.name} - 店舗詳細 | NICE（ナイス）`;
    
    // 基本情報を設定（メイン画像）
    document.getElementById('store-main-image').src = store.image;
    document.getElementById('store-main-image').alt = `${store.name} 店内`;
    document.getElementById('store-badge').textContent = store.badge;
    document.getElementById('store-name').textContent = store.name;
    document.getElementById('store-description').textContent = store.description;
    document.getElementById('store-price').textContent = store.price;
    
    // 詳細情報を設定
    document.getElementById('detail-name').textContent = store.name;
    document.getElementById('detail-price').textContent = store.price;
    
    // 営業時間を設定
    if (store.businessHours && store.businessHours.start && store.businessHours.end) {
        const startTime = store.businessHours.start;
        const endTime = store.businessHours.end;
        // 終了時間が開始時間より早い場合（翌日にまたがる場合）の表示調整
        const endHour = parseInt(endTime.split(':')[0]);
        const displayEndTime = endHour < 12 ? `翌${endTime}` : endTime;
        document.getElementById('detail-hours').textContent = `${startTime} - ${displayEndTime}`;
    } else {
        document.getElementById('detail-hours').textContent = '20:00 - 翌02:00';
    }
    
    // 定休日を設定
    if (store.closedDays && Array.isArray(store.closedDays) && store.closedDays.length > 0) {
        document.getElementById('detail-closed-days').textContent = store.closedDays.join('、');
    } else {
        document.getElementById('detail-closed-days').textContent = 'なし（年中無休）';
    }
    
    // 写真ギャラリーを初期化（imagesフィールドを使用）
    const galleryImages = store.images || [store.image];
    console.log('📸 ギャラリー画像を初期化:', {
        imagesCount: store.images ? store.images.length : 0,
        finalCount: galleryImages.length,
        images: galleryImages
    });
    
    initializeGallerySlider(galleryImages);
    
    // 特徴・サービスを表示
    const featuresContainer = document.getElementById('store-features');
    featuresContainer.innerHTML = '';
    store.features.forEach(feature => {
        const featureTag = document.createElement('span');
        featureTag.className = 'feature-tag';
        featureTag.textContent = feature;
        featuresContainer.appendChild(featureTag);
    });
    
    // 詳細説明を表示
    const descriptionContainer = document.getElementById('store-full-description');
    const detailedDescription = generateDetailedDescription(store);
    descriptionContainer.innerHTML = detailedDescription;
    
    // コンテンツを表示
    document.getElementById('store-content').style.display = 'block';
    
    console.log('✅ 店舗詳細表示完了');
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

// 詳細説明を生成
function generateDetailedDescription(store) {
    const descriptions = {
        'Premium Club TOKYO': `
            <p>新宿歌舞伎町の中心部に位置する当店は、洗練された大人の空間をご提供しています。</p>
            <p>厳選されたキャストによる最高級のおもてなしで、特別な時間をお過ごしいただけます。プレミアムなサービスと上質な空間で、大切なお客様をお迎えいたします。</p>
            <p>初回のお客様には特別料金でご案内しており、気軽にお試しいただけます。経験豊富なキャストが心を込めてサービスいたします。</p>
        `,
        'Club Elegance': `
            <p>エレガントで落ち着いた雰囲気の当店では、上品なキャストがお客様を優雅にお迎えいたします。</p>
            <p>洗練されたインテリアと心地よい音楽が流れる店内で、日常を忘れてリラックスしていただけます。品格のあるサービスが自慢です。</p>
            <p>初回料金でお得にご利用いただけるので、まずはお気軽にお試しください。</p>
        `,
        'Night Paradise': `
            <p>夜の楽園をコンセプトにした当店は、非日常的な空間でお客様をお迎えしています。</p>
            <p>明るく親しみやすいキャストが多数在籍しており、楽しい時間をお過ごしいただけます。リーズナブルな価格設定も魅力の一つです。</p>
            <p>初回のお客様には更にお得な料金でご案内しておりますので、ぜひ一度お越しください。</p>
        `,
        'Luxury Lounge': `
            <p>ラグジュアリーな空間と最高級のサービスで、特別な時間をご提供する当店。</p>
            <p>VIP感溢れる内装と、洗練されたキャストによる極上のおもてなしで、贅沢なひとときをお約束いたします。</p>
            <p>初回特別料金により、通常では味わえない最高級のサービスをお手頃価格でお楽しみいただけます。</p>
        `,
        'Royal Cabinet': `
            <p>王室のような気品あふれる空間で、最上級のホスピタリティをご体験ください。</p>
            <p>格調高い内装と、教養豊かなキャストによる知的な会話で、充実した時間をお過ごしいただけます。</p>
            <p>初回のお客様限定の特別料金で、ロイヤルなサービスをお試しいただけます。</p>
        `,
        'Diamond Club': `
            <p>ダイヤモンドのように輝く特別な時間をお約束する当店。</p>
            <p>煌びやかな内装と、美しいキャストによる心温まるサービスで、忘れられない夜をお過ごしください。</p>
            <p>初回特別料金により、プレミアムなサービスをお得にお楽しみいただけます。</p>
        `
    };
    
    return descriptions[store.name] || `
        <p>${store.description}</p>
        <p>当店では、お客様に最高のおもてなしをご提供するため、厳選されたキャストと質の高いサービスを心がけております。</p>
        <p>初回のお客様には特別料金でご案内しておりますので、ぜひお気軽にお越しください。</p>
    `;
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

// 店舗データを読み込み（複数の写真を含む）
function loadStoreData() {
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
    
    return stores.map(store => {
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

        return {
            ...store,
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
            name: "Premium Club TOKYO",
            image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
            images: imageData["Premium Club TOKYO"],
            price: "1,500円〜",
            description: "最高級のサービスと洗練された空間で特別な時間をお過ごしください。厳選されたキャストが心を込めておもてなしいたします。",
            features: ["VIP個室あり", "送迎サービス", "カラオケ完備", "高級シャンパン"],
            badge: "人気No.1",
            businessHours: { start: "20:00", end: "02:00" },
            closedDays: ["日曜日"]
        },
        {
            name: "Club Elegance",
            image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center",
            images: imageData["Club Elegance"],
            price: "1,200円〜",
            description: "エレガントで落ち着いた雰囲気の中で、上品なキャストがお客様を優雅にお迎えいたします。",
            features: ["落ち着いた雰囲気", "上品なキャスト", "個室完備", "ワイン豊富"],
            badge: "上品さNo.1",
            businessHours: { start: "19:30", end: "01:30" },
            closedDays: ["月曜日"]
        },
        {
            name: "Night Paradise",
            image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
            images: imageData["Night Paradise"],
            price: "1,000円〜",
            description: "夜の楽園をコンセプトにしたアットホームな空間で、楽しい時間をお過ごしください。",
            features: ["アットホーム", "リーズナブル", "イベント多数", "若いキャスト"],
            badge: "コスパNo.1",
            businessHours: { start: "20:00", end: "03:00" },
            closedDays: []
        },
        {
            name: "Luxury Lounge",
            image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center",
            images: imageData["Luxury Lounge"],
            price: "2,000円〜",
            description: "ラグジュアリーな空間と最高級のサービスで、贅沢なひとときをお約束いたします。",
            features: ["最高級サービス", "豪華内装", "プレミアムドリンク", "VIPルーム"],
            badge: "高級志向",
            businessHours: { start: "19:00", end: "02:00" },
            closedDays: ["日曜日", "月曜日"]
        },
        {
            name: "Royal Cabinet",
            image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center",
            images: imageData["Royal Cabinet"],
            price: "1,750円〜",
            description: "王室のような気品あふれる空間で、最上級のホスピタリティをご体験ください。",
            features: ["格調高い", "知的なキャスト", "プライベート空間", "高級酒豊富"],
            badge: "気品No.1",
            businessHours: { start: "19:30", end: "01:00" },
            closedDays: ["火曜日"]
        },
        {
            name: "Diamond Club",
            image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
            images: imageData["Diamond Club"],
            price: "1,400円〜",
            description: "ダイヤモンドのように輝く特別な時間をお約束いたします。美しいキャストがお迎えします。",
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
 