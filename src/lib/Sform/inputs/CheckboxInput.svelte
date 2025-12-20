<script lang="ts">
	import type { CheckboxRadioInputProps } from '../types.js';

	let {
		field,
		name,
		label,
		class: className,
		labelClass,
		disabled,
		value,
		onblur,
		oninput
	}: CheckboxRadioInputProps = $props();

	// Single boolean checkbox - no value needed
	const fieldAttrs = $derived(field.as('checkbox'));
</script>

<label class="sform-checkbox {className ?? ''}" class:disabled>
	<input {...fieldAttrs} type="checkbox" id={name} {disabled} {onblur} {oninput} />
	{#if label}
		<span class={labelClass}>{label}</span>
	{/if}
</label>

<style>
	.sform-checkbox {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.sform-checkbox.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.sform-checkbox input {
		margin: 0;
	}
</style>
