
import type { Token } from "../../types/token";
import { validateSingleToken } from "../../services/token-validation-service";
import { createRedisClient, CACHE_KEYS } from "../../lib/upstash-redis";

const BATCH_SIZE = 20; // Tokens per batch
const ALARM_INTERVAL_MS = 60 * 1000; // 1 minute between batches

interface UnvalidatedToken extends Token {
	pst: number; // Position for tracking
}

export interface ValidationState {
	currentPosition: number;
	totalTokens: number;
	isProcessing: boolean;
	startedAt?: number;
}

export async function handleAlarm(
	state: any,
	env: Env
): Promise<void> {
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("⏰ ALARM TRIGGERED");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log(`[Alarm] Timestamp: ${new Date().toISOString()}`);

	// Step 1: Get validation state
	console.log("\n[Step 1] Fetching validation state from storage...");
	const validationState = await state.storage.get<ValidationState>("validationState");
	
	if (!validationState) {
		console.log("❌ [Step 1] No validation state found");
		return;
	}

	console.log("✅ [Step 1] Validation state retrieved:");
	console.log(`   - Current Position: ${validationState.currentPosition}`);
	console.log(`   - Total Tokens: ${validationState.totalTokens}`);
	console.log(`   - Is Processing: ${validationState.isProcessing}`);
	console.log(`   - Started At: ${validationState.startedAt ? new Date(validationState.startedAt).toISOString() : 'N/A'}`);

	if (!validationState.isProcessing) {
		console.log("⚠️ [Step 1] Validation is not active (isProcessing: false)");
		return;
	}

	try {
		// Step 2: Get unvalidated tokens from Redis
		console.log("\n[Step 2] Fetching unvalidated tokens from Redis...");
		const redis = createRedisClient(env);
		console.log(`   - Cache key: ${CACHE_KEYS.UNVALIDATED_TOKENS}`);
		
		const unvalidatedTokens = await redis.get<UnvalidatedToken[]>(CACHE_KEYS.UNVALIDATED_TOKENS);

		if (!unvalidatedTokens || unvalidatedTokens.length === 0) {
			console.log("❌ [Step 2] No unvalidated tokens found in cache");
			console.log("   - Completing validation...");
			await completeValidation(state, env);
			return;
		}

		console.log(`✅ [Step 2] Retrieved ${unvalidatedTokens.length} unvalidated tokens from cache`);

		// Step 3: Filter batch
		console.log("\n[Step 3] Filtering batch for current position...");
		const { currentPosition } = validationState;
		const endPosition = currentPosition + BATCH_SIZE;
		
		console.log(`   - Start position: ${currentPosition}`);
		console.log(`   - End position: ${endPosition - 1}`);
		console.log(`   - Batch size: ${BATCH_SIZE}`);

		const batch = unvalidatedTokens.filter(
			(t) => t.pst >= currentPosition && t.pst < endPosition
		);

		console.log(`✅ [Step 3] Filtered batch contains ${batch.length} tokens`);

		if (batch.length === 0) {
			console.log("⚠️ [Step 3] No tokens in batch - validation complete");
			await completeValidation(state, env);
			return;
		}

		console.log(`   - First token pst: ${batch[0]?.pst}`);
		console.log(`   - Last token pst: ${batch[batch.length - 1]?.pst}`);

		// Step 4: Validate batch
		console.log("\n[Step 4] Validating batch tokens...");
		console.log(`   - Processing ${batch.length} tokens in parallel`);
		
		const startTime = Date.now();
		const validatedBatch = await Promise.all(
			batch.map(async (token, index) => {
				console.log(`   [${index + 1}/${batch.length}] Validating ${token.symbol} (${token.address.slice(0, 8)}...) on chain ${token.chainId}`);
				
				const result = await validateSingleToken(token);
				
				const status = result.validated ? "✅ Valid" : "❌ Invalid";
				console.log(`   [${index + 1}/${batch.length}] ${status} - ${token.symbol}`);
				
				return {
					id: result.id,
					chainId: result.chainId,
					address: result.address,
					name: result.name,
					symbol: result.symbol,
					decimals: result.decimals,
					logoUrl: result.logoUrl || result.logoURI,
					isValidated: result.validated,
				};
			})
		);

		const validationTime = Date.now() - startTime;
		const validCount = validatedBatch.filter(t => t.isValidated).length;
		const invalidCount = validatedBatch.length - validCount;

		console.log(`✅ [Step 4] Batch validation complete in ${validationTime}ms`);
		console.log(`   - Valid tokens: ${validCount}`);
		console.log(`   - Invalid tokens: ${invalidCount}`);

		// Step 5: Merge with existing validated tokens
		console.log("\n[Step 5] Merging with staging cache...");
		console.log(`   - Cache key: ${CACHE_KEYS.STAGING_VALIDATED_TOKENS}`);
		
		const existingValidated = await redis.get<Token[]>(CACHE_KEYS.STAGING_VALIDATED_TOKENS) || [];
		console.log(`   - Existing validated tokens: ${existingValidated.length}`);
		
		const mergedValidated = [...existingValidated, ...validatedBatch];
		console.log(`   - Total after merge: ${mergedValidated.length}`);
		
		// Step 6: Save to staging cache
		console.log("\n[Step 6] Saving to staging cache...");
		await redis.set(CACHE_KEYS.STAGING_VALIDATED_TOKENS, JSON.stringify(mergedValidated), {
			ex: 7 * 24 * 60 * 60, // 1 week
		});
		console.log(`✅ [Step 6] Saved ${mergedValidated.length} tokens to staging cache`);

		// Step 7: Update state
		console.log("\n[Step 7] Updating validation state...");
		const newPosition = currentPosition + BATCH_SIZE;
		console.log(`   - Old position: ${currentPosition}`);
		console.log(`   - New position: ${newPosition}`);
		console.log(`   - Progress: ${newPosition}/${validationState.totalTokens} (${Math.round(newPosition / validationState.totalTokens * 100)}%)`);
		
		await state.storage.put<ValidationState>("validationState", {
			...validationState,
			currentPosition: newPosition,
		});
		console.log("✅ [Step 7] State updated successfully");

		// Step 8: Check if done or schedule next
		console.log("\n[Step 8] Checking completion status...");
		if (newPosition >= validationState.totalTokens) {
			console.log("🎉 [Step 8] All tokens processed!");
			console.log("   - Finalizing validation...");
			await completeValidation(state, env);
		} else {
			const remainingTokens = validationState.totalTokens - newPosition;
			const remainingBatches = Math.ceil(remainingTokens / BATCH_SIZE);
			const nextAlarmTime = Date.now() + ALARM_INTERVAL_MS;
			
			console.log("⏭️ [Step 8] More tokens to process");
			console.log(`   - Remaining tokens: ${remainingTokens}`);
			console.log(`   - Remaining batches: ${remainingBatches}`);
			console.log(`   - Next alarm at: ${new Date(nextAlarmTime).toISOString()}`);
			console.log(`   - Interval: ${ALARM_INTERVAL_MS / 1000}s`);
			
			await state.storage.setAlarm(nextAlarmTime);
			console.log("✅ [Step 8] Next alarm scheduled");
		}

		console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("✅ ALARM PROCESSING COMPLETE");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	} catch (error) {
		console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("❌ ALARM PROCESSING ERROR");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.error("[Error] Details:", error);
		console.error("[Error] Stack:", error instanceof Error ? error.stack : 'N/A');
		
		console.log("\n[Recovery] Setting retry alarm...");
		const retryTime = Date.now() + ALARM_INTERVAL_MS;
		console.log(`   - Retry at: ${new Date(retryTime).toISOString()}`);
		
		await state.storage.setAlarm(retryTime);
		console.log("✅ [Recovery] Retry alarm scheduled");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
	}
}

async function completeValidation(
	state: any,
	env: Env
): Promise<void> {
	console.log("\n╔════════════════════════════════════════╗");
	console.log("║   COMPLETING VALIDATION PROCESS        ║");
	console.log("╚════════════════════════════════════════╝");
	
	try {
		const redis = createRedisClient(env);
		
		// Step 1: Get staging tokens
		console.log("\n[Complete-1] Fetching staging tokens...");
		const validatedTokens = await redis.get<Token[]>(CACHE_KEYS.STAGING_VALIDATED_TOKENS);
		
		if (!validatedTokens || validatedTokens.length === 0) {
			console.log("⚠️ [Complete-1] No tokens in staging cache");
		} else {
			console.log(`✅ [Complete-1] Found ${validatedTokens.length} tokens in staging`);
			
			// Step 2: Move to validated cache
			console.log("\n[Complete-2] Moving to validated cache...");
			console.log(`   - Source: ${CACHE_KEYS.STAGING_VALIDATED_TOKENS}`);
			console.log(`   - Target: ${CACHE_KEYS.VALIDATED_TOKENS}`);
			console.log(`   - TTL: 1 week`);
			
			await redis.set(CACHE_KEYS.VALIDATED_TOKENS, JSON.stringify(validatedTokens), {
				ex: 7 * 24 * 60 * 60, // 1 week
			});
			
			console.log(`✅ [Complete-2] Moved ${validatedTokens.length} tokens to validated cache`);
			
			// Count validated vs invalid
			const validCount = validatedTokens.filter((t: any) => t.isValidated).length;
			const invalidCount = validatedTokens.length - validCount;
			
			console.log("\n[Complete-2] Validation Summary:");
			console.log(`   - Total tokens: ${validatedTokens.length}`);
			console.log(`   - Successfully validated: ${validCount} (${Math.round(validCount / validatedTokens.length * 100)}%)`);
			console.log(`   - Failed validation: ${invalidCount} (${Math.round(invalidCount / validatedTokens.length * 100)}%)`);
		}

		// Step 3: Clear state
		console.log("\n[Complete-3] Clearing validation state...");
		await state.storage.deleteAlarm();
		console.log("   ✅ Alarm deleted");
		
		await state.storage.put<ValidationState>("validationState", {
			currentPosition: 0,
			totalTokens: 0,
			isProcessing: false,
		});
		console.log("   ✅ State reset");

		console.log("\n╔════════════════════════════════════════╗");
		console.log("║   ✅ VALIDATION COMPLETED SUCCESSFULLY ║");
		console.log("╚════════════════════════════════════════╝\n");
		
	} catch (error) {
		console.log("\n╔════════════════════════════════════════╗");
		console.log("║   ❌ COMPLETION ERROR                  ║");
		console.log("╚════════════════════════════════════════╝");
		console.error("[Complete-Error] Details:", error);
		console.error("[Complete-Error] Stack:", error instanceof Error ? error.stack : 'N/A');
		console.log("");
	}
}
```
