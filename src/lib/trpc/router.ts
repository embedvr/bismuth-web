import type { Context } from '$lib/trpc/context';
import { initTRPC, TRPCError } from '@trpc/server';
import { logs, minecraft, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { add, isPast } from 'date-fns';
import ky from 'ky';
import { env } from '$env/dynamic/private';

export const t = initTRPC.context<Context>().create();

export const auth = t.middleware(async ({ next, ctx }) => {
	console.log(ctx);
	if (!ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED'
		});
	}
	return next();
});

export const router = t.router({
	greeting: t.procedure.query(async () => {
		return `Hello tRPC v10 @ ${new Date().toLocaleTimeString()}`;
	}),

	removeAccount: t.procedure.use(auth).mutation(async ({ ctx }) => {
		const minecraftAccount = (
			await ctx.db.select().from(minecraft).where(eq(minecraft.userId, ctx.user!.id))
		).at(0);

		if (!minecraftAccount) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Minecraft account not found'
			});
		}

		const endDate = add(new Date(minecraftAccount.updatedAt), { days: 30 });

		if (!isPast(endDate)) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'Minecraft account is still valid'
			});
		}

		const player = await ky
			.get(`https://api.ashcon.app/mojang/v2/user/${minecraftAccount.uuid}`)
			.json<{ uuid: string; username: string }>();
		if (!player.uuid) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Minecraft account not found'
			});
		}

		try {
			await ky.delete(`${env.BISMUTH_MINECRAFT_API}/v1/whitelist`, {
				headers: {
					'X-API-Key': env.BISMUTH_MINECRAFT_SECRET
				},
				json: {
					username: player.username
				}
			});
		} catch (e) {
			console.error(e);
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'We had an issue deleting your account. Please try again later.'
			});
		}

		await ctx.db.delete(minecraft).where(eq(minecraft.userId, ctx.user!.id));

		await ctx.db.insert(logs).values({
			userId: ctx.user!.id,
			action: 'remove-account',
			data: {
				username: minecraftAccount.username,
				uuid: minecraftAccount.uuid
			},
			createdAt: new Date()
		});

		await ctx.db.update(users).set({
			updatedAt: new Date()
		});

		return true;
	})
});

export const createCaller = t.createCallerFactory(router);

export type Router = typeof router;
