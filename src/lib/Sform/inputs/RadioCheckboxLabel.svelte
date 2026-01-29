<script lang="ts" generics="InputType extends HTMLInputTypeAttribute & ('checkbox' | 'radio')">
	import type { HTMLInputTypeAttribute } from 'svelte/elements';
	import type { SelectOption } from '../types';

	type FieldAttrs<InputType> = {
		'aria-invalid'?: boolean | 'false' | 'true';
		name: string;
		type: InputType;
		value?: string;
		checked: boolean;
	};
	type Props = {
		fieldAttrs: FieldAttrs<InputType>;
		uniqueId: string;
		option: SelectOption;
		disabled?: boolean;
		onblur?: (event: FocusEvent) => void;
		oninput?: (event: Event) => void;
	};
	let { fieldAttrs, uniqueId, option, disabled, onblur, oninput }: Props = $props();
</script>

<label class={`sform-${fieldAttrs.type}-option`} class:disabled={option.disabled}>
	<input {...fieldAttrs} id={uniqueId} disabled={disabled || option.disabled} {onblur} {oninput} />
	{#if typeof option.label === 'function'}
		{@render option.label(option)}
	{:else}
		<span class={`sform-${fieldAttrs.type}-label`}>{option.label}</span>
	{/if}
</label>

<style>
	.sform-checkbox-option,
	.sform-radio-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.25rem 0;
	}

	:is(.sform-checkbox-option, .sform-radio-option).disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	:is(.sform-checkbox-option, .sform-radio-option) input {
		margin: 0;
	}
</style>
