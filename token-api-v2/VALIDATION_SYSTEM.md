# Token Validation System with Durable Objects

## Overview

This system uses **Cloudflare Durable Objects** with **Alarms** to validate tokens in batches, avoiding Cloudflare Workers timeout limits (10s on free tier, 30s on paid).

## Architecture

### Two-Tier Caching Strategy

1. **Validated Tokens Cache** (`tokens:validated`)

   - TTL: 1 week
   - Contains fully validated tokens with `isValidated: true`
   - Primary source for `/tokens` endpoint

2. **Unvalidated Tokens Cache** (`tokens:unvalidated`)
   - TTL: 1 week
   - Contains tokens fetched from providers with position tracking (`pst`)
   - Used when validated cache is empty
   - Source for batch validation

### Token Object Structure

#### Unvalidated Token (in cache)

```typescript
{
  id: string;              // "0x...address:chainId"
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
  logoURI?: string;        // Kept for backwards compatibility
  pst: number;             // Position for batch tracking
}
```

#### Validated Token (API response)

```typescript
{
  id: string;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
  isValidated: boolean;    // true if on-chain data verified
}
```

## How It Works

### 1. Token Fetching (`GET /tokens`)

```
┌─────────────────────────────────────────────┐
│  GET /tokens                                │
└─────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Check Validated Cache │ (1 week TTL)
        └───────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
    ✅ HIT                    ❌ MISS
        │                        │
        ▼                        ▼
   Return Tokens    ┌─────────────────────────┐
                    │ Check Unvalidated Cache │
                    └─────────────────────────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
                ✅ HIT                    ❌ MISS
                    │                        │
                    ▼                        ▼
            Return Tokens      ┌──────────────────────┐
            (without pst)      │ Fetch from Providers │
                               └──────────────────────┘
                                        │
                                        ▼
                            ┌──────────────────────────┐
                            │ Add pst (position 0-N)   │
                            │ Cache as Unvalidated     │
                            └──────────────────────────┘
```

### 2. Batch Validation (`POST /validate`)

```
┌─────────────────────────────────────────────┐
│  POST /validate                             │
└─────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Get Durable Object    │
        │ (named "validator")   │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Initialize State:     │
        │ - currentPosition: 0  │
        │ - totalTokens: N      │
        │ - isProcessing: true  │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Set Alarm (1 second)  │
        └───────────────────────┘
                    │
                    ▼
            Return 202 Accepted
```

### 3. Alarm Processing (Every Minute)

```
┌─────────────────────────────────────────────┐
│  ⏰ Alarm Triggered                         │
└─────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Get Unvalidated Cache │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────┐
        │ Filter tokens by pst:             │
        │ currentPosition to                │
        │ currentPosition + BATCH_SIZE (20) │
        └───────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Validate Each Token:  │
        │ - Fetch on-chain data │
        │ - Compare name/symbol │
        │ - Update if different │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │ Append to Staging Cache       │
        │ (tokens:validated:staging)    │
        └───────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Update State:         │
        │ currentPosition += 20 │
        └───────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
   More Tokens?              All Done?
        │                        │
        ▼                        ▼
Set Next Alarm      ┌──────────────────────────┐
(+1 minute)         │ Move Staging to          │
                    │ Validated Cache          │
                    │ Clear State & Alarm      │
                    └──────────────────────────┘
```

## API Endpoints

### Start Validation

```bash
POST /validate
```

**Response:**

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

### Check Status

```bash
GET /validate/status
```

**Response:**

```json
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

### Reset Validation

```bash
POST /validate/reset
```

**Response:**

```json
{
	"ok": true,
	"message": "Validation state reset"
}
```

## Configuration

### Batch Settings

Located in `src/durable-objects/token-validators.ts`:

```typescript
const BATCH_SIZE = 20; // Tokens per batch
const ALARM_INTERVAL_MS = 60 * 1000; // 1 minute between batches
```

### Recommended Settings

- **BATCH_SIZE**: 20 tokens (safe for ~5-7s execution time)
- **ALARM_INTERVAL**: 60 seconds (1 minute)
- For 600 tokens: ~30 minutes total validation time

### Adjusting for Performance

- **Faster validation**: Reduce `ALARM_INTERVAL_MS` to 30s
- **More tokens per batch**: Increase `BATCH_SIZE` to 30-40 (monitor execution time)
- **Safer execution**: Reduce `BATCH_SIZE` to 10-15

## Cache Keys

```typescript
CACHE_KEYS = {
	VALIDATED_TOKENS: "tokens:validated", // Final validated tokens
	UNVALIDATED_TOKENS: "tokens:unvalidated", // Tokens with pst tracking
	STAGING_VALIDATED_TOKENS: "tokens:validated:staging", // During validation
	LAST_SYNC: "tokens:last_sync", // Timestamp
};
```

## Validation Logic

For each token:

1. Fetch on-chain data using viem
2. Compare `name`, `symbol`, `decimals`
3. If different: Update with on-chain values
4. Set `isValidated: true` if successful
5. Set `isValidated: false` if fetch fails
6. Preserve `logoUrl` from API (not validated)

## Error Handling

- **Alarm failures**: Automatically retry with exponential backoff
- **Token validation errors**: Mark as `isValidated: false`, continue processing
- **Network errors**: Retry on next alarm
- **State corruption**: Use `POST /validate/reset` to clear

## Monitoring

### Logs

```bash
wrangler tail
```

Look for:

- `⏰ Alarm triggered - processing next batch`
- `Processing batch X/Y (20 tokens)`
- `✅ Validation complete: N tokens validated`

### Progress Tracking

```bash
curl https://your-worker.workers.dev/validate/status
```

## Deployment

1. **Update wrangler.jsonc** (already configured):

```jsonc
{
	"durable_objects": {
		"bindings": [
			{
				"name": "TokenValidationSchedulers",
				"class_name": "TokenValidationSchedulers"
			}
		]
	}
}
```

2. **Deploy**:

```bash
pnpm deploy
```

3. **Test**:

```bash
# Fetch tokens (will cache as unvalidated)
curl https://your-worker.workers.dev/tokens

# Start validation
curl -X POST https://your-worker.workers.dev/validate

# Check progress
curl https://your-worker.workers.dev/validate/status
```

## Benefits

✅ **No Timeouts**: Batches run within Cloudflare limits  
✅ **Automatic Retries**: Alarms retry on failure  
✅ **Stateful**: Durable Objects maintain progress  
✅ **Efficient**: O(1) lookups with position tracking  
✅ **Scalable**: Handles 1000s of tokens  
✅ **Cost-Effective**: Free tier compatible

## Limitations

- Single Durable Object instance (named "validator")
- Sequential batch processing (not parallel)
- Minimum 1-minute intervals between batches
- Requires Redis (Upstash) for caching

## Future Improvements

- [ ] Parallel validation across multiple Durable Objects
- [ ] Configurable batch size via API
- [ ] Webhook notifications on completion
- [ ] Incremental validation (only new/changed tokens)
- [ ] Validation metrics and analytics
