#!/bin/bash

echo "🔍 DNS設定チェックツール - nice-shinjuku.com"
echo "========================================="

# Aレコードの確認
echo "📌 Aレコード確認："
dig +short nice-shinjuku.com A

echo ""
echo "📌 CNAMEレコード確認（www）："
dig +short www.nice-shinjuku.com CNAME

echo ""
echo "📌 GitHubのIPアドレス範囲確認："
echo "期待値: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153"

echo ""
echo "📌 HTTPSアクセステスト："
curl -I https://nice-shinjuku.com 2>/dev/null | head -n 1

echo ""
echo "📌 反映状況："
if dig +short nice-shinjuku.com A | grep -q "185.199"; then
    echo "✅ DNS設定が正しく反映されています"
else
    echo "⏳ DNS設定がまだ反映されていません（最大48時間かかります）"
fi