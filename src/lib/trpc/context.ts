import type { RequestEvent } from '@sveltejs/kit';

export async function createContext(event: RequestEvent) {
	console.log('ctx running');
	return {
		user: event.locals.user,
		session: event.locals.session,
		db: event.locals.db,
		auth: event.locals.auth
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
