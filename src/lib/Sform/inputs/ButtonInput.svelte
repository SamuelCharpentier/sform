<script lang="ts" generics="T = unknown">
	import type { Snippet } from 'svelte';
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
		label?: string;
		/** Button type */
		buttonType?: 'submit' | 'reset' | 'button';
		/** Button class */
		class?: string;
		/** Whether button is disabled */
		disabled?: boolean;
		/** Children snippet receives ButtonState<T> for custom rendering with typed result */
		children?: Snippet<[ButtonState<T>]>;
		/** Callback that runs before validation/submission (can be async) */
		onsubmit?: () => void | Promise<void>;
	}

	let {
		label = 'Submit',
		buttonType = 'submit',
		class: className,
		disabled = false,
		children,
		onsubmit
	}: Props = $props();

	// Get Sform context for form state and actions
	const sformContext = getSformContext();

	// Get form state from context with the generic type
	const formState = $derived.by(sformContext.getFormState<T>);

	const isDisabled = $derived(disabled || formState.pending);

	async function handleClick(event: MouseEvent) {
		if (buttonType !== 'submit') return;

		event.preventDefault();

		// Focus the button to trigger blur on any focused input before submission
		// This ensures blur validation runs with valid form data, not stale data
		buttonElement.focus();

		if (onsubmit) {
			await onsubmit();
		}

		// Mark form as submitted and all fields dirty so issues display when server responds
		sformContext.markSubmitted();
		sformContext.markAllFieldsDirty();

		// Submit the form via context
		sformContext.submitForm();
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
	{#if children}
		{@render children(formState)}
	{:else}
		{label}
	{/if}
</button>
