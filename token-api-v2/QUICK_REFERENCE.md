# Quick Reference Guide

## Common Operations

### 1. Deploy the Worker

```bash
cd token-api-v2
pnpm deploy
```

### 2. Test Locally

```bash
pnpm dev
```

### 3. View Logs

```bash
wrangler tail
```

## API Usage

### Get All Tokens

```bash
# First call: Fetches from providers, caches as unvalidated
curl https://your-worker.workers.dev/tokens

# Returns:
{
  "success": true,
  "count": 600,
  "tokens": [
    {
      "id": "0x123...:8453",
      "chainId": 8453,
      "address": "0x123...",
      "name": "Token Name",
      "symbol": "TKN",
      "decimals": 18,
      "logoUrl": "https://...",
      "isValidated": false  // Not yet validated
    }
  ]
}
```

### Get Tokens by Chain

```bash
curl "https://your-worker.workers.dev/tokens?chainIds=8453,1135"
```

### Start Validation

```bash
curl -X POST https://your-worker.workers.dev/validate

# Returns:
{
  "success": true,
  "message": "Validation started - processing in batches",
  "ok": true,
  "totalTokens": 600,
  "batchSize": 20,
  "estimatedBatches": 30
}
```

### Check Validation Status

```bash
curl https://your-worker.workers.dev/validate/status

# Returns:
{
  "ok": true,
  "state": {
    "currentPosition": 40,
    "totalTokens": 600,
    "isProcessing": true,
    "startedAt": 1702400000000
  },
  "nextAlarm": "2025-12-12T21:05:00.000Z",
  "progress": "40/600"
}
```

### Reset Validation (if needed)

```bash
curl -X POST https://your-worker.workers.dev/validate/reset
```

## Typical Workflow

### First Time Setup

```bash
# 1. Deploy
pnpm deploy

# 2. Fetch tokens (creates unvalidated cache)
curl https://your-worker.workers.dev/tokens

# 3. Start validation
curl -X POST https://your-worker.workers.dev/validate

# 4. Wait ~30 minutes for 600 tokens
# Check progress every few minutes:
curl https://your-worker.workers.dev/validate/status

# 5. Once complete, tokens endpoint returns validated data
curl https://your-worker.workers.dev/tokens
# Now isValidated: true for all tokens
```

### Regular Usage (After Initial Validation)

```bash
# Just fetch tokens - returns validated cache
curl https://your-worker.workers.dev/tokens

# Validated cache lasts 1 week
# After 1 week, it falls back to unvalidated cache
# Then you can re-run validation if needed
```

## Monitoring

### Watch Validation Progress

```bash
# Terminal 1: Watch logs
wrangler tail

# Terminal 2: Poll status every 30 seconds
while true; do
  curl -s https://your-worker.workers.dev/validate/status | jq '.progress'
  sleep 30
done
```

### Check Cache Status

```bash
# You can check Redis directly via Upstash dashboard
# Or check the response from /tokens:
curl https://your-worker.workers.dev/tokens | jq '.tokens[0].isValidated'

# true = validated cache
# false or missing = unvalidated cache
```

## Troubleshooting

### Validation Stuck?

```bash
# Check status
curl https://your-worker.workers.dev/validate/status

# If stuck, reset and restart
curl -X POST https://your-worker.workers.dev/validate/reset
curl -X POST https://your-worker.workers.dev/validate
```

### No Tokens Returned?

```bash
# Check if cache is empty
# Fetch fresh from providers
curl https://your-worker.workers.dev/tokens

# This will automatically cache as unvalidated
```

### Want to Force Refresh?

```bash
# Currently: Wait for 1-week TTL to expire
# Or: Clear Redis cache manually via Upstash dashboard
# Keys to clear:
# - tokens:validated
# - tokens:unvalidated
# - tokens:last_sync
```

## Configuration Changes

### Adjust Batch Size

Edit `src/durable-objects/token-validators.ts`:

```typescript
const BATCH_SIZE = 30; // Increase from 20
```

### Adjust Validation Speed

Edit `src/durable-objects/token-validators.ts`:

```typescript
const ALARM_INTERVAL_MS = 30 * 1000; // 30 seconds instead of 60
```

### Change Cache TTL

Edit `src/lib/upstash-redis.ts`:

```typescript
export const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 1 week (current)
// Change to:
export const CACHE_TTL_SECONDS = 3 * 24 * 60 * 60; // 3 days
```

## Environment Variables

Required in `.env` or Cloudflare dashboard:

```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
ONEINCH_API_KEY=...
```

## Useful Commands

```bash
# Generate types
pnpm cf-typegen

# Deploy with minification
pnpm deploy

# Local development
pnpm dev

# View logs
wrangler tail

# View Durable Object instances
wrangler d1 list  # (not applicable, but similar concept)
```

## Performance Tips

1. **Batch Size**: Keep at 20 for safety, increase to 30-40 if confident
2. **Alarm Interval**: 60s is safe, can reduce to 30s for faster validation
3. **Cache TTL**: 1 week is good balance between freshness and performance
4. **Concurrent Requests**: Cloudflare handles this automatically

## Cost Estimates (Cloudflare Free Tier)

- **Requests**: 100,000/day (plenty for most use cases)
- **Durable Objects**: 1 million requests/month (validation uses ~30 requests for 600 tokens)
- **Workers KV/Redis**: External (Upstash free tier: 10,000 requests/day)

**Conclusion**: Easily fits within free tier limits! 🎉
