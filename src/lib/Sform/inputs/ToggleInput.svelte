<script lang="ts">
	import type { ToggleInputProps } from '../types.js';

	let {
		field,
		name,
		label,
		class: className,
		labelClass,
		disabled,
		onLabel = 'On',
		offLabel = 'Off',
		checkedValue = 'true',
		uncheckedValue = 'false',
		onblur,
		oninput
	}: ToggleInputProps = $props();

	const fieldAttrs = $derived(field.as('checkbox', checkedValue));

	const isChecked = $derived.by(() => {
		const val = field.value();
		return val === checkedValue || val === true;
	});
</script>

{#if label}
	<span id="{name}-label" class={labelClass}>{label}</span>
{/if}
<label class="sform-toggle {className ?? ''}" class:disabled>
	<input
		{...fieldAttrs}
		type="checkbox"
		id={name}
		aria-labelledby={label ? `${name}-label` : undefined}
		{disabled}
		value={checkedValue}
		{onblur}
		{oninput}
	/>
	<span class="sform-toggle-track">
		<span class="sform-toggle-thumb"></span>
	</span>
	<span class="sform-toggle-label">
		{isChecked ? onLabel : offLabel}
	</span>
</label>

<style>
	.sform-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.sform-toggle.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.sform-toggle input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.sform-toggle-track {
		position: relative;
		width: 2.5rem;
		height: 1.25rem;
		background-color: #ccc;
		border-radius: 1rem;
		transition: background-color 0.2s;
	}

	.sform-toggle input:checked + .sform-toggle-track {
		background-color: #4caf50;
	}

	.sform-toggle-thumb {
		position: absolute;
		top: 0.125rem;
		left: 0.125rem;
		width: 1rem;
		height: 1rem;
		background-color: white;
		border-radius: 50%;
		transition: transform 0.2s;
	}

	.sform-toggle input:checked + .sform-toggle-track .sform-toggle-thumb {
		transform: translateX(1.25rem);
	}

	.sform-toggle input:focus + .sform-toggle-track {
		outline: 2px solid #2196f3;
		outline-offset: 2px;
	}
</style>
