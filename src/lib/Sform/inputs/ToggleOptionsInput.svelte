<script lang="ts">
	import type { ToggleOptionsInputProps, ToggleOption } from '../types.js';

	let {
		field,
		name,
		label,
		class: className,
		labelClass,
		disabled,
		options,
		multiple = false,
		showIssues,
		onblur,
		oninput
	}: ToggleOptionsInputProps = $props();

	// Normalize options to ToggleOption format
	const normalizedOptions: ToggleOption[] = $derived(
		options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))
	);

	// Helper to get field attrs with controlled aria-invalid
	function getFieldAttrs(optionValue: string) {
		const inputType = multiple ? 'checkbox' : 'radio';
		const attrs = field.as(inputType, optionValue);
		return {
			...attrs,
			'aria-invalid': showIssues ? attrs['aria-invalid'] : undefined
		};
	}
</script>

{#if label}
	<span id="{name}-label" class={labelClass}>{label}</span>
{/if}
<div
	class="sform-toggle-options {className ?? ''}"
	role={multiple ? 'group' : 'radiogroup'}
	aria-labelledby={label ? `${name}-label` : undefined}
	aria-label={!label ? name : undefined}
>
	{#each normalizedOptions as option (option.value)}
		{@const optionDisabled = disabled || option.disabled}
		{@const fieldAttrs = getFieldAttrs(option.value)}
		{@const inputId = `${name}-${option.value}`}
		<label class="sform-toggle-option" class:disabled={optionDisabled} for={inputId}>
			<input
				{...fieldAttrs}
				type={multiple ? 'checkbox' : 'radio'}
				id={inputId}
				disabled={optionDisabled}
				{onblur}
				{oninput}
			/>
			<span>{option.label}</span>
		</label>
	{/each}
</div>

<style>
	.sform-toggle-options {
		display: inline-flex;
		border-radius: 0.375rem;
		overflow: hidden;
		border: 1px solid #ccc;
	}

	.sform-toggle-option {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		background: white;
		cursor: pointer;
		transition:
			background-color 0.15s,
			color 0.15s;
	}

	.sform-toggle-option:not(:last-child) {
		border-right: 1px solid #ccc;
	}

	.sform-toggle-option:hover:not(.disabled) {
		background-color: #f5f5f5;
	}

	/* Hide the actual input but keep it functional */
	.sform-toggle-option input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* Style when checked */
	.sform-toggle-option:has(input:checked) {
		background-color: #2196f3;
		color: white;
	}

	.sform-toggle-option:has(input:checked):hover {
		background-color: #1976d2;
	}

	.sform-toggle-option.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Focus styles */
	.sform-toggle-option:has(input:focus-visible) {
		outline: 2px solid #2196f3;
		outline-offset: -2px;
		z-index: 1;
	}
</style>
