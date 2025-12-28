<script lang="ts" generics="T = unknown">
	import type { Snippet } from 'svelte';
	import type { RemoteFormIssue } from './types.js';

	/**
	 * Minimal form shape needed for type inference.
	 * This allows the component to infer T from the form's result type.
	 */
	interface FormLike<Output> {
		result?: Output;
		fields: {
			allIssues?: () => RemoteFormIssue[] | undefined;
			[key: string]: unknown;
		};
	}

	interface Props {
		/** The remote form - used to infer the result type T */
		form: FormLike<T>;
		/** Children snippet receives the result (guaranteed to be defined) */
		children: Snippet<[T]>;
		/** CSS class for the wrapper */
		class?: string;
	}

	let { form, children, class: className }: Props = $props();

	// Only show when there's a result
	const hasResult = $derived(form.result !== undefined);
</script>

{#if hasResult}
	<div class={className}>
		{@render children(form.result as T)}
	</div>
{/if}
