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
		prefix,
		suffix,
		wrapperClass,
		onblur,
		oninput
	}: TextInputComponentProps = $props();

	const fieldAttrs = $derived({
		...field.as(type as 'text'),
		'aria-invalid': showIssues ? field.as(type as 'text')['aria-invalid'] : undefined
	});

	let inputElement: HTMLInputElement | undefined = $state();
</script>

{#if type !== 'hidden'}
	{#if label}
		<label class={labelClass} for={name}>{label}</label>
	{/if}
	<div class="sform-input-wrapper {wrapperClass ?? ''}">
		{#if prefix}
			<div class="sform-prefix" onclick={() => inputElement?.focus()} role="presentation">
				{#if typeof prefix === 'function'}{@render prefix()}{:else}{prefix}{/if}
			</div>
		{/if}
		<input
			bind:this={inputElement}
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
		{#if suffix}
			<div class="sform-suffix" onclick={() => inputElement?.focus()} role="presentation">
				{#if typeof suffix === 'function'}{@render suffix()}{:else}{suffix}{/if}
			</div>
		{/if}
	</div>
{:else}
	<input {...fieldAttrs} type="hidden" id={name} />
{/if}
