// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { lucia } from '$lib/server/auth';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

declare global {
	namespace App {
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}

		interface Locals {
			db: DrizzleD1Database;
			auth: ReturnType<typeof lucia>;
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}
	}
}

export {};
