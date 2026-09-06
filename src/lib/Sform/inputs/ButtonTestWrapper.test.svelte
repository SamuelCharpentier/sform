<script lang="ts">
	import ButtonInput from './ButtonInput.svelte';
	import { createSformContext } from '../context.svelte.js';
	import type { Snippet } from 'svelte';
	import type { ButtonState, RemoteFormIssue, SformLifecycleHooks } from '../types.js';

	interface FormLike {
		pending?: number;
		result?: unknown;
		fields: {
			allIssues?: () => RemoteFormIssue[] | undefined;
			[key: string]: unknown;
		};
	}

	interface Props {
		form: FormLike;
		label?: string;
		buttonType?: 'submit' | 'reset' | 'button';
		class?: string;
		disabled?: boolean;
		formDisabled?: boolean;
		onsubmit?: () => void | Promise<void>;
		lifecycle?: SformLifecycleHooks;
		children?: Snippet<[ButtonState]>;
		/** Render ButtonInput's `children` prop as a real snippet receiving the typed state */
		useChildrenSnippet?: boolean;
		/** Render ButtonInput's `label` prop as a real snippet receiving the typed state */
		useLabelSnippet?: boolean;
	}

	let {
		form,
		label,
		buttonType,
		class: className,
		disabled,
		formDisabled = false,
		onsubmit,
		lifecycle,
		children,
		useChildrenSnippet = false,
		useLabelSnippet = false
	}: Props = $props();

	// Create and set context for ButtonInput (createSformContext calls setContext internally)
	// Pass form getter for state derivation
	const context = createSformContext(
		() => 'blur',
		() => [],
		() => {},
		() => {},
		() => form,
		() => formDisabled
	);

	$effect(() => {
		if (!lifecycle) return;
		return context.registerLifecycleHooks(lifecycle);
	});
</script>

{#snippet childrenSnippet(state: ButtonState)}
	children-state:{state.state}
{/snippet}

{#snippet labelSnippet(state: ButtonState)}
	label-state:{state.state}
{/snippet}

<div data-testid="button-wrapper">
	<ButtonInput
		{form}
		label={useLabelSnippet ? labelSnippet : label}
		{buttonType}
		class={className}
		{disabled}
		{onsubmit}
		children={useChildrenSnippet ? childrenSnippet : children}
	/>
</div>
