<script lang="ts">
	import { createSformContext } from './context.svelte.js';
	import type { SformContext, ValidateOn } from './types.js';
	import { onMount as svelteOnMount } from 'svelte';

	interface Props {
		validateOn?: ValidateOn;
		onMount?: (ctx: SformContext) => void;
	}

	let { validateOn = 'blur', onMount: onMountCallback }: Props = $props();

	const ctx = createSformContext(
		() => validateOn,
		() => [],
		() => {},
		() => {}
	);

	// Use onMount lifecycle instead of $effect to avoid infinite loops
	svelteOnMount(() => {
		if (onMountCallback) {
			onMountCallback(ctx);
		}
	});
</script>

<div data-testid="context-wrapper">Context Test</div>
