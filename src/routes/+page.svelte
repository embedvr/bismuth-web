<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
</script>

<Card.Root class="w-[350px]">
	<Card.Header>
		<Card.Title>Connect your Twitch account.</Card.Title>
		<Card.Description>Please login to whitelist your account.</Card.Description>
	</Card.Header>
	<Card.Content>
		<Button
			class="w-full bg-[#9146FF] text-white hover:bg-white hover:text-[#9146FF]"
			href="/auth/twitch"
		>
			<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4">
				<path
					d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"
					fill="currentColor"
				/>
			</svg>
			Login with Twitch
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
