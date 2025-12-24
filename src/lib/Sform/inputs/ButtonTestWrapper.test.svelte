<script lang="ts">
	import ButtonInput from './ButtonInput.svelte';
	import { createSformContext } from '../context.svelte.js';
	import type { Snippet } from 'svelte';
	import type { ButtonFormState, RemoteFormIssue } from '../types.js';

	interface FormLike {
		pending?: number;
		result?: unknown;
		fields: {
			allIssues?: () => RemoteFormIssue[] | undefined;
		};
	}

	interface Props {
		form: FormLike;
		label?: string;
		buttonType?: 'submit' | 'reset' | 'button';
		class?: string;
		disabled?: boolean;
		onsubmit?: () => void | Promise<void>;
		defaultState?: Snippet<[ButtonFormState]>;
		pendingState?: Snippet<[ButtonFormState]>;
		successState?: Snippet<[ButtonFormState]>;
		errorState?: Snippet<[ButtonFormState]>;
	}

	let {
		form,
		label,
		buttonType,
		class: className,
		disabled,
		onsubmit,
		defaultState,
		pendingState,
		successState,
		errorState
	}: Props = $props();

	// Create and set context for ButtonInput (createSformContext calls setContext internally)
	createSformContext(
		() => 'blur',
		() => [],
		() => {},
		() => {}
	);
</script>

<div data-testid="button-wrapper">
	<ButtonInput
		{form}
		{label}
		{buttonType}
		class={className}
		{disabled}
		{onsubmit}
		{defaultState}
		{pendingState}
		{successState}
		{errorState}
	/>
</div>
