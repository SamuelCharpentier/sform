<script lang="ts">
	import ButtonInput from './ButtonInput.svelte';
	import { createSformContext } from '../context.svelte.js';

	interface Props {
		form: unknown;
		label?: string;
		class?: string;
		buttonType?: 'submit' | 'reset' | 'button';
		disabled?: boolean;
		onsubmit?: () => void | Promise<void>;
	}

	let { form, label, class: className, buttonType, disabled, onsubmit }: Props = $props();

	// Create context so ButtonInput can use it
	createSformContext(
		() => 'blur',
		() => [],
		() => {},
		() => {}
	);
</script>

<div data-testid="button-wrapper">
	<ButtonInput {form} {label} class={className} {buttonType} {disabled} {onsubmit} />
</div>
