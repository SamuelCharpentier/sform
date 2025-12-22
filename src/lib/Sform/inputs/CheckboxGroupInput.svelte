<script lang="ts">
	import type { CheckboxGroupInputProps, SelectOption } from '../types.js';

	let {
		field,
		name,
		label,
		class: className,
		labelClass,
		disabled,
		options = [],
		showIssues,
		onblur,
		oninput
	}: CheckboxGroupInputProps = $props();

	// Normalize options to SelectOption format
	const normalizedOptions = $derived(
		options.map((opt): SelectOption => (typeof opt === 'string' ? { value: opt, label: opt } : opt))
	);

	// Helper to get field attrs with controlled aria-invalid
	function getFieldAttrs(optionValue: string) {
		const attrs = field.as('checkbox', optionValue);
		return {
			...attrs,
			'aria-invalid': showIssues ? attrs['aria-invalid'] : undefined
		};
	}
</script>

<fieldset class="sform-checkbox-group {className ?? ''}" {disabled}>
	{#if label}
		<legend class={labelClass}>{label}</legend>
	{/if}
	{#each normalizedOptions as option}
		{@const fieldAttrs = getFieldAttrs(option.value)}
		{@const uniqueId = `${name}-${option.value}`}
		<label class="sform-checkbox-option" class:disabled={option.disabled}>
			<input
				{...fieldAttrs}
				type="checkbox"
				id={uniqueId}
				disabled={disabled || option.disabled}
				{onblur}
				{oninput}
			/>
			<span class="sform-checkbox-label">{option.label}</span>
		</label>
	{/each}
</fieldset>

<style>
	.sform-checkbox-group {
		border: none;
		padding: 0;
		margin: 0;
	}

	.sform-checkbox-group legend {
		padding: 0;
		margin-bottom: 0.5rem;
	}

	.sform-checkbox-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.25rem 0;
	}

	.sform-checkbox-option.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.sform-checkbox-option input {
		margin: 0;
	}
</style>
