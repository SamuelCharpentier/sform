<script lang="ts">
	import { createSformContext, type SformContext, type ValidateOn } from './context.svelte.js';

	interface Props {
		validateOn?: ValidateOn;
		onMount?: (ctx: SformContext) => void;
	}

	let { validateOn = 'blur', onMount }: Props = $props();

	const ctx = createSformContext(
		() => validateOn,
		() => [],
		() => {},
		() => {}
	);

	$effect(() => {
		if (onMount) {
			onMount(ctx);
		}
	});
</script>

<div data-testid="context-wrapper">Context Test</div>
