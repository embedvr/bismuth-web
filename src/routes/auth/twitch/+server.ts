import { redirect } from '@sveltejs/kit';
import { generateState } from 'arctic';
import { twitch } from '$lib/server/auth';
import { dev } from '$app/environment';

import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	const state = generateState();
	const url = await twitch.createAuthorizationURL(state, {
		scopes: ['user:read:subscriptions']
	});

	event.cookies.set('twitch_oauth_state', state, {
		path: '/',
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	redirect(302, url.toString());
};
