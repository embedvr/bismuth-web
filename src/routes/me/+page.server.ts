import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { logs, minecraft, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { setError, superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';
import { add, isPast, intervalToDuration, formatDuration } from 'date-fns';
import { env } from '$env/dynamic/private';
import ky from 'ky';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return redirect(302, '/login');

	const minecraftUser = (
		await locals.db.select().from(minecraft).where(eq(minecraft.userId, locals.user.id)).limit(1)
	).at(0);

	let can_update = false;
	let until_update = '';
	if (minecraftUser) {
		console.log(minecraftUser);
		if (minecraftUser.updatedAt) {
			const endDate = add(new Date(minecraftUser.updatedAt), { days: 30 });
			if (!isPast(endDate)) {
				can_update = false;
				const duration = intervalToDuration({
					start: new Date(),
					end: endDate
				});
				until_update = formatDuration(duration, {
					format: ['days', 'hours', 'minutes']
				});
				console.log(until_update);
			} else {
				can_update = true;
			}
		}
	}
	console.log(minecraftUser, can_update, until_update);

	return {
		user: locals.user!,
		minecraft: minecraftUser && {
			...minecraftUser,
			can_update: can_update,
			until_update: until_update
		},
		form: await superValidate(zod(formSchema)),
		streamer: env.TWITCH_BROADCASTER_USERNAME
	};
};

export const actions: Actions = {
	default: async (ev) => {
		const form = await superValidate(ev, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		// const player = await players.get(form.data.username);
		// if (!player.uuid) {
		// 	return setError(form, 'username', "Account doesn't exist");
		// }

		const player = await ky
			.get(`https://api.ashcon.app/mojang/v2/user/${form.data.username}`)
			.json<{ uuid: string; username: string }>();

		try {
			await ky.post(`${env.BISMUTH_MINECRAFT_API}/v1/whitelist`, {
				headers: {
					'X-API-Key': env.BISMUTH_MINECRAFT_SECRET
				},
				json: {
					username: player.username
				}
			});
		} catch (e) {
			console.error(e);
			return setError(
				form,
				'username',
				'We had an issue whitelisting your account. Please try again later.'
			);
		}

		await ev.locals.db.insert(minecraft).values({
			userId: ev.locals.user!.id,
			username: player.username,
			uuid: player.uuid.replaceAll('-', '')
		});

		await ev.locals.db.update(users).set({
			updatedAt: new Date()
		});

		await ev.locals.db.insert(logs).values({
			userId: ev.locals.user!.id,
			action: 'add-account',
			data: {
				username: player.username,
				uuid: player.uuid.replaceAll('-', '')
			},
			createdAt: new Date()
		});

		return { form };
	}
};
