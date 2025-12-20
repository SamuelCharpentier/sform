<script lang="ts">
	import type { TextareaInputProps } from '../types.js';

	let {
		field,
		name,
		label,
		placeholder,
		class: className,
		labelClass,
		disabled,
		readonly,
		autocomplete,
		onblur,
		oninput
	}: TextareaInputProps = $props();

	const fieldAttrs = $derived(field.as('text'));
</script>

{#if label}
	<label class={labelClass} for={name}>{label}</label>
{/if}
<textarea
	{...fieldAttrs}
	id={name}
	class={className}
	{placeholder}
	{disabled}
	{readonly}
	{autocomplete}
	{onblur}
	{oninput}
></textarea>
