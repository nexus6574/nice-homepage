// Supabase設定ファイル
// 使用前に https://supabase.com でプロジェクトを作成し、以下を更新してください

const SUPABASE_CONFIG = {
    url: 'https://rkjclmiievzgqkfgkhfl.supabase.co', // ← あなたのProject URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJramNsbWlpZXZ6Z3FrZmdraGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NTg1MTQsImV4cCI6MjA2ODAzNDUxNH0.YMjC3y7UlGmi091fBPd633KJmR6Hhbg6hUF_LgddHI8', // ← あなたのanon public key
    
    // テーブル設定
    tables: {
        stores: 'nice_stores',
        sessions: 'nice_sessions'
    },
    
    // Storage設定
    storage: {
        bucket: 'nice-store-images', // 画像保存用バケット
        maxFileSize: 5 * 1024 * 1024, // 5MB制限
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], // 許可ファイル形式
        imageOptimization: {
            width: 800,  // 最大幅
            height: 600, // 最大高さ
            quality: 85  // 圧縮品質
        }
    }
};

// Supabase JavaScript SDK (CDN版)
// HTML内で以下を読み込む必要があります:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Supabaseクライアント初期化
function initializeSupabase() {
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        // グローバルにSupabaseクライアントを保存
        window.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase初期化完了');
        return true;
    } else {
        console.error('❌ Supabase SDK が読み込まれていません');
        return false;
    }
}

// 設定状態チェック
function checkSupabaseConfig() {
    const isConfigured = SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && 
                        SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY';
    
    if (!isConfigured) {
        console.warn('⚠️ Supabase設定が未完了です。supabase-config.jsを更新してください。');
    }
    
    return isConfigured;
}

// エクスポート（グローバルで使用）
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.initializeSupabase = initializeSupabase;
window.checkSupabaseConfig = checkSupabaseConfig; 