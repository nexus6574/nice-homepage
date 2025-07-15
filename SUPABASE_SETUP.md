# NICE キャバクラ一覧 - Supabase セットアップガイド

## 📋 **手順**

### **1. Supabaseダッシュボードにアクセス**
1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. あなたのプロジェクト（`rkjclmiievzgqkfgkhfl`）を選択

### **2. SQL Editorで以下のスクリプトを実行**
1. 左側メニューから「SQL Editor」をクリック
2. 「New query」をクリック
3. 以下のSQLスクリプトを貼り付けて実行：

```sql
-- nice_stores テーブル作成
CREATE TABLE nice_stores (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(100),
    badge VARCHAR(100),
    description TEXT,
    features JSONB DEFAULT '[]',
    image TEXT,
    images JSONB DEFAULT '[]',
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_nice_stores_session_id ON nice_stores(session_id);
CREATE INDEX idx_nice_stores_updated_at ON nice_stores(updated_at);

-- Row Level Security (RLS) 設定
ALTER TABLE nice_stores ENABLE ROW LEVEL SECURITY;

-- 全てのユーザーに読み取り・書き込み権限を付与（パブリック使用のため）
CREATE POLICY "Anyone can read stores" ON nice_stores
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert stores" ON nice_stores
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update stores" ON nice_stores
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete stores" ON nice_stores
    FOR DELETE USING (true);

-- リアルタイム機能を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE nice_stores;
```

### **3. Storage バケット作成（画像保存用）**
Storage → New bucket で以下のバケットを作成：

```sql
-- ストレージバケット作成（画像保存用）
INSERT INTO storage.buckets (id, name, public) 
VALUES ('nice-store-images', 'nice-store-images', true);

-- Storage RLS ポリシー設定（全員がアップロード・読み取り可能）
CREATE POLICY "Anyone can upload store images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'nice-store-images');

CREATE POLICY "Anyone can read store images" ON storage.objects
    FOR SELECT USING (bucket_id = 'nice-store-images');

CREATE POLICY "Anyone can update store images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'nice-store-images');

CREATE POLICY "Anyone can delete store images" ON storage.objects
    FOR DELETE USING (bucket_id = 'nice-store-images');
```

### **4. 実行方法**
1. 上記SQLを全選択してコピー
2. SQL Editorに貼り付け
3. 「Run」ボタンをクリック

### **5. 成功確認**
- 「Success. No rows returned」が表示されれば成功
- 左側メニューの「Table Editor」で `nice_stores` テーブルが作成されていることを確認

## 🚀 **完了後**

設定が完了すると、管理画面で：
- ✅ **"🌐 クラウド同期が有効になりました！"** というメッセージが表示
- **"☁️ Supabase 超短縮URL"** オプションが利用可能に

何か問題があれば教えてください！ 