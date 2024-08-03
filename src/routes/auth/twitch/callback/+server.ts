import { OAuth2RequestError } from 'arctic';
import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import { twitch } from '$lib/server/auth';

import { env } from '$env/dynamic/private';

import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET = async (event: RequestEvent) => {
	if (!event.locals.auth) {
		throw new Error('Bismuth is misconfigured and missing the Lucia instance.');
	}

	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('twitch_oauth_state') ?? null;

	if (!code || !state || !storedState || state !== storedState) {
		error(400);
	}

	try {
		const tokens = await twitch.validateAuthorizationCode(code);
		const twitchAuthProvider = new StaticAuthProvider(env.TWITCH_CLIENT_ID, tokens.accessToken, [
			'user:read:subscriptions'
		]);
		const twitchApi = new ApiClient({ authProvider: twitchAuthProvider });

		const user = await twitchApi.getTokenInfo();
		const existingUser = (
			await event.locals.db.select().from(users).where(eq(users.id, user.userId!)).limit(1)
		).at(0);

		const twitchUser = await twitchApi.users.getUserById(user.userId!);
		if (!env.TWITCH_BROADCASTER_ID)
			throw new Error('Bismuth is misconfigured and missing the broadcaster ID.');
		const subscription = await twitchApi.subscriptions.checkUserSubscription(
			twitchUser!,
			env.TWITCH_BROADCASTER_ID
		);

		if (existingUser) {
			const session = await event.locals.auth.createSession(existingUser.id, {});
			const sessionCookie = event.locals.auth.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			if (
				existingUser.subscribed !==
				(subscription !== null || twitchUser!.id === env.TWITCH_BROADCASTER_ID)
			) {
				await event.locals.db.update(users).set({
					subscribed: subscription !== null || twitchUser!.id === env.TWITCH_BROADCASTER_ID
				});
			}
		} else {
			await event.locals.db.insert(users).values({
				id: user.userId!,
				username: user.userName!,
				avatar: twitchUser!.profilePictureUrl,
				subscribed: subscription !== null || twitchUser!.id === env.TWITCH_BROADCASTER_ID
			});

			const session = await event.locals.auth.createSession(user.userId!, {});
			const sessionCookie = event.locals.auth.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			error(400, e.message);
		} else {
			console.log(e);
			error(500);
		}
	}
	redirect(302, '/me');
};
