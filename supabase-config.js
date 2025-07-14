// Supabase設定ファイル
// 使用前に https://supabase.com でプロジェクトを作成し、以下を更新してください

const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // 例: https://xxxxx.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY', // 公開用APIキー
    
    // テーブル設定
    tables: {
        stores: 'nice_stores',
        sessions: 'nice_sessions'
    }
};

// Supabase JavaScript SDK (CDN版)
// HTML内で以下を読み込む必要があります:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Supabaseクライアント初期化
let supabase;

function initializeSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
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