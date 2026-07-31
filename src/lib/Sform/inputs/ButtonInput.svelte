<script lang="ts" generics="T = unknown">
	import { tick, type Snippet } from 'svelte';
	import type { ButtonState, RemoteFormIssue } from '../types.js';
	import { getSformContext } from '../context.svelte.js';

	/**
	 * Minimal form shape needed for type inference.
	 * This allows the component to infer T from the form's result type.
	 */
	interface FormLike<Output> {
		result?: Output;
		pending?: number;
		fields: {
			allIssues?: () => RemoteFormIssue[] | undefined;
			[key: string]: unknown;
		};
	}

	interface Props {
		/** The remote form - used to infer the result type T */
		form: FormLike<T>;
		/** Button text (used if no children snippet provided) */
		label?: string | Snippet<[ButtonState<T>]>;
		/** Button type */
		buttonType?: 'submit' | 'reset' | 'button';
		/** Button class */
		class?: string;
		/** Whether button is disabled */
		disabled?: boolean;
		/** Callback that runs before validation/submission (can be async) */
		onsubmit?: () => void | Promise<void>;
	}

	let {
		form,
		label = 'Submit',
		buttonType = 'submit',
		class: className,
		disabled = false,
		onsubmit
	}: Props = $props();

	$effect(() => {
		// Keep the prop "form" observably consumed for strict compiler checks.
		void form.result;
		void form.pending;
		void form.fields;
	});

	const hasForm = $derived(form !== undefined);

	// Get Sform context for form state and actions
	const sformContext = getSformContext();

	// Get form state from context with the generic type
	const formState = $derived.by(sformContext.getFormState<T>);

	const isDisabled = $derived(disabled || formState.pending || !hasForm);

	async function handleClick(event: MouseEvent) {
		if (buttonType !== 'submit') return;

		event.preventDefault();

		// Focus the button to trigger blur on any focused input before submission
		// This ensures blur validation runs with valid form data, not stale data
		buttonElement.focus();

		await tick();

		if (onsubmit) {
			await onsubmit();
		}

		await sformContext.runLifecycleHooks('beforeSubmit');

		// Mark form as submitted and all fields dirty so issues display when server responds
		sformContext.markSubmitted();
		sformContext.markAllFieldsDirty();

		// Submit the form via context
		sformContext.submitForm();
		await sformContext.runLifecycleHooks('afterSubmitTriggered');
	}
	let buttonElement: HTMLButtonElement;
</script>

<button
	bind:this={buttonElement}
	type={buttonType}
	class={className}
	disabled={isDisabled}
	onclick={handleClick}
>
	{#if typeof label === 'function'}
		{@render label(formState)}
	{:else}
		{label}
	{/if}
</button>
