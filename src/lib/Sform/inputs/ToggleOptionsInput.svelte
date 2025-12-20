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
		onblur,
		oninput
	}: ToggleOptionsInputProps = $props();

	// Normalize options to ToggleOption format
	const normalizedOptions: ToggleOption[] = $derived(
		options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))
	);

	// Get current value(s)
	const currentValue = $derived.by(() => {
		const val = field.value();
		if (multiple) {
			return Array.isArray(val) ? val : val ? [val] : [];
		}
		return val;
	});

	function isSelected(optionValue: string): boolean {
		const val = currentValue;
		if (multiple) {
			return (val as string[]).includes(optionValue);
		}
		return val === optionValue;
	}

	function handleSelect(optionValue: string) {
		if (multiple) {
			const current = currentValue as string[];
			if (current.includes(optionValue)) {
				field.set(current.filter((v) => v !== optionValue));
			} else {
				field.set([...current, optionValue]);
			}
		} else {
			field.set(optionValue);
		}
		oninput?.();
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
		{@const selected = isSelected(option.value)}
		{@const optionDisabled = disabled || option.disabled}
		<button
			type="button"
			class="sform-toggle-option"
			class:selected
			class:disabled={optionDisabled}
			disabled={optionDisabled}
			role={multiple ? 'checkbox' : 'radio'}
			aria-checked={selected}
			onclick={() => handleSelect(option.value)}
			{onblur}
		>
			{option.label}
		</button>
	{/each}
	<!-- Hidden input for form submission -->
	<input type="hidden" {name} value={JSON.stringify(currentValue)} />
</div>

<style>
	.sform-toggle-options {
		display: inline-flex;
		border-radius: 0.375rem;
		overflow: hidden;
		border: 1px solid #ccc;
	}

	.sform-toggle-option {
		padding: 0.5rem 1rem;
		border: none;
		background: white;
		cursor: pointer;
		transition:
			background-color 0.15s,
			color 0.15s;
	}

	.sform-toggle-option:not(:last-child) {
		border-right: 1px solid #ccc;
	}

	.sform-toggle-option:hover:not(.disabled):not(.selected) {
		background-color: #f5f5f5;
	}

	.sform-toggle-option.selected {
		background-color: #2196f3;
		color: white;
	}

	.sform-toggle-option.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.sform-toggle-option:focus {
		outline: 2px solid #2196f3;
		outline-offset: -2px;
		z-index: 1;
	}
</style>
