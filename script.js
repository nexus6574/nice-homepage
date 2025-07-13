// ハンバーガーメニューとスライダーの初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    
    // ページ読み込み時にスライダーを初期化
    setTimeout(() => {
        console.log('ページ読み込み完了 - スライダーを初期化します');
        initializeSlider();
    }, 300);
});

// ページ完全読み込み時にも再初期化（画像読み込み完了後）
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('ページ完全読み込み完了 - スライダーを再初期化します');
        initializeSlider();
    }, 500);
});

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

// 店舗データ管理
function loadStoreData() {
    console.log('loadStoreData: データ読み込み開始');
    
    const savedStores = localStorage.getItem('cabaret_stores');
    if (savedStores) {
        try {
            const parsedData = JSON.parse(savedStores);
            console.log('loadStoreData: LocalStorageからデータを読み込み成功');
            console.log('店舗数:', parsedData.length);
            console.log('店舗データサンプル:', parsedData[0]?.name || 'なし');
            return parsedData;
        } catch (error) {
            console.error('loadStoreData: JSONパースエラー:', error);
            console.log('デフォルトデータにフォールバック');
            return getDefaultStoreData();
        }
    }
    
    console.log('loadStoreData: LocalStorageにデータなし - デフォルトデータを使用');
    // デフォルトの店舗データを返す
    return getDefaultStoreData();
}

// デフォルトの店舗データ
function getDefaultStoreData() {
    return [
        {
            name: "Premium Club TOKYO",
            image: "nice-storefront.jpg",
            price: "1,500円〜",
            description: "最高級のサービスと洗練された空間で特別な時間をお過ごしください。厳選されたキャストが心を込めておもてなしいたします。",
            features: ["VIP個室あり", "送迎サービス", "カラオケ完備", "高級シャンパン"],
            badge: "人気No.1"
        },
        {
            name: "Club Elegance",
            image: "nice-storefront.jpg",
            price: "1,200円〜",
            description: "エレガントで落ち着いた雰囲気の中で、上品なキャストがお客様を優雅にお迎えいたします。",
            features: ["落ち着いた雰囲気", "上品なキャスト", "個室完備", "ワイン豊富"],
            badge: "上品さNo.1"
        },
        {
            name: "Night Paradise",
            image: "nice-storefront.jpg",
            price: "1,000円〜",
            description: "夜の楽園をコンセプトにしたアットホームな空間で、楽しい時間をお過ごしください。",
            features: ["アットホーム", "リーズナブル", "イベント多数", "若いキャスト"],
            badge: "コスパNo.1"
        },
        {
            name: "Luxury Lounge",
            image: "nice-storefront.jpg",
            price: "2,000円〜",
            description: "ラグジュアリーな空間と最高級のサービスで、贅沢なひとときをお約束いたします。",
            features: ["最高級サービス", "豪華内装", "プレミアムドリンク", "VIPルーム"],
            badge: "高級志向"
        },
        {
            name: "Royal Cabinet",
            image: "nice-storefront.jpg",
            price: "1,750円〜",
            description: "王室のような気品あふれる空間で、最上級のホスピタリティをご体験ください。",
            features: ["格調高い", "知的なキャスト", "プライベート空間", "高級酒豊富"],
            badge: "気品No.1"
        },
        {
            name: "Diamond Club",
            image: "nice-storefront.jpg",
            price: "1,400円〜",
            description: "ダイヤモンドのように輝く特別な時間をお約束いたします。美しいキャストがお迎えします。",
            features: ["煌びやか", "美しいキャスト", "特別サービス", "記念日対応"],
            badge: "輝きNo.1"
        }
    ];
}

// 店舗一覧ページのデータ更新
function updateCabaretListPage() {
    const storeData = loadStoreData();
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
    
    const featuresHTML = store.features.map(feature => 
        `<span class="feature-tag">${feature}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="store-image">
            <img src="${store.image}" alt="${store.name} 店内" loading="lazy">
            <div class="store-badge">${store.badge}</div>
        </div>
        <div class="store-info">
            <h3 class="store-name">${store.name}</h3>
            <div class="store-details">
                <div class="price-info">
                    <span class="price-label">料金</span>
                    <span class="price-value">${store.price}</span>
                </div>
                <div class="remarks">
                    <span class="remarks-label">備考</span>
                    <p class="remarks-text">${store.description}</p>
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
    
    // クリックイベントを追加
    card.style.cursor = 'pointer';
    card.addEventListener('click', function() {
        navigateToStoreDetail(store);
    });
    
    // ホバー効果のためのイベント
    card.addEventListener('mouseenter', function() {
        const overlay = card.querySelector('.store-card-overlay');
        if (overlay) {
            overlay.style.opacity = '1';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const overlay = card.querySelector('.store-card-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
        }
    });
    
    return card;
}

// 店舗詳細ページへのナビゲーション
function navigateToStoreDetail(store) {
    console.log('店舗詳細ページに移動:', store.name);
    
    // 店舗名からIDを生成
    const storeId = generateStoreId(store.name);
    
    // 店舗詳細ページのURLを構築
    const detailUrl = `store-detail.html?id=${encodeURIComponent(storeId)}&name=${encodeURIComponent(store.name)}`;
    
    // ページ遷移
    window.location.href = detailUrl;
}

// 店舗名からIDを生成（日本語名を安全なIDに変換）
function generateStoreId(storeName) {
    return storeName
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '')
        .toLowerCase();
}

// メインページのスライダー更新
function updateMainPageSlider() {
    const storeData = loadStoreData();
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
        // スライド作成
        const slide = document.createElement('div');
        slide.className = index === 0 ? 'slide active' : 'slide';
        slide.innerHTML = `
            <img src="${store.image}" alt="${store.name} 店内" loading="lazy">
            <div class="slide-content">
                <h3>${store.name}</h3>
                <p>${store.description.split('。')[0]}。</p>
                <span class="price">料金：${store.price}</span>
            </div>
            <div class="slide-overlay">
                <div class="slide-action">
                    <span class="action-text">詳細を見る</span>
                    <span class="action-icon">→</span>
                </div>
            </div>
        `;
        
        // スライドにクリックイベントを追加
        slide.style.cursor = 'pointer';
        slide.addEventListener('click', function() {
            navigateToStoreDetail(store);
        });
        
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

// ページロード時にデータを更新
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded: ページ初期化開始');
    
    // 現在のページに応じて更新
    if (document.querySelector('.store-grid')) {
        console.log('店舗一覧ページを検出 - データ更新中...');
        updateCabaretListPage();
    } else if (document.querySelector('.slider')) {
        console.log('メインページを検出 - スライダー更新中...');
        updateMainPageSlider();
    }
    
    // 管理画面リンクを追加（開発用）
    addAdminLink();
    
    // データ同期監視を開始
    startDataSyncMonitoring();
    
    // 強制リフレッシュボタンを追加
    addForceRefreshButton();
});

// 管理画面へのリンクを追加（デバッグ用）
function addAdminLink() {
    if (window.location.pathname.includes('admin.html')) return;
    
    const adminLink = document.createElement('div');
    adminLink.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        background: linear-gradient(45deg, #e74c3c, #c0392b);
        color: white;
        padding: 10px 15px;
        border-radius: 25px;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
    `;
    adminLink.innerHTML = '⚙️ 管理画面';
    adminLink.onclick = () => window.open('admin.html', '_blank');
    
    adminLink.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.6)';
    });
    
    adminLink.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 5px 15px rgba(231, 76, 60, 0.4)';
    });
    
    document.body.appendChild(adminLink);
}

// データ同期監視機能
function startDataSyncMonitoring() {
    console.log('データ同期監視を開始');
    
    // 初期データのハッシュを保存
    let currentDataHash = getDataHash();
    
    // 定期的にlocalStorageをチェック（3秒ごと）
    setInterval(function() {
        const newDataHash = getDataHash();
        if (newDataHash !== currentDataHash) {
            console.log('データの変更を検出しました - 自動更新中...');
            currentDataHash = newDataHash;
            
            // ページを自動更新
            refreshPageData();
            
            // 通知を表示
            showDataUpdateNotification();
        }
    }, 3000);
    
    // StorageEventでリアルタイム検出（同一オリジン内）
    window.addEventListener('storage', function(e) {
        if (e.key === 'cabaret_stores') {
            console.log('Storage event: データ変更を検出');
            refreshPageData();
            showDataUpdateNotification();
        }
    });
}

// データのハッシュを生成（変更検出用）
function getDataHash() {
    const data = localStorage.getItem('cabaret_stores');
    return data ? data.length + '_' + data.substring(0, 50) : 'empty';
}

// ページデータを強制リフレッシュ
function refreshPageData() {
    console.log('ページデータを強制リフレッシュ中...');
    
    try {
        if (document.querySelector('.store-grid')) {
            console.log('店舗一覧ページを更新中...');
            updateCabaretListPage();
        } else if (document.querySelector('.slider')) {
            console.log('メインページスライダーを更新中...');
            updateMainPageSlider();
        }
        console.log('ページデータのリフレッシュ完了');
    } catch (error) {
        console.error('データリフレッシュエラー:', error);
    }
}

// データ更新通知を表示
function showDataUpdateNotification() {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.data-update-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'data-update-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: linear-gradient(45deg, #27ae60, #2ecc71);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 5px 15px rgba(39, 174, 96, 0.4);
        animation: slideInRight 0.5s ease;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>🔄</span>
            <span>データが更新されました</span>
        </div>
    `;
    
    // アニメーションのCSSを追加
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // 3秒後に非表示
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }
    }, 3000);
}

// 強制リフレッシュボタンを追加
function addForceRefreshButton() {
    const refreshButton = document.createElement('div');
    refreshButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        background: linear-gradient(45deg, #3498db, #2980b9);
        color: white;
        padding: 12px 16px;
        border-radius: 25px;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
        user-select: none;
    `;
    refreshButton.innerHTML = '🔄 データ更新';
    
    refreshButton.onclick = function() {
        console.log('強制リフレッシュボタンがクリックされました');
        
        // ボタンを一時的に無効化
        refreshButton.style.opacity = '0.6';
        refreshButton.style.pointerEvents = 'none';
        refreshButton.innerHTML = '🔄 更新中...';
        
        // データを強制リフレッシュ
        refreshPageData();
        
        // 成功メッセージを表示
        showDataUpdateNotification();
        
        // ボタンを元に戻す
        setTimeout(() => {
            refreshButton.style.opacity = '1';
            refreshButton.style.pointerEvents = 'auto';
            refreshButton.innerHTML = '🔄 データ更新';
        }, 1000);
    };
    
    refreshButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 8px 25px rgba(52, 152, 219, 0.6)';
    });
    
    refreshButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 5px 15px rgba(52, 152, 219, 0.4)';
    });
    
    document.body.appendChild(refreshButton);
}

// 緊急データ復旧機能（グローバル関数として公開）
window.NICE_FORCE_REFRESH = function() {
    console.log('緊急データリフレッシュ実行');
    try {
        refreshPageData();
        showDataUpdateNotification();
        console.log('緊急リフレッシュ完了');
        return '成功: データを強制更新しました';
    } catch (error) {
        console.error('緊急リフレッシュエラー:', error);
        return 'エラー: ' + error.message;
    }
};

// ページ可視性変更時にデータをチェック（タブ切り替え時など）
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('ページが再表示されました - データをチェック中...');
        // 少し遅延してからチェック
        setTimeout(refreshPageData, 500);
    }
});

