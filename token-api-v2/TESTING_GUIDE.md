# 🧪 Testing Guide

## Local Testing (Development)

### 1. Start Dev Server

```bash
pnpm dev
```

Expected output:

```
⛅️ wrangler 4.4.0
-------------------
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### 2. Test Root Endpoint

```bash
curl http://localhost:8787/
```

Expected response:

```json
{
	"message": "Koan Protocol Token API v2",
	"version": "2.0.0",
	"endpoints": {
		"tokens": {
			"all": "GET /tokens",
			"byChain": "GET /tokens?chainIds=8453,1135",
			"single": "GET /token?address=0x...&chainId=8453"
		},
		"validation": {
			"start": "POST /validate",
			"status": "GET /validate/status",
			"reset": "POST /validate/reset",
			"info": "GET /validate"
		}
	},
	"features": [
		"Multi-provider token aggregation (LiFi, 1inch, Default)",
		"Batch validation with Durable Objects & Alarms",
		"Two-tier caching (validated & unvalidated)",
		"On-chain verification via viem"
	]
}
```

### 3. Test Token Fetching

```bash
curl http://localhost:8787/tokens
```

Expected:

- First call: Fetches from providers, caches as unvalidated
- Returns array of tokens with `isValidated: false` or undefined
- Check logs for: "🔄 Cache miss - fetching from providers..."

### 4. Test Validation Start

```bash
curl -X POST http://localhost:8787/validate
```

Expected response:

```json
{
	"success": true,
	"message": "Validation started - processing in batches",
	"ok": true,
	"totalTokens": 600,
	"batchSize": 20,
	"estimatedBatches": 30
}
```

### 5. Test Validation Status

```bash
curl http://localhost:8787/validate/status
```

Expected response:

```json
{
	"ok": true,
	"state": {
		"currentPosition": 20,
		"totalTokens": 600,
		"isProcessing": true,
		"startedAt": 1702400000000
	},
	"nextAlarm": "2025-12-12T21:15:00.000Z",
	"progress": "20/600"
}
```

### 6. Monitor Validation Progress

```bash
# In a separate terminal
watch -n 10 'curl -s http://localhost:8787/validate/status | jq .progress'
```

Expected output (updates every 10 seconds):

```
"20/600"
"40/600"
"60/600"
...
"600/600"
```

### 7. Test Reset

```bash
curl -X POST http://localhost:8787/validate/reset
```

Expected response:

```json
{
	"ok": true,
	"message": "Validation state reset"
}
```

## Production Testing (After Deployment)

### 1. Deploy

```bash
pnpm deploy
```

Expected output:

```
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded token-api-v2 (X.XX sec)
Published token-api-v2 (X.XX sec)
  https://token-api-v2.your-subdomain.workers.dev
```

### 2. Test Production Endpoints

Replace `localhost:8787` with your production URL in all curl commands above.

Example:

```bash
curl https://token-api-v2.your-subdomain.workers.dev/
curl https://token-api-v2.your-subdomain.workers.dev/tokens
curl -X POST https://token-api-v2.your-subdomain.workers.dev/validate
```

### 3. Monitor Production Logs

```bash
wrangler tail
```

Expected output:

```
[2025-12-12 21:00:00] GET / 200 OK (5ms)
[2025-12-12 21:00:05] GET /tokens 200 OK (150ms)
[2025-12-12 21:00:10] POST /validate 200 OK (50ms)
[2025-12-12 21:01:00] ⏰ Alarm triggered - processing next batch
[2025-12-12 21:01:05] Processing batch 1/30 (20 tokens)
```

## Test Scenarios

### Scenario 1: Fresh Start (No Cache)

```bash
# 1. Fetch tokens (creates unvalidated cache)
curl http://localhost:8787/tokens
# Expected: "🔄 Cache miss - fetching from providers..."

# 2. Fetch again (hits unvalidated cache)
curl http://localhost:8787/tokens
# Expected: "📦 Unvalidated cache hit: 600 tokens"

# 3. Start validation
curl -X POST http://localhost:8787/validate
# Expected: "Validation started"

# 4. Wait for completion (~30 min for 600 tokens)

# 5. Fetch tokens (hits validated cache)
curl http://localhost:8787/tokens
# Expected: "✅ Validated cache hit: 600 tokens"
```

### Scenario 2: Validation in Progress

```bash
# 1. Start validation
curl -X POST http://localhost:8787/validate

# 2. Check status immediately
curl http://localhost:8787/validate/status
# Expected: currentPosition: 0, isProcessing: true

# 3. Wait 1 minute, check again
sleep 60
curl http://localhost:8787/validate/status
# Expected: currentPosition: 20, isProcessing: true

# 4. Try to start again (should fail gracefully)
curl -X POST http://localhost:8787/validate
# Expected: Error or "already processing" message
```

### Scenario 3: Reset and Restart

```bash
# 1. Start validation
curl -X POST http://localhost:8787/validate

# 2. Wait a bit
sleep 120

# 3. Reset
curl -X POST http://localhost:8787/validate/reset

# 4. Check status
curl http://localhost:8787/validate/status
# Expected: isProcessing: false

# 5. Start again
curl -X POST http://localhost:8787/validate
# Expected: "Validation started"
```

### Scenario 4: Filter by Chain

```bash
# Get only Base tokens
curl "http://localhost:8787/tokens?chainIds=8453"

# Get Base and Lisk tokens
curl "http://localhost:8787/tokens?chainIds=8453,1135"
```

## Validation Checklist

### Pre-Deployment

- [ ] Code compiles without errors
- [ ] All TypeScript types are correct
- [ ] Environment variables are set (.env file)
- [ ] Wrangler.jsonc is configured
- [ ] Durable Object binding is defined

### Post-Deployment

- [ ] Root endpoint returns API documentation
- [ ] `/tokens` returns token list
- [ ] `/tokens?chainIds=8453` filters correctly
- [ ] `POST /validate` starts validation
- [ ] `GET /validate/status` shows progress
- [ ] Logs show alarm triggers every minute
- [ ] Validation completes successfully
- [ ] Validated tokens have `isValidated: true`
- [ ] Reset endpoint works

### Performance Checks

- [ ] `/tokens` response time < 200ms (cached)
- [ ] `/tokens` response time < 2s (uncached)
- [ ] Batch processing time < 10s
- [ ] No timeout errors in logs
- [ ] Memory usage is reasonable

### Data Validation

- [ ] Token count matches expected
- [ ] No duplicate tokens (by id)
- [ ] All tokens have required fields
- [ ] logoUrl/logoURI mapping works
- [ ] Chain IDs are correct
- [ ] Addresses are valid

## Common Issues & Solutions

### Issue: "Cannot find module 'cloudflare:workers'"

**Solution**: Run `pnpm cf-typegen` to generate types

### Issue: "Property 'TokenValidationSchedulers' does not exist"

**Solution**: Check `worker-configuration.d.ts` has the binding

### Issue: Validation never starts

**Solution**:

1. Check logs: `wrangler tail`
2. Verify unvalidated cache exists: `curl /tokens` first
3. Reset and try again: `curl -X POST /validate/reset`

### Issue: Alarms not firing

**Solution**:

1. Check Durable Object is created (logs should show)
2. Verify alarm is set: `curl /validate/status`
3. Wait full interval (1 minute)

### Issue: Tokens not validating

**Solution**:

1. Check RPC endpoints are working
2. Verify viem configuration
3. Check token addresses are valid
4. Look for errors in logs

### Issue: Cache not working

**Solution**:

1. Verify Upstash Redis credentials
2. Check Redis dashboard for keys
3. Test Redis connection manually

## Performance Testing

### Load Test (Optional)

```bash
# Install Apache Bench
# Ubuntu/Debian: sudo apt-get install apache2-utils
# macOS: brew install httpd

# Test /tokens endpoint
ab -n 100 -c 10 http://localhost:8787/tokens

# Expected:
# - Requests per second: > 100
# - Mean time per request: < 100ms
# - Failed requests: 0
```

### Stress Test Validation

```bash
# Start validation
curl -X POST http://localhost:8787/validate

# Spam status endpoint
for i in {1..100}; do
  curl -s http://localhost:8787/validate/status > /dev/null
  echo "Request $i complete"
done

# Expected: All requests succeed, no errors
```

## Monitoring Commands

### Watch Logs

```bash
wrangler tail --format pretty
```

### Watch Status

```bash
watch -n 5 'curl -s http://localhost:8787/validate/status | jq'
```

### Check Redis Keys

```bash
# Via Upstash dashboard or CLI
# Look for:
# - tokens:validated
# - tokens:unvalidated
# - tokens:validated:staging
# - tokens:last_sync
```

## Success Criteria

✅ All endpoints respond correctly  
✅ Token fetching works (providers → cache)  
✅ Validation starts successfully  
✅ Alarms fire every minute  
✅ Batches process without timeout  
✅ Progress tracking works  
✅ Validation completes  
✅ Validated cache is populated  
✅ Subsequent requests use validated cache  
✅ No errors in logs

## Next Steps After Testing

1. **If all tests pass**: Deploy to production
2. **If tests fail**: Check logs, fix issues, redeploy
3. **After production deploy**: Monitor for 24 hours
4. **Optimize**: Adjust batch size/interval if needed
5. **Document**: Update README with production URL

---

**Happy Testing! 🧪**
