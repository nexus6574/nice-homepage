#!/bin/bash
echo "=== DNS確認スクリプト ==="
echo "現在の設定:"
dig nice-shinjuku.com A +short
echo ""
echo "正しい設定（以下のいずれかが表示されればOK）:"
echo "185.199.108.153"
echo "185.199.109.153" 
echo "185.199.110.153"
echo "185.199.111.153"
echo ""
echo "まだ 160.251.148.180 が表示される場合は、DNS反映待ちです。"