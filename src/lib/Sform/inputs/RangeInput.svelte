<script lang="ts">
	import type { RangeInputProps } from '../types.js';

	let {
		field,
		name,
		label,
		class: className,
		labelClass,
		min = 0,
		max = 100,
		step = 1,
		disabled,
		showValue = true,
		formatValue = (v: number) => String(v),
		onblur,
		oninput
	}: RangeInputProps = $props();

	const fieldAttrs = $derived(field.as('range'));

	// Get current value for display
	const currentValue = $derived.by(() => {
		const val = field.value();
		return typeof val === 'number' ? val : Number(val) || Number(min);
	});
</script>

{#if label}
	<label class={labelClass} for={name}>{label}</label>
{/if}
<div class="sform-range-wrapper">
	<input
		{...fieldAttrs}
		type="range"
		id={name}
		class={className}
		{min}
		{max}
		{step}
		{disabled}
		{onblur}
		{oninput}
	/>
	{#if showValue}
		<output for={name} class="sform-range-value">
			{formatValue(currentValue)}
		</output>
	{/if}
</div>

<style>
	.sform-range-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sform-range-value {
		min-width: 3ch;
		text-align: right;
	}
</style>
