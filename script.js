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
    const savedStores = localStorage.getItem('cabaret_stores');
    if (savedStores) {
        return JSON.parse(savedStores);
    }
    return null;
}

// 店舗一覧ページのデータ更新
function updateCabaretListPage() {
    const storeData = loadStoreData();
    if (!storeData) return;
    
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
    `;
    
    return card;
}

// メインページのスライダー更新
function updateMainPageSlider() {
    const storeData = loadStoreData();
    if (!storeData) return;
    
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
        `;
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
    // 現在のページに応じて更新
    if (document.querySelector('.store-grid')) {
        // 店舗一覧ページ
        updateCabaretListPage();
    } else if (document.querySelector('.slider')) {
        // メインページ
        updateMainPageSlider();
    }
    
    // 管理画面リンクを追加（開発用）
    addAdminLink();
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

