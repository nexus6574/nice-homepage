// Supabaseデータベース操作機能
// supabase-config.js を先に読み込んでください

class SupabaseDB {
    constructor() {
        this.isOnline = false;
        this.realtimeSubscription = null;
        this.sessionId = this.generateSessionId();
        this.lastSync = null;
    }

    // 初期化
    async initialize() {
        if (!checkSupabaseConfig()) {
            console.log('🔄 Supabase未設定 - ローカルモードで継続');
            return false;
        }

        try {
            if (initializeSupabase()) {
                await this.testConnection();
                this.isOnline = true;
                console.log('🌐 Supabaseオンラインモード開始');
                return true;
            }
        } catch (error) {
            console.error('❌ Supabase初期化失敗:', error);
            console.log('🔄 ローカルモードで継続');
        }
        return false;
    }

    // 接続テスト
    async testConnection() {
        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tables.stores)
            .select('count')
            .limit(1);
        
        if (error && error.code === 'PGRST116') {
            // テーブルが存在しない場合は作成指示
            throw new Error('テーブルが存在しません。Supabaseダッシュボードでテーブルを作成してください。');
        }
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Supabase接続確認完了');
    }

    // セッションID生成
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 全店舗データ取得
    async getAllStores() {
        if (!this.isOnline) {
            return null;
        }

        try {
            const { data, error } = await supabase
                .from(SUPABASE_CONFIG.tables.stores)
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                throw error;
            }

            console.log('📥 Supabaseからデータ取得:', data?.length || 0, '件');
            this.lastSync = new Date();
            return data || [];
        } catch (error) {
            console.error('❌ データ取得エラー:', error);
            return null;
        }
    }

    // 全店舗データ保存
    async saveAllStores(stores) {
        if (!this.isOnline) {
            return false;
        }

        try {
            // 既存データを削除
            const { error: deleteError } = await supabase
                .from(SUPABASE_CONFIG.tables.stores)
                .delete()
                .neq('id', 0); // 全削除

            if (deleteError) {
                throw deleteError;
            }

            // 新データを挿入
            const storesData = stores.map(store => ({
                id: store.id,
                name: store.name,
                price: store.price,
                badge: store.badge || '',
                description: store.description || '',
                features: store.features || [],
                image: store.image || '',
                images: store.images || [],
                session_id: this.sessionId,
                updated_at: new Date().toISOString()
            }));

            const { error: insertError } = await supabase
                .from(SUPABASE_CONFIG.tables.stores)
                .insert(storesData);

            if (insertError) {
                throw insertError;
            }

            console.log('📤 Supabaseにデータ保存完了:', stores.length, '件');
            this.lastSync = new Date();
            return true;
        } catch (error) {
            console.error('❌ データ保存エラー:', error);
            return false;
        }
    }

    // 単一店舗更新
    async updateStore(store) {
        if (!this.isOnline) {
            return false;
        }

        try {
            const { error } = await supabase
                .from(SUPABASE_CONFIG.tables.stores)
                .upsert({
                    id: store.id,
                    name: store.name,
                    price: store.price,
                    badge: store.badge || '',
                    description: store.description || '',
                    features: store.features || [],
                    image: store.image || '',
                    images: store.images || [],
                    session_id: this.sessionId,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                throw error;
            }

            console.log('📝 店舗更新完了:', store.name);
            return true;
        } catch (error) {
            console.error('❌ 店舗更新エラー:', error);
            return false;
        }
    }

    // 店舗削除
    async deleteStore(storeId) {
        if (!this.isOnline) {
            return false;
        }

        try {
            const { error } = await supabase
                .from(SUPABASE_CONFIG.tables.stores)
                .delete()
                .eq('id', storeId);

            if (error) {
                throw error;
            }

            console.log('🗑️ 店舗削除完了:', storeId);
            return true;
        } catch (error) {
            console.error('❌ 店舗削除エラー:', error);
            return false;
        }
    }

    // リアルタイム同期開始
    startRealtimeSync(onDataChange) {
        if (!this.isOnline) {
            return;
        }

        this.realtimeSubscription = supabase
            .channel('nice_stores_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: SUPABASE_CONFIG.tables.stores },
                (payload) => {
                    console.log('🔄 リアルタイム更新:', payload);
                    if (onDataChange) {
                        onDataChange(payload);
                    }
                }
            )
            .subscribe();

        console.log('👂 リアルタイム同期開始');
    }

    // リアルタイム同期停止
    stopRealtimeSync() {
        if (this.realtimeSubscription) {
            supabase.removeChannel(this.realtimeSubscription);
            this.realtimeSubscription = null;
            console.log('🔇 リアルタイム同期停止');
        }
    }

    // 共有URL生成（超短縮版）
    generateShareableUrl(storeCount = null) {
        if (!this.isOnline) {
            return null;
        }

        const baseUrl = window.location.origin + window.location.pathname;
        const shareId = this.sessionId;
        const params = new URLSearchParams({
            supabase: shareId,
            count: storeCount || 0,
            time: Date.now()
        });

        return `${baseUrl}?${params.toString()}`;
    }

    // 共有データ取得
    async getSharedData(shareId) {
        if (!this.isOnline) {
            return null;
        }

        try {
            const { data, error } = await supabase
                .from(SUPABASE_CONFIG.tables.stores)
                .select('*')
                .eq('session_id', shareId)
                .order('id', { ascending: true });

            if (error) {
                throw error;
            }

            console.log('🔗 共有データ取得:', data?.length || 0, '件');
            return data || [];
        } catch (error) {
            console.error('❌ 共有データ取得エラー:', error);
            return null;
        }
    }

    // 統計情報取得
    async getStats() {
        if (!this.isOnline) {
            return null;
        }

        try {
            const { data, error } = await supabase
                .from(SUPABASE_CONFIG.tables.stores)
                .select('session_id, updated_at')
                .order('updated_at', { ascending: false })
                .limit(10);

            if (error) {
                throw error;
            }

            return {
                recentSessions: data?.length || 0,
                lastSync: this.lastSync,
                sessionId: this.sessionId
            };
        } catch (error) {
            console.error('❌ 統計情報取得エラー:', error);
            return null;
        }
    }
}

// グローバルインスタンス
window.supabaseDB = new SupabaseDB(); 