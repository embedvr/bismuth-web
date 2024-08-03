import { Lucia } from 'lucia';
import { Twitch } from 'arctic';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';

import { users, sessions } from './db/schema';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

import type { DrizzleD1Database } from 'drizzle-orm/d1';

export const lucia = (db: DrizzleD1Database) => {
	const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

	return new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				secure: !dev
			}
		},
		getUserAttributes: (attr) => {
			return {
				id: attr.id,
				username: attr.username,
				avatar: attr.avatar,
				subscribed: attr.subscribed,
				banned: attr.banned,
				createdAt: attr.createdAt,
				updatedAt: attr.updatedAt
			};
		}
	});
};

export const twitch = new Twitch(
	env.TWITCH_CLIENT_ID,
	env.TWITCH_CLIENT_SECRET,
	env.TWITCH_CALLBACK_URL
	// 'https://bismuth-web.pages.dev/auth/twitch/callback'
);

declare module 'lucia' {
	interface Register {
		Lucia: ReturnType<typeof lucia>;
		DatabaseUserAttributes: {
			id: string;
			username: string;
			avatar: string;
			subscribed: boolean;
			banned: boolean;
			createdAt: Date;
			updatedAt: Date;
		};
	}
}
