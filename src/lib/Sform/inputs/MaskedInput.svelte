<script lang="ts">
	import type { BaseInputComponentProps } from '../types.js';
	import { applyMask, MASK_PATTERNS, type MaskPattern, type MaskToken } from '../utils/mask.js';

	interface MaskedInputProps extends BaseInputComponentProps {
		/** The mask pattern or a preset name */
		mask: string | MaskPattern;
		/** Custom token definitions */
		tokens?: Record<string, MaskToken>;
		/** Placeholder character for unfilled positions */
		maskPlaceholder?: string;
		/** Whether to show the full mask with placeholders */
		showMaskPlaceholder?: boolean;
		/** Whether to store the unmasked (raw) value. If true, stores '1234567890'. If false, stores '(123) 456-7890'. Default: true */
		unmaskValue?: boolean;
	}

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
		mask,
		tokens,
		maskPlaceholder = '_',
		showMaskPlaceholder = false,
		unmaskValue = true,
		showIssues,
		onblur,
		oninput
	}: MaskedInputProps = $props();

	// Resolve mask pattern
	const resolvedMask = $derived(mask in MASK_PATTERNS ? MASK_PATTERNS[mask as MaskPattern] : mask);

	// Get aria-invalid from field, respecting showIssues
	const ariaInvalid = $derived(showIssues ? field.as('text')['aria-invalid'] : undefined);

	let inputElement: HTMLInputElement | undefined = $state();

	// Local display value state - synced with field
	let displayValue = $state('');
	let maskComplete = $state(false);

	// Track the last value WE stored to distinguish our updates from external changes
	let lastStoredValue: string | undefined = undefined;

	// Initialize from field value - only for EXTERNAL changes (initial load, programmatic updates)
	$effect(() => {
		const fieldVal = field.value();
		const val = typeof fieldVal === 'string' ? fieldVal : '';

		// Only sync from field if this is NOT a value we just stored
		// This prevents the $effect from fighting with user input
		if (val === lastStoredValue) {
			// This is our own update echoing back, ignore it
			return;
		}

		if (val) {
			const result = applyMask(val, {
				mask: resolvedMask,
				tokens,
				placeholder: maskPlaceholder,
				showPlaceholder: showMaskPlaceholder
			});
			displayValue = result.masked;
			maskComplete = result.complete;
			// Update lastStoredValue to match what we're displaying
			lastStoredValue = unmaskValue ? result.raw : result.masked;
		} else {
			displayValue = '';
			maskComplete = false;
			lastStoredValue = '';
		}
	});

	function processInput(
		inputValue: string,
		cursorPos: number
	): { masked: string; raw: string; cursorPosition: number; complete: boolean } {
		const result = applyMask(
			inputValue,
			{
				mask: resolvedMask,
				tokens,
				placeholder: maskPlaceholder,
				showPlaceholder: showMaskPlaceholder
			},
			cursorPos
		);

		return result;
	}

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const cursorPos = input.selectionStart ?? 0;

		const result = processInput(input.value, cursorPos);

		// Update local state immediately
		displayValue = result.masked;
		maskComplete = result.complete;

		// Store in field and track what we stored
		const valueToStore = unmaskValue ? result.raw : result.masked;
		lastStoredValue = valueToStore;
		field.set(valueToStore);

		// Restore cursor position after DOM update
		requestAnimationFrame(() => {
			if (inputElement) {
				inputElement.setSelectionRange(result.cursorPosition, result.cursorPosition);
			}
		});

		oninput?.();
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const input = event.target as HTMLInputElement;
		const pastedText = event.clipboardData?.getData('text') ?? '';
		const selStart = input.selectionStart ?? 0;
		const selEnd = input.selectionEnd ?? 0;

		// Build new value with pasted content
		const before = displayValue.slice(0, selStart);
		const after = displayValue.slice(selEnd);
		const newValue = before + pastedText + after;

		const result = processInput(newValue, selStart + pastedText.length);

		displayValue = result.masked;
		maskComplete = result.complete;

		// Store and track the value
		const valueToStore = unmaskValue ? result.raw : result.masked;
		lastStoredValue = valueToStore;
		field.set(valueToStore);

		requestAnimationFrame(() => {
			if (inputElement) {
				inputElement.setSelectionRange(result.cursorPosition, result.cursorPosition);
			}
		});

		oninput?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Handle backspace specially to skip over literals
		if (event.key === 'Backspace') {
			const input = event.target as HTMLInputElement;
			const cursorPos = input.selectionStart ?? 0;

			if (cursorPos > 0 && input.selectionStart === input.selectionEnd) {
				const charBefore = displayValue[cursorPos - 1];
				const maskChar = resolvedMask[cursorPos - 1];

				// If the character before cursor is a literal, skip it
				if (charBefore === maskChar && !/[9aA*]/.test(maskChar)) {
					event.preventDefault();
					input.setSelectionRange(cursorPos - 1, cursorPos - 1);
				}
			}
		}
	}

	// Handle autocomplete/autofill by watching for changes
	function handleChange(event: Event) {
		const input = event.target as HTMLInputElement;

		// Process the entire autofilled value
		const result = processInput(input.value, input.value.length);

		displayValue = result.masked;
		maskComplete = result.complete;

		// Store and track the value
		const valueToStore = unmaskValue ? result.raw : result.masked;
		lastStoredValue = valueToStore;
		field.set(valueToStore);

		oninput?.();
	}
</script>

{#if label}
	<label class={labelClass} for={name}>{label}</label>
{/if}
<!-- Hidden input holds the actual value for form submission -->
<input type="hidden" {name} value={field.value() ?? ''} />
<!-- Visible input shows masked display value but doesn't submit (no name) -->
<input
	bind:this={inputElement}
	type="text"
	id={name}
	class={className}
	{placeholder}
	{disabled}
	{readonly}
	{autocomplete}
	aria-invalid={ariaInvalid}
	bind:value={displayValue}
	oninput={handleInput}
	onpaste={handlePaste}
	onchange={handleChange}
	onkeydown={handleKeyDown}
	{onblur}
	data-mask-complete={maskComplete}
/>
