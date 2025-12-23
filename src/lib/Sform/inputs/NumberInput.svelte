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
		prefix,
		suffix,
		wrapperClass,
		showControls = true,
		align = 'start',
		maxDecimals,
		onblur,
		oninput
	}: NumberInputComponentProps = $props();

	const fieldAttrs = $derived({
		...field.as('number'),
		'aria-invalid': showIssues ? field.as('number')['aria-invalid'] : undefined
	});

	const inputStyle = $derived(
		[!showControls && 'appearance: textfield;', align === 'end' && 'text-align: end;']
			.filter(Boolean)
			.join(' ') || undefined
	);

	let inputElement: HTMLInputElement | undefined = $state();

	// Handle keydown to prevent period when maxDecimals is 0
	function handleKeyDown(event: KeyboardEvent) {
		if (maxDecimals === 0 && (event.key === '.' || event.key === ',')) {
			event.preventDefault();
		}
	}

	// Handle input to enforce decimal limits
	function handleInput(event: Event) {
		if (maxDecimals === undefined) {
			oninput?.();
			return;
		}

		const input = event.target as HTMLInputElement;
		const value = input.value;

		// Find decimal separator (. or ,)
		const decimalIndex = Math.max(value.indexOf('.'), value.indexOf(','));

		if (decimalIndex !== -1) {
			const decimals = value.length - decimalIndex - 1;
			if (decimals > maxDecimals) {
				// Truncate to maxDecimals
				const truncated = value.slice(0, decimalIndex + maxDecimals + 1);
				input.value = truncated;
				// Also update the field value
				field.set(parseFloat(truncated) || 0);
			}
		}

		oninput?.();
	}
</script>

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
		class="{className ?? ''}{showControls ? '' : ' sform-number-no-controls'}"
		style={inputStyle}
		{placeholder}
		{min}
		{max}
		{step}
		{disabled}
		{readonly}
		{autocomplete}
		{onblur}
		onkeydown={handleKeyDown}
		oninput={handleInput}
	/>
	{#if suffix}
		<div class="sform-suffix" onclick={() => inputElement?.focus()} role="presentation">
			{#if typeof suffix === 'function'}{@render suffix()}{:else}{suffix}{/if}
		</div>
	{/if}
</div>

<style>
	/* Hide spinbuttons when showControls is false */
	input.sform-number-no-controls::-webkit-outer-spin-button,
	input.sform-number-no-controls::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
