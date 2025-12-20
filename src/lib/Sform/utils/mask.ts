/**
 * Mask Utility for Sform
 * Native implementation for input masking without external dependencies
 */

/**
 * Mask token definitions
 * - 9 or #: Numeric (0-9)
 * - a: Alphabetic (a-z, A-Z)
 * - A: Alphabetic uppercase (a-z, A-Z) -> transforms to uppercase
 * - *: Alphanumeric (0-9, a-z, A-Z)
 * - Other characters are literals
 */
export interface MaskToken {
	pattern: RegExp;
	transform?: (char: string) => string;
}

export const DEFAULT_TOKENS: Record<string, MaskToken> = {
	'9': { pattern: /[0-9]/ },
	'#': { pattern: /[0-9]/ },
	a: { pattern: /[a-zA-Z]/ },
	A: { pattern: /[a-zA-Z]/, transform: (c) => c.toUpperCase() },
	'*': { pattern: /[a-zA-Z0-9]/ }
};

export interface MaskOptions {
	/** The mask pattern (e.g., '(999) 999-9999') */
	mask: string;
	/** Custom token definitions */
	tokens?: Record<string, MaskToken>;
	/** Placeholder character for unfilled positions */
	placeholder?: string;
	/** Whether to show the full mask with placeholders */
	showPlaceholder?: boolean;
}

export interface MaskResult {
	/** The masked display value */
	masked: string;
	/** The raw unmasked value (only user input, no literals) */
	raw: string;
	/** Whether the input is complete (all required positions filled) */
	complete: boolean;
	/** Cursor position after masking */
	cursorPosition: number;
}

/**
 * Apply mask to a value
 *
 * Algorithm:
 * 1. Walk through the mask and input simultaneously
 * 2. For each mask position:
 *    - If it's a wildcard, try to find a matching input character
 *    - If it's a literal, add it only if we have more input to process
 * 3. Stop when input is exhausted
 */
export function applyMask(
	value: string,
	options: MaskOptions,
	cursorPosition: number = value.length
): MaskResult {
	const { mask, tokens = DEFAULT_TOKENS, placeholder = '_', showPlaceholder = false } = options;

	let masked = '';
	let raw = '';
	let valueIndex = 0;

	for (let maskIndex = 0; maskIndex < mask.length; maskIndex++) {
		const maskChar = mask[maskIndex];
		const token = tokens[maskChar];

		if (token) {
			// This is a wildcard position - find next matching input character
			let found = false;
			while (valueIndex < value.length && !found) {
				const inputChar = value[valueIndex];
				valueIndex++;

				if (token.pattern.test(inputChar)) {
					const transformedChar = token.transform ? token.transform(inputChar) : inputChar;
					masked += transformedChar;
					raw += transformedChar;
					found = true;
				}
				// If char doesn't match, skip it and try next
			}

			if (!found) {
				// No more matching input
				if (showPlaceholder) {
					masked += placeholder;
				} else {
					// Stop processing - no more input for wildcards
					break;
				}
			}
		} else {
			// This is a literal character
			if (showPlaceholder) {
				// Always add literals when showing placeholders
				masked += maskChar;
				// Skip if input matches literal
				if (valueIndex < value.length && value[valueIndex] === maskChar) {
					valueIndex++;
				}
			} else {
				// Only add literals if we have more wildcard matches coming
				// Look ahead to see if there's more input that matches future wildcards
				let hasMoreMatchingInput = false;
				let tempValueIndex = valueIndex;

				// Skip any literal in input that matches
				if (tempValueIndex < value.length && value[tempValueIndex] === maskChar) {
					tempValueIndex++;
				}

				// Look for any remaining input that could match future wildcards
				for (let futureIdx = maskIndex + 1; futureIdx < mask.length; futureIdx++) {
					const futureMaskChar = mask[futureIdx];
					const futureToken = tokens[futureMaskChar];

					if (futureToken) {
						// Check if any remaining input matches this wildcard
						for (let vi = tempValueIndex; vi < value.length; vi++) {
							if (futureToken.pattern.test(value[vi])) {
								hasMoreMatchingInput = true;
								break;
							}
						}
						break; // Only check up to the next wildcard
					}
				}

				if (hasMoreMatchingInput) {
					masked += maskChar;
					// Skip if input matches literal
					if (valueIndex < value.length && value[valueIndex] === maskChar) {
						valueIndex++;
					}
				} else {
					// No more input for future wildcards, stop here
					break;
				}
			}
		}
	}

	// Calculate cursor position - put cursor at the end of the masked value
	const newCursorPosition = masked.length;

	// Calculate if mask is complete
	const requiredLength = mask.split('').filter((c) => tokens[c]).length;
	const complete = raw.length === requiredLength;

	return {
		masked,
		raw,
		complete,
		cursorPosition: newCursorPosition
	};
}

/**
 * Get the raw value from a masked value
 */
export function unmask(maskedValue: string, options: MaskOptions): string {
	const { mask, tokens = DEFAULT_TOKENS } = options;

	let raw = '';
	let valueIndex = 0;

	for (let maskIndex = 0; maskIndex < mask.length && valueIndex < maskedValue.length; maskIndex++) {
		const maskChar = mask[maskIndex];
		const inputChar = maskedValue[valueIndex];

		if (tokens[maskChar]) {
			// This is a token position
			if (tokens[maskChar].pattern.test(inputChar)) {
				raw += inputChar;
			}
			valueIndex++;
		} else {
			// This is a literal - skip it
			if (inputChar === maskChar) {
				valueIndex++;
			}
		}
	}

	return raw;
}

/**
 * Common mask patterns
 */
export const MASK_PATTERNS = {
	phone: '(999) 999-9999',
	phoneIntl: '+9 (999) 999-9999',
	ssn: '999-99-9999',
	zip: '99999',
	zipPlus4: '99999-9999',
	creditCard: '9999 9999 9999 9999',
	date: '99/99/9999',
	time: '99:99',
	time24: '99:99',
	currency: '$9,999.99'
} as const;

export type MaskPattern = keyof typeof MASK_PATTERNS;
