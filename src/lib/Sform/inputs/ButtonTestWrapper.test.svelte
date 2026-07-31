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
		onsubmit?: () => void | Promise<void>;
		lifecycle?: SformLifecycleHooks;
		children?: Snippet<[ButtonState]>;
	}

	let {
		form,
		label,
		buttonType,
		class: className,
		disabled,
		onsubmit,
		lifecycle,
		children
	}: Props = $props();

	// Create and set context for ButtonInput (createSformContext calls setContext internally)
	// Pass form getter for state derivation
	const context = createSformContext(
		() => 'blur',
		() => [],
		() => {},
		() => {},
		() => form
	);

	$effect(() => {
		if (!lifecycle) return;
		return context.registerLifecycleHooks(lifecycle);
	});
</script>

<div data-testid="button-wrapper">
	<ButtonInput {form} {label} {buttonType} class={className} {disabled} {onsubmit} {children} />
</div>
