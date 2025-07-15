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

    // 画像ファイル検証
    validateImageFile(file) {
        const config = SUPABASE_CONFIG.storage;
        
        // ファイルサイズチェック
        if (file.size > config.maxFileSize) {
            throw new Error(`ファイルサイズが大きすぎます。${Math.round(config.maxFileSize / 1024 / 1024)}MB以下にしてください。`);
        }
        
        // ファイル形式チェック
        if (!config.allowedTypes.includes(file.type)) {
            throw new Error(`サポートされていないファイル形式です。${config.allowedTypes.join(', ')}のみ対応しています。`);
        }
        
        return true;
    }

    // 画像最適化（簡易版）
    async optimizeImage(file) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const config = SUPABASE_CONFIG.storage.imageOptimization;
                
                // アスペクト比を保持してリサイズ
                let { width, height } = img;
                if (width > config.width || height > config.height) {
                    const ratio = Math.min(config.width / width, config.height / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(resolve, 'image/jpeg', config.quality / 100);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    // 画像アップロード
    async uploadImage(file, storeId = null, imageType = 'main') {
        if (!this.isOnline) {
            throw new Error('オフラインモードでは画像アップロードはできません');
        }

        try {
            // ファイル検証
            this.validateImageFile(file);
            
            // 画像最適化
            console.log('🖼️ 画像を最適化中...');
            const optimizedFile = await this.optimizeImage(file);
            
            // ファイル名生成
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const extension = file.name.split('.').pop() || 'jpg';
            const fileName = `${imageType}_${storeId || 'new'}_${timestamp}_${randomStr}.${extension}`;
            
            console.log('☁️ Supabase Storageにアップロード中...');
            
            // Supabase Storageにアップロード
            const { data, error } = await supabase.storage
                .from(SUPABASE_CONFIG.storage.bucket)
                .upload(fileName, optimizedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('❌ アップロードエラー:', error);
                throw error;
            }

            // 画像URLを取得
            const imageUrl = this.getImageUrl(fileName);
            console.log('✅ 画像アップロード完了:', imageUrl);
            
            return {
                fileName: fileName,
                url: imageUrl,
                size: optimizedFile.size,
                originalSize: file.size
            };

        } catch (error) {
            console.error('❌ 画像アップロードエラー:', error);
            throw error;
        }
    }

    // 画像削除
    async deleteImage(fileName) {
        if (!this.isOnline) {
            console.warn('⚠️ オフラインモードでは画像削除をスキップ');
            return;
        }

        try {
            const { error } = await supabase.storage
                .from(SUPABASE_CONFIG.storage.bucket)
                .remove([fileName]);

            if (error) {
                console.error('❌ 画像削除エラー:', error);
                // エラーでも続行（ファイルが存在しない場合など）
            } else {
                console.log('🗑️ 画像削除完了:', fileName);
            }
        } catch (error) {
            console.error('❌ 画像削除エラー:', error);
        }
    }

    // 画像URL取得
    getImageUrl(fileName) {
        const { data } = supabase.storage
            .from(SUPABASE_CONFIG.storage.bucket)
            .getPublicUrl(fileName);
        
        return data.publicUrl;
    }

    // 古い画像のクリーンアップ
    async cleanupOldImages(storeId) {
        if (!this.isOnline || !storeId) return;

        try {
            // ストレージ内の該当店舗の古い画像を検索
            const { data: files, error } = await supabase.storage
                .from(SUPABASE_CONFIG.storage.bucket)
                .list('', {
                    search: `_${storeId}_`
                });

            if (error || !files) return;

            // 古い画像を削除（複数ある場合は最新1つを残す）
            const storeFiles = files.filter(file => 
                file.name.includes(`_${storeId}_`) && file.name !== files[files.length - 1]?.name
            );

            if (storeFiles.length > 1) {
                // 最新以外を削除
                const filesToDelete = storeFiles.slice(0, -1).map(file => file.name);
                await supabase.storage
                    .from(SUPABASE_CONFIG.storage.bucket)
                    .remove(filesToDelete);
                
                console.log('🧹 古い画像をクリーンアップ:', filesToDelete.length, '個');
            }
        } catch (error) {
            console.error('❌ 画像クリーンアップエラー:', error);
        }
    }

    // 店舗データの読み込み（admin.js互換用）
    async loadStores() {
        console.log('📥 SupabaseDB.loadStores実行中...');
        
        if (!this.isOnline) {
            console.log('⚠️ オフライン状態です');
            return null;
        }

        try {
            const stores = await this.getAllStores();
            
            if (stores && stores.length > 0) {
                // admin.js形式に変換
                const convertedStores = stores.map(store => ({
                    id: store.id,
                    name: store.name,
                    description: store.description,
                    features: store.features || [],
                    price: store.price,
                    badge: store.badge || '',
                    image: store.image,
                    gallery: store.images || [],
                    businessHours: store.business_hours || { start: '20:00', end: '02:00' },
                    closedDays: store.closed_days || []
                }));
                
                console.log(`✅ ${convertedStores.length}件の店舗データを変換しました`);
                return convertedStores;
            }
            
            console.log('📥 データが見つかりません');
            return [];
            
        } catch (error) {
            console.error('❌ loadStoresエラー:', error);
            return null;
        }
    }

    // 単一店舗の保存（admin.js互換用）
    async saveStore(store) {
        console.log('💾 SupabaseDB.saveStore実行中...', store);
        
        if (!this.isOnline) {
            console.log('⚠️ オフライン状態です');
            return false;
        }

        try {
            // admin.js形式からSupabase形式に変換
            const supabaseData = {
                id: store.id,
                name: store.name,
                description: store.description,
                features: store.features || [],
                price: store.price,
                badge: store.badge || '',
                image: store.image,
                images: store.gallery || [],
                business_hours: store.businessHours || { start: '20:00', end: '02:00' },
                closed_days: store.closedDays || [],
                session_id: this.sessionId,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from(SUPABASE_CONFIG.tables.stores)
                .upsert(supabaseData);

            if (error) {
                console.error('❌ 店舗保存エラー:', error);
                return false;
            }

            console.log('✅ 店舗保存成功:', store.name);
            this.lastSync = new Date();
            return true;
            
        } catch (error) {
            console.error('❌ saveStoreエラー:', error);
            return false;
        }
    }
}

// グローバルインスタンス作成関数
function createSupabaseDB() {
    return new SupabaseDB();
}

// グローバルに公開
window.SupabaseDB = SupabaseDB;
window.createSupabaseDB = createSupabaseDB; 