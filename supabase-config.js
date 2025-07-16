// Supabase設定ファイル
// 使用前に https://supabase.com でプロジェクトを作成し、以下を更新してください

const SUPABASE_CONFIG = {
    url: 'https://rkjclmiievzgqkfgkhfl.supabase.co', // ← あなたのProject URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJramNsbWlpZXZ6Z3FrZmdraGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NTg1MTQsImV4cCI6MjA2ODAzNDUxNH0.YMjC3y7UlGmi091fBPd633KJmR6Hhbg6hUF_LgddHI8', // ← あなたのanon public key
    
    // 管理機能用Service Role Key (admin.htmlでのみ使用)
    // ⚠️ セキュリティ警告: このキーは管理者権限を持ちます
    // 本番環境では環境変数として管理してください
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJramNsbWlpZXZ6Z3FrZmdraGZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ1ODUxNCwiZXhwIjoyMDY4MDM0NTE0fQ.ObHx2wCXaw6cWCaRTTmu5UgDp62da1P2CFtigpKIEII', // ← Supabase Dashboard > Settings > API > service_role key
    
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
function initializeSupabase(useServiceRole = false) {
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        
        // 管理機能かどうかで使用するキーを切り替え
        const apiKey = useServiceRole ? SUPABASE_CONFIG.serviceRoleKey : SUPABASE_CONFIG.anonKey;
        const keyType = useServiceRole ? 'Service Role' : 'Anonymous';
        
        if (useServiceRole && SUPABASE_CONFIG.serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
            console.error('❌ Service Role Keyが設定されていません');
            console.error('Supabase Dashboard > Settings > API > service_role key を設定してください');
            return false;
        }
        
        // グローバルにSupabaseクライアントインスタンスを保存
        window.supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, apiKey);
        
        console.log('✅ Supabase初期化完了');
        console.log('🔗 Project URL:', SUPABASE_CONFIG.url);
        console.log('🔑 使用キー:', keyType, '(' + (apiKey ? '✅ 設定済み' : '❌ 未設定') + ')');
        
        return true;
    } else {
        console.error('❌ Supabase SDK が読み込まれていません');
        console.error('HTMLで以下のスクリプトタグが必要です:');
        console.error('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return false;
    }
}

// 管理機能専用初期化（Service Role Key使用）
function initializeSupabaseAdmin() {
    return initializeSupabase(true);
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