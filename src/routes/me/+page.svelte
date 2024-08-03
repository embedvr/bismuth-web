<script lang="ts">
	import { page } from '$app/stores';
	import { Clock, LogOut, TriangleAlert, Plus, X } from 'lucide-svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Dialog from '$lib/components/ui/dialog';

	import { formSchema } from './schema';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	import { trpc } from '$lib/trpc/client';
	import { toast } from 'svelte-sonner';
	import { invalidate, invalidateAll } from '$app/navigation';

	export let data: PageData;

	const form = superForm(data.form, {
		validators: zodClient(formSchema)
	});

	let dialogOpen = false;

	const { form: formData, enhance } = form;

	const doRemoveAccount = async () => {
		const res = await trpc($page).removeAccount.mutate();
		if (!res) {
			toast.error('Something went wrong');
		}
		toast.success('Account removed.');
		invalidateAll();
	};
</script>

<Card.Root class="w-[350px]">
	<Card.Header class="flex flex-row items-center gap-2">
		<img src={$page.data.user.avatar} alt="avatar" class="h-10 w-10 rounded-full" />
		<div class="flex flex-col gap-1">
			<Card.Title>{$page.data.user.username}</Card.Title>
			{#if $page.data.user.subscribed}
				<Card.Description>Looks like you're subscribed!</Card.Description>
			{:else}
				<Card.Description>Please subscribe to join the sub-only Minecraft server!</Card.Description>
			{/if}
		</div>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2">
		<Button
			class="w-full bg-[#9146FF] text-white hover:bg-white hover:text-[#9146FF]"
			href={`https://twitch.tv/${data.streamer}`}
		>
			<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4">
				<path
					d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"
					fill="currentColor"
				/>
			</svg>
			Watch {data.streamer} on Twitch
		</Button>
		<Button class="w-full" variant="outline" href="/auth/signout">
			<LogOut class="mr-2 h-4 w-4" />
			Sign out
		</Button>
	</Card.Content>
	<Card.Footer class="flex justify-between text-neutral-500">
		<a
			href="https://github.com/embedvr/bismuth"
			class="transition-colors hover:text-pink-300"
			target="_blank"
		>
			<small>powered by bismuth</small>
		</a>
		<a href="https://addi.lol/twt" class="transition-colors hover:text-pink-300" target="_blank">
			<small>addi.lol</small>
		</a>
	</Card.Footer>
</Card.Root>

{#if data.user.subscribed}
	<Card.Root class="w-[350px]">
		<Card.Header>
			<Card.Title>Your Minecraft Account</Card.Title>
		</Card.Header>
		{#if !$page.data.user.banned}
			{#if data.minecraft}
				<Card.Content class="flex gap-2">
					<img
						src={`https://mc-heads.net/head/${data.minecraft?.uuid}`}
						alt="your minecraft skin"
						class="h-14"
					/>
					<div class="flex flex-col justify-center gap-1">
						<Card.Title class="text-lg font-bold">{data.minecraft?.username}</Card.Title>
						<span class="text-xs text-neutral-400">{data.minecraft?.uuid}</span>
					</div>
				</Card.Content>
				<Card.Footer class="flex items-center justify-end">
					<!-- check if less tahn 30 days -->
					<!-- Operator '>' cannot be applied to types 'Date' and 'number'. -->
					{#if !data.minecraft?.can_update}
						<Button variant="destructive" disabled>
							<Clock class="mr-2 h-4 w-4" />
							{data.minecraft?.until_update} left
						</Button>
					{:else}
						<Button variant="destructive" on:click={doRemoveAccount}>
							<X class="mr-2 h-4 w-4" />
							Remove account
						</Button>
					{/if}
				</Card.Footer>
			{:else}
				<Card.Content>
					<Dialog.Root bind:open={dialogOpen}>
						<Dialog.Trigger class={`${buttonVariants({ variant: 'default' })} w-full`}>
							<Plus class="mr-2 h-4 w-4" />
							Add Minecraft account
						</Dialog.Trigger>

						<Dialog.Content class="sm:max-w-[425px]">
							<form method="POST" use:enhance>
								<Dialog.Header>
									<Dialog.Title>Add a Minecraft account</Dialog.Title>
								</Dialog.Header>

								<div class="my-2">
									<Form.Field {form} name="username">
										<Form.Control let:attrs>
											<Form.Label>Username</Form.Label>
											<Input {...attrs} bind:value={$formData.username} />
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
								</div>

								<Dialog.Footer>
									<Form.Button>Submit</Form.Button>
								</Dialog.Footer>
							</form>
						</Dialog.Content>
					</Dialog.Root>
				</Card.Content>
			{/if}
		{:else}
			<Card.Content>
				<Alert.Root variant="destructive">
					<TriangleAlert class="h-4 w-4" />
					<Alert.Title>You're banned!</Alert.Title>
					<Alert.Description>You've been banned from the server.</Alert.Description>
				</Alert.Root>
			</Card.Content>
		{/if}
	</Card.Root>
{/if}
