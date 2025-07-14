# NICE キャバクラ一覧 - Supabase セットアップガイド

## 📋 **セットアップ手順**

### **1. Supabaseプロジェクト作成**
1. [Supabase](https://supabase.com) でアカウント作成
2. 新しいプロジェクトを作成
3. データベースパスワードを設定

### **2. データベーステーブル作成**
Supabaseダッシュボードの「SQL Editor」で以下のスクリプトを実行：

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

### **3. API設定取得**
1. プロジェクトSettings → API
2. 以下の情報をコピー：
   - `Project URL`
   - `anon public key`

### **4. 設定ファイル更新**
`supabase-config.js` ファイルを更新：

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',  // ← Project URL
    anonKey: 'your-anon-key',                // ← anon public key
    
    tables: {
        stores: 'nice_stores',
        sessions: 'nice_sessions'
    }
};
```

## 🚀 **利用開始**

設定完了後、管理画面にアクセスすると：
- ✅ **"🌐 クラウド同期が有効になりました！"** → 成功
- ⚠️ **"📱 ローカルモードで動作中"** → 設定未完了

## 🎯 **新機能**

### **1. 超短URL共有**
- 従来: `https://nice-shinjuku.com/admin.html?import=V5U:eyJ2Ijo1...` (1000文字以上)
- 新しい: `https://nice-shinjuku.com/admin.html?supabase=session_12345&count=5` (約100文字)

### **2. リアルタイム同期**
- 他のデバイスでの変更が自動で反映
- 複数人での同時編集が可能

### **3. 自動バックアップ**
- データが自動でクラウドに保存
- 端末故障時もデータが保護

## 🔧 **トラブルシューティング**

### **"テーブルが存在しません"エラー**
→ SQLスクリプトが正しく実行されているか確認

### **"クラウド同期でエラー"**
→ API設定が正しく設定されているか確認

### **リアルタイム同期が動作しない**
→ `ALTER PUBLICATION` コマンドが実行されているか確認

## 📊 **データベース構造**

```
nice_stores
├── id (BIGINT) - 店舗ID
├── name (VARCHAR) - 店名
├── price (VARCHAR) - 価格
├── badge (VARCHAR) - バッジ
├── description (TEXT) - 説明
├── features (JSONB) - 特徴リスト
├── image (TEXT) - メイン画像URL
├── images (JSONB) - 追加画像URLリスト
├── session_id (VARCHAR) - セッション識別子
├── created_at (TIMESTAMP) - 作成日時
└── updated_at (TIMESTAMP) - 更新日時
```

## 💡 **使い分けガイド**

| 機能 | 用途 | URL長さ |
|-----|------|---------|
| 🌐 Supabase共有 | 日常的な共有 | ~100文字 |
| 📱 従来URL共有 | 一時的な共有 | 1000-3000文字 |
| 📁 ファイル共有 | 完全バックアップ | ファイル |

## 🛡️ **セキュリティ考慮事項**

- 現在はパブリック読み書き権限
- 必要に応じて認証機能を追加可能
- Row Level Security (RLS) で細かい権限制御が可能

---

**🎉 設定完了後は、管理画面で「🔗 URL共有」ボタンをクリックして超短URL機能をお試しください！** 