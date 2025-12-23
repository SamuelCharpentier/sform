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
		prefixIcon,
		prefix,
		suffix,
		suffixIcon,
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
		{#if prefixIcon}
			<div class="sform-prefix-icon" onclick={() => inputElement?.focus()} role="presentation">
				{@render prefixIcon()}
			</div>
		{/if}
		{#if prefix}
			<div class="sform-prefix" onclick={() => inputElement?.focus()} role="presentation">
				{@render prefix()}
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
				{@render suffix()}
			</div>
		{/if}
		{#if suffixIcon}
			<div class="sform-suffix-icon" onclick={() => inputElement?.focus()} role="presentation">
				{@render suffixIcon()}
			</div>
		{/if}
	</div>
{:else}
	<input {...fieldAttrs} type="hidden" id={name} />
{/if}
