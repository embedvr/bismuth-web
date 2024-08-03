import { env } from '$env/dynamic/private';
import { minecraft, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ request, locals, params }) {
	console.log('asdasd');

	const apiKey = request.headers.get('X-API-Key');
	if (apiKey !== env.BISMUTH_MINECRAFT_SECRET) {
		return new Response('Unauthorized', { status: 401 });
	}

	const uuid = params.uuid;

	const player = (
		await locals.db.select().from(minecraft).where(eq(minecraft.uuid, uuid)).limit(1)
	).at(0);

	if (!player) {
		return new Response('Not found', { status: 404 });
	}

	const user = (
		await locals.db.select().from(users).where(eq(users.id, player.userId)).limit(1)
	).at(0);

	if (!user) {
		return new Response('Not found', { status: 404 });
	}

	return new Response(
		JSON.stringify({
			username: user.username,
			uuid: player.uuid
		}),
		{ status: 200, headers: { 'Content-Type': 'application/json' } }
	);
}
