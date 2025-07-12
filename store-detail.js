// 店舗詳細ページのJavaScript

// スライダーの状態管理
let storeSliderState = {
    currentSlide: 0,
    totalSlides: 0,
    autoSlideInterval: null,
    isTransitioning: false,
    isInitialized: false
};

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    loadStoreDetail();
});

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
    // ページタイトルを更新
    document.title = `${store.name} - 店舗詳細 | NICE（ナイス）`;
    
    // 写真スライダーを初期化
    initializeStoreImageSlider(store.images || [store.image]);
    
    // 基本情報を設定
    document.getElementById('store-badge').textContent = store.badge;
    document.getElementById('store-name').textContent = store.name;
    document.getElementById('store-description').textContent = store.description;
    document.getElementById('store-price').textContent = store.price;
    
    // 詳細情報を設定
    document.getElementById('detail-name').textContent = store.name;
    document.getElementById('detail-price').textContent = store.price;
    
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
}

// 店舗写真スライダーの初期化
function initializeStoreImageSlider(images) {
    const sliderContainer = document.querySelector('.store-slider');
    const dotsContainer = document.querySelector('.store-slider-dots');
    
    if (!sliderContainer || !dotsContainer) {
        console.error('スライダーコンテナが見つかりません');
        return;
    }
    
    // スライダーをリセット
    sliderContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    // 画像スライドを生成
    images.forEach((imageSrc, index) => {
        const slide = document.createElement('div');
        slide.className = 'store-slide';
        slide.innerHTML = `<img src="${imageSrc}" alt="店舗写真 ${index + 1}" loading="lazy">`;
        sliderContainer.appendChild(slide);
        
        // ドットを生成
        const dot = document.createElement('span');
        dot.className = `store-dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.slide = index;
        dotsContainer.appendChild(dot);
    });
    
    // スライダー状態を初期化
    storeSliderState.currentSlide = 0;
    storeSliderState.totalSlides = images.length;
    storeSliderState.isTransitioning = false;
    
    // イベントリスナーを設定
    setupStoreSliderEvents();
    
    // 自動スライドを開始（複数の画像がある場合のみ）
    if (images.length > 1) {
        startStoreAutoSlide();
    }
    
    storeSliderState.isInitialized = true;
    console.log(`店舗スライダーが初期化されました（${images.length}枚の写真）`);
}

// 店舗スライダーのイベントリスナーを設定
function setupStoreSliderEvents() {
    const prevBtn = document.querySelector('.store-prev-btn');
    const nextBtn = document.querySelector('.store-next-btn');
    const dots = document.querySelectorAll('.store-dot');
    const sliderContainer = document.querySelector('.store-image-slider');
    
    // ボタンクリックイベント
    if (nextBtn) {
        nextBtn.onclick = function(e) {
            e.preventDefault();
            nextStoreSlide();
        };
    }
    
    if (prevBtn) {
        prevBtn.onclick = function(e) {
            e.preventDefault();
            prevStoreSlide();
        };
    }
    
    // ドットクリックイベント
    dots.forEach((dot, index) => {
        dot.onclick = function(e) {
            e.preventDefault();
            goToStoreSlide(index);
        };
    });
    
    // マウス・タッチイベント
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopStoreAutoSlide);
        sliderContainer.addEventListener('mouseleave', startStoreAutoSlide);
        
        // タッチスワイプ対応
        let startX = 0;
        let endX = 0;
        
        sliderContainer.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            stopStoreAutoSlide();
        }, { passive: true });
        
        sliderContainer.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            handleStoreSwipe();
            if (storeSliderState.totalSlides > 1) {
                startStoreAutoSlide();
            }
        }, { passive: true });
        
        function handleStoreSwipe() {
            const threshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextStoreSlide();
                } else {
                    prevStoreSlide();
                }
            }
        }
    }
}

// 店舗スライダーの位置を更新
function updateStoreSliderPosition() {
    const sliderContainer = document.querySelector('.store-slider');
    if (sliderContainer) {
        const translateX = -storeSliderState.currentSlide * 100;
        sliderContainer.style.transform = `translateX(${translateX}%)`;
    }
}

// 店舗スライダーのドットを更新
function updateStoreSliderDots() {
    const dots = document.querySelectorAll('.store-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === storeSliderState.currentSlide);
    });
}

// 次の店舗スライドに移動
function nextStoreSlide() {
    if (storeSliderState.isTransitioning || storeSliderState.totalSlides <= 1) return;
    storeSliderState.isTransitioning = true;
    
    storeSliderState.currentSlide = (storeSliderState.currentSlide + 1) % storeSliderState.totalSlides;
    updateStoreSliderPosition();
    updateStoreSliderDots();
    
    setTimeout(() => {
        storeSliderState.isTransitioning = false;
    }, 500);
}

// 前の店舗スライドに移動
function prevStoreSlide() {
    if (storeSliderState.isTransitioning || storeSliderState.totalSlides <= 1) return;
    storeSliderState.isTransitioning = true;
    
    storeSliderState.currentSlide = (storeSliderState.currentSlide - 1 + storeSliderState.totalSlides) % storeSliderState.totalSlides;
    updateStoreSliderPosition();
    updateStoreSliderDots();
    
    setTimeout(() => {
        storeSliderState.isTransitioning = false;
    }, 500);
}

// 指定した店舗スライドに移動
function goToStoreSlide(slideIndex) {
    if (storeSliderState.isTransitioning || slideIndex === storeSliderState.currentSlide || storeSliderState.totalSlides <= 1) return;
    storeSliderState.isTransitioning = true;
    
    storeSliderState.currentSlide = slideIndex;
    updateStoreSliderPosition();
    updateStoreSliderDots();
    
    setTimeout(() => {
        storeSliderState.isTransitioning = false;
    }, 500);
}

// 店舗スライダーの自動スライドを開始
function startStoreAutoSlide() {
    if (storeSliderState.totalSlides <= 1) return;
    
    if (storeSliderState.autoSlideInterval) {
        clearInterval(storeSliderState.autoSlideInterval);
    }
    storeSliderState.autoSlideInterval = setInterval(nextStoreSlide, 4000);
}

// 店舗スライダーの自動スライドを停止
function stopStoreAutoSlide() {
    if (storeSliderState.autoSlideInterval) {
        clearInterval(storeSliderState.autoSlideInterval);
        storeSliderState.autoSlideInterval = null;
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
    const savedStores = localStorage.getItem('cabaret_stores');
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
    const imageData = getImageDataForStores();
    
    return stores.map(store => ({
        ...store,
        images: imageData[store.name] || [store.image || "nice-storefront.jpg"]
    }));
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
            badge: "人気No.1"
        },
        {
            name: "Club Elegance",
            image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center",
            images: imageData["Club Elegance"],
            price: "1,200円〜",
            description: "エレガントで落ち着いた雰囲気の中で、上品なキャストがお客様を優雅にお迎えいたします。",
            features: ["落ち着いた雰囲気", "上品なキャスト", "個室完備", "ワイン豊富"],
            badge: "上品さNo.1"
        },
        {
            name: "Night Paradise",
            image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center",
            images: imageData["Night Paradise"],
            price: "1,000円〜",
            description: "夜の楽園をコンセプトにしたアットホームな空間で、楽しい時間をお過ごしください。",
            features: ["アットホーム", "リーズナブル", "イベント多数", "若いキャスト"],
            badge: "コスパNo.1"
        },
        {
            name: "Luxury Lounge",
            image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center",
            images: imageData["Luxury Lounge"],
            price: "2,000円〜",
            description: "ラグジュアリーな空間と最高級のサービスで、贅沢なひとときをお約束いたします。",
            features: ["最高級サービス", "豪華内装", "プレミアムドリンク", "VIPルーム"],
            badge: "高級志向"
        },
        {
            name: "Royal Cabinet",
            image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center",
            images: imageData["Royal Cabinet"],
            price: "1,750円〜",
            description: "王室のような気品あふれる空間で、最上級のホスピタリティをご体験ください。",
            features: ["格調高い", "知的なキャスト", "プライベート空間", "高級酒豊富"],
            badge: "気品No.1"
        },
        {
            name: "Diamond Club",
            image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center",
            images: imageData["Diamond Club"],
            price: "1,400円〜",
            description: "ダイヤモンドのように輝く特別な時間をお約束いたします。美しいキャストがお迎えします。",
            features: ["煌びやか", "美しいキャスト", "特別サービス", "記念日対応"],
            badge: "輝きNo.1"
        }
    ];
} 