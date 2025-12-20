<script lang="ts">
	import type { SelectInputProps, SelectOption } from '../types.js';

	let {
		field,
		name,
		label,
		class: className,
		labelClass,
		disabled,
		onblur,
		oninput,
		options
	}: SelectInputProps = $props();

	const fieldAttrs = $derived(field.as('select'));

	const normalizedOptions: SelectOption[] = $derived(
		options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))
	);
</script>

{#if label}
	<label class={labelClass} for={name}>{label}</label>
{/if}
<select {...fieldAttrs} id={name} class={className} {disabled} {onblur} {oninput}>
	{#each normalizedOptions as option (option.value)}
		<option value={option.value} disabled={option.disabled}>
			{option.label}
		</option>
	{/each}
</select>
