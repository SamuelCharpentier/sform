<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ButtonFormState, RemoteFormIssue } from '../types.js';
	import { getSformContext } from '../context.svelte.js';

	interface FormLike {
		pending?: number;
		result?: unknown;
		fields: {
			allIssues?: () => RemoteFormIssue[] | undefined;
		};
	}

	interface Props {
		/** The remote form - required for button state */
		form: FormLike;
		/** Button text (used if no snippets provided) */
		label?: string;
		/** Button type */
		buttonType?: 'submit' | 'reset' | 'button';
		/** Button class */
		class?: string;
		/** Whether button is disabled */
		disabled?: boolean;
		/** Callback that runs before validation/submission (can be async) */
		onsubmit?: () => void | Promise<void>;
		/** Snippet for default state */
		defaultState?: Snippet<[ButtonFormState]>;
		/** Snippet for pending state */
		pendingState?: Snippet<[ButtonFormState]>;
		/** Snippet for success state */
		successState?: Snippet<[ButtonFormState]>;
		/** Snippet for error/issues state */
		errorState?: Snippet<[ButtonFormState]>;
	}

	let {
		form,
		label = 'Submit',
		buttonType = 'submit',
		class: className,
		disabled = false,
		onsubmit,
		defaultState,
		pendingState,
		successState,
		errorState
	}: Props = $props();

	// Get Sform context to trigger validation display
	const sformContext = getSformContext();

	const formState: ButtonFormState = $derived.by(() => {
		const pending = (form.pending ?? 0) !== 0;
		const hasResult = form.result !== undefined;
		const issues = form.fields.allIssues?.() ?? [];
		const hasIssues = issues.length > 0;

		return {
			pending,
			success: hasResult && !hasIssues && !pending,
			hasIssues,
			result: form.result
		};
	});

	const isDisabled = $derived(disabled || formState.pending);

	async function handleClick(event: MouseEvent) {
		if (buttonType !== 'submit' || !onsubmit) return;

		event.preventDefault();
		await onsubmit();

		// Mark form as submitted and all fields dirty so issues display when server responds
		sformContext.markSubmitted();
		sformContext.markAllFieldsDirty();

		// Submit the form via context
		sformContext.submitForm();
	}
</script>

<button type={buttonType} class={className} disabled={isDisabled} onclick={handleClick}>
	{#if formState.pending && pendingState}
		{@render pendingState(formState)}
	{:else if formState.success && successState}
		{@render successState(formState)}
	{:else if formState.hasIssues && errorState}
		{@render errorState(formState)}
	{:else if defaultState}
		{@render defaultState(formState)}
	{:else}
		{label}
	{/if}
</button>
