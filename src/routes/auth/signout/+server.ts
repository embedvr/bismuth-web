import { error, redirect, type RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	if (!event.locals.session) {
		return error(401);
	}

	await event.locals.auth.invalidateSession(event.locals.session.id);
	const sessionCookie = event.locals.auth.createBlankSessionCookie();
	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});

	redirect(302, '/');
};
