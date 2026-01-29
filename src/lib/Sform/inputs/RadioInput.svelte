<script lang="ts">
	import type { RadioInputProps, SelectOption } from '../types.js';
	import Fieldset from '../utils/Fieldset.svelte';
	import RadioCheckboxLabel from './RadioCheckboxLabel.svelte';

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
	}: RadioInputProps = $props();

	// Normalize options to SelectOption format
	const normalizedOptions = $derived(
		options.map((opt): SelectOption => (typeof opt === 'string' ? { value: opt, label: opt } : opt))
	);

	// Helper to get field attrs with controlled aria-invalid
	function getFieldAttrs(optionValue: string) {
		const attrs = field.as('radio', optionValue);
		return {
			...attrs,
			'aria-invalid': showIssues ? attrs['aria-invalid'] : undefined
		};
	}
</script>

<Fieldset {label} {labelClass} {className} {disabled} type="radio">
	{#each normalizedOptions as option}
		{@const fieldAttrs = getFieldAttrs(option.value)}
		{@const uniqueId = `${name}-${option.value}`}
		<RadioCheckboxLabel {fieldAttrs} {uniqueId} {option} {disabled} {onblur} {oninput} />
	{/each}
</Fieldset>
