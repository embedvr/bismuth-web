<script>
	import '@fontsource/geist-sans';
	import '@fontsource/geist-mono';
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
</script>

<Toaster />

<div class="container mx-auto flex h-screen flex-col items-center justify-center gap-4">
	<slot />
</div>
