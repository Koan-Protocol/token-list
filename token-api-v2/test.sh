#!/bin/bash

# Token API v2 Test Script
# Mainnet chains: Base (8453), Lisk (1135)
# Testnet chains: Base Sepolia (84532), Lisk Sepolia (4202)

BASE_URL="${BASE_URL:-http://localhost:8787}"

echo "🧪 Testing Token API v2"
echo "========================"
echo "Base URL: $BASE_URL"
echo ""

echo "📍 Test 1: Root endpoint"
curl -s "$BASE_URL/" | jq .
echo -e "\n---\n"

echo "📍 Test 2: Get all tokens"
curl -s "$BASE_URL/tokens" | jq '{success: .success, count: .count, sample: .tokens[:2]}'
echo -e "\n---\n"

echo "📍 Test 3: Base tokens (8453)"
curl -s "$BASE_URL/tokens?chainIds=8453" | jq '{success: .success, count: .count, sample: .tokens[:2]}'
echo -e "\n---\n"

echo "📍 Test 4: Lisk tokens (1135)"
curl -s "$BASE_URL/tokens?chainIds=1135" | jq '{success: .success, count: .count, sample: .tokens[:2]}'
echo -e "\n---\n"

echo "📍 Test 5: Base Sepolia tokens (84532)"
curl -s "$BASE_URL/tokens?chainIds=84532" | jq '{success: .success, count: .count, sample: .tokens[:2]}'
echo -e "\n---\n"

echo "📍 Test 6: Lisk Sepolia tokens (4202)"
curl -s "$BASE_URL/tokens?chainIds=4202" | jq '{success: .success, count: .count, sample: .tokens[:2]}'
echo -e "\n---\n"

echo "📍 Test 7: Multiple mainnets (Base + Lisk)"
curl -s "$BASE_URL/tokens?chainIds=8453,1135" | jq '{success: .success, count: .count, sample: .tokens[:2]}'
echo -e "\n---\n"

echo "📍 Test 8: All testnets"
curl -s "$BASE_URL/tokens?chainIds=84532,4202" | jq '{success: .success, count: .count, sample: .tokens[:2]}'
echo -e "\n---\n"

echo "========================"
echo "✅ Tests completed!"
echo ""
echo "Chain IDs: Base=8453, Lisk=1135, BaseSepolia=84532, LiskSepolia=4202"
