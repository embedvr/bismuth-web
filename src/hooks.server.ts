import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

import { drizzle } from 'drizzle-orm/d1';

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.platform) {
		return resolve(event);
	}
	if (!event.platform?.env.D1) {
		return resolve(event);
	}

	event.locals.db = drizzle(event.platform.env.D1);
	event.locals.auth = lucia(event.locals.db);

	const sessionId = event.cookies.get(event.locals.auth.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await event.locals.auth.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = event.locals.auth.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	if (!session) {
		const sessionCookie = event.locals.auth.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
