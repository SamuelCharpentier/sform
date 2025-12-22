<script lang="ts">
	import type { NumberInputComponentProps } from '../types.js';

	let {
		field,
		name,
		label,
		placeholder,
		class: className,
		labelClass,
		min,
		max,
		step,
		disabled,
		readonly,
		autocomplete,
		showIssues,
		onblur,
		oninput
	}: NumberInputComponentProps = $props();

	const fieldAttrs = $derived({
		...field.as('number'),
		'aria-invalid': showIssues ? field.as('number')['aria-invalid'] : undefined
	});
</script>

{#if label}
	<label class={labelClass} for={name}>{label}</label>
{/if}
<input
	{...fieldAttrs}
	id={name}
	class={className}
	{placeholder}
	{min}
	{max}
	{step}
	{disabled}
	{readonly}
	{autocomplete}
	{onblur}
	{oninput}
/>
