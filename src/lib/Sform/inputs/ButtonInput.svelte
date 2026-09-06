<script lang="ts" generics="T = unknown">
	import { tick } from 'svelte';
	import type { ButtonInputProps } from '../types.js';
	import { getSformContext } from '../context.svelte.js';

	let {
		form,
		label = 'Submit',
		buttonType = 'submit',
		class: className,
		disabled = false,
		onsubmit,
		children
	}: ButtonInputProps<T> = $props();

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

	const isDisabled = $derived(
		disabled || formState.pending || !hasForm || sformContext.disabled
	);

	async function handleClick(event: MouseEvent) {
		if (buttonType !== 'submit') return;

		event.preventDefault();

		if (sformContext.disabled) return;

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
	{#if children}
		{@render children(formState)}
	{:else if typeof label === 'function'}
		{@render label(formState)}
	{:else}
		{label}
	{/if}
</button>
