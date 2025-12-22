<script lang="ts">
	import type { TextInputComponentProps } from '../types.js';

	let {
		field,
		type,
		name,
		label,
		placeholder,
		class: className,
		labelClass,
		disabled,
		readonly,
		autocomplete,
		showIssues,
		onblur,
		oninput
	}: TextInputComponentProps = $props();

	const fieldAttrs = $derived({
		...field.as(type as 'text'),
		'aria-invalid': showIssues ? field.as(type as 'text')['aria-invalid'] : undefined
	});
</script>

{#if type !== 'hidden'}
	{#if label}
		<label class={labelClass} for={name}>{label}</label>
	{/if}
	<input
		{...fieldAttrs}
		id={name}
		class={className}
		{placeholder}
		{disabled}
		{readonly}
		{autocomplete}
		{onblur}
		{oninput}
	/>
{:else}
	<input {...fieldAttrs} type="hidden" id={name} />
{/if}
