export interface SchedulerContext {
	env: Env;
	chainId: number;
	storage: {
		get<T = unknown>(key: string): Promise<T | null>;
		put<T = unknown>(key: string, value: T): Promise<void>;
	};
	setAlarm(time: number): void;
	deleteAlarm(): Promise<void>;
}

export async function handleUpdate(ctx: SchedulerContext) {}
