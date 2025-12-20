<script lang="ts" generics="Input extends import('@sveltejs/kit').RemoteFormInput, Output">
	import type { RemoteForm, VisibilityMode } from './types.js';
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import { createSformContext } from './context.svelte.js';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {
		form,
		schema,
		visibility = 'blur',
		class: className,
		children
	}: {
		form: RemoteForm<Input, Output>;
		schema?: StandardSchemaV1<Input, unknown>;
		visibility?: VisibilityMode;
		class?: string;
		children: Snippet;
	} = $props();

	const context = createSformContext(
		() => form,
		() => visibility
	);

	const formProps = $derived(schema ? form.preflight(schema) : form);

	// Track previous pending state to detect submission completion
	let wasPending = $state(false);

	$effect(() => {
		const isPending = form.pending !== 0;
		const hasResult = form.result !== undefined;
		const allIssues =
			(form.fields as { allIssues?: () => unknown[] | undefined }).allIssues?.() ?? [];
		const hasNoIssues = allIssues.length === 0;

		// Submission just completed successfully (was pending, now not, has result, no issues)
		if (wasPending && !isPending && hasResult && hasNoIssues) {
			context.resetFieldStates();
		}

		wasPending = isPending;
	});

	function handleInput() {
		form.validate();
	}

	function handleSubmit() {
		context.markSubmitted();
		context.markAllFieldsDirty();
	}
</script>

<form
	{...formProps as unknown as HTMLFormAttributes}
	class={className}
	novalidate
	oninput={handleInput}
	onsubmit={handleSubmit}
>
	{@render children()}
</form>
