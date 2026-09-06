<script lang="ts">
	import { createSformContext } from './context.svelte.js';
	import type { SformContext, ValidateOn } from './types.js';
	import { onMount as svelteOnMount } from 'svelte';

	interface Props {
		validateOn?: ValidateOn;
		formDisabled?: boolean;
		onMount?: (ctx: SformContext) => void;
	}

	let { validateOn = 'blur', formDisabled = false, onMount: onMountCallback }: Props = $props();

	const ctx = createSformContext(
		() => validateOn,
		() => [],
		() => {},
		() => {},
		() => ({ fields: { allIssues: () => [] } }),
		() => formDisabled
	);

	// Use onMount lifecycle instead of $effect to avoid infinite loops
	svelteOnMount(() => {
		if (onMountCallback) {
			onMountCallback(ctx);
		}
	});
</script>

<div data-testid="context-wrapper">Context Test</div>
