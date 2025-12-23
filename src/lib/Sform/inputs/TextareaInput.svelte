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
		prefix,
		suffix,
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
	{#if prefix}
		<div class="sform-prefix" onclick={() => textareaElement?.focus()} role="presentation">
			{#if typeof prefix === 'function'}{@render prefix()}{:else}{prefix}{/if}
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
			{#if typeof suffix === 'function'}{@render suffix()}{:else}{suffix}{/if}
		</div>
	{/if}
</div>
