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
		showIssues,
		prefixIcon,
		prefix,
		suffix,
		suffixIcon,
		wrapperClass,
		onblur,
		oninput
	}: TextareaInputProps = $props();

	const fieldAttrs = $derived({
		...field.as('text'),
		'aria-invalid': showIssues ? field.as('text')['aria-invalid'] : undefined
	});

	let textareaElement: HTMLTextAreaElement | undefined = $state();
</script>

{#if label}
	<label class={labelClass} for={name}>{label}</label>
{/if}
<div class="sform-input-wrapper sform-textarea-wrapper {wrapperClass ?? ''}">
	{#if prefixIcon}
		<div class="sform-prefix-icon" onclick={() => textareaElement?.focus()} role="presentation">
			{@render prefixIcon()}
		</div>
	{/if}
	{#if prefix}
		<div class="sform-prefix" onclick={() => textareaElement?.focus()} role="presentation">
			{@render prefix()}
		</div>
	{/if}
	<textarea
		bind:this={textareaElement}
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
	{#if suffix}
		<div class="sform-suffix" onclick={() => textareaElement?.focus()} role="presentation">
			{@render suffix()}
		</div>
	{/if}
	{#if suffixIcon}
		<div class="sform-suffix-icon" onclick={() => textareaElement?.focus()} role="presentation">
			{@render suffixIcon()}
		</div>
	{/if}
</div>
