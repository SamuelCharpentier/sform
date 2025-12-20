/**
 * Tests for mask utility functions
 */

import { describe, it, expect } from 'vitest';
import { applyMask, unmask, DEFAULT_TOKENS, MASK_PATTERNS, type MaskOptions } from './mask.js';

describe('applyMask', () => {
	describe('phone mask', () => {
		const options: MaskOptions = { mask: '(999) 999-9999' };

		it('should mask a complete phone number', () => {
			const result = applyMask('1234567890', options);
			expect(result.masked).toBe('(123) 456-7890');
			expect(result.raw).toBe('1234567890');
			expect(result.complete).toBe(true);
		});

		it('should mask a partial phone number', () => {
			const result = applyMask('123456', options);
			// Trailing literals are not added until more input is available
			expect(result.masked).toBe('(123) 456');
			expect(result.raw).toBe('123456');
			expect(result.complete).toBe(false);
		});

		it('should handle empty input', () => {
			const result = applyMask('', options);
			// Empty input produces empty output
			expect(result.masked).toBe('');
			expect(result.raw).toBe('');
			expect(result.complete).toBe(false);
		});

		it('should filter non-numeric characters', () => {
			const result = applyMask('1a2b3c4d5e6f7890', options);
			expect(result.masked).toBe('(123) 456-7890');
			expect(result.raw).toBe('1234567890');
		});

		it('should handle input with existing formatting', () => {
			const result = applyMask('(123) 456-7890', options);
			expect(result.masked).toBe('(123) 456-7890');
			expect(result.raw).toBe('1234567890');
		});
	});

	describe('credit card mask', () => {
		const options: MaskOptions = { mask: '9999 9999 9999 9999' };

		it('should mask a complete credit card number', () => {
			const result = applyMask('1234567890123456', options);
			expect(result.masked).toBe('1234 5678 9012 3456');
			expect(result.raw).toBe('1234567890123456');
			expect(result.complete).toBe(true);
		});

		it('should mask a partial credit card number', () => {
			const result = applyMask('123456', options);
			// Trailing literals are not added until more input is available
			expect(result.masked).toBe('1234 56');
			expect(result.raw).toBe('123456');
			expect(result.complete).toBe(false);
		});
	});

	describe('SSN mask', () => {
		const options: MaskOptions = { mask: '999-99-9999' };

		it('should mask a complete SSN', () => {
			const result = applyMask('123456789', options);
			expect(result.masked).toBe('123-45-6789');
			expect(result.raw).toBe('123456789');
			expect(result.complete).toBe(true);
		});

		it('should mask a partial SSN', () => {
			const result = applyMask('12345', options);
			// Trailing literals are not added until more input is available
			expect(result.masked).toBe('123-45');
			expect(result.raw).toBe('12345');
			expect(result.complete).toBe(false);
		});
	});

	describe('date mask', () => {
		const options: MaskOptions = { mask: '99/99/9999' };

		it('should mask a complete date', () => {
			const result = applyMask('12252023', options);
			expect(result.masked).toBe('12/25/2023');
			expect(result.raw).toBe('12252023');
			expect(result.complete).toBe(true);
		});
	});

	describe('showPlaceholder option', () => {
		const options: MaskOptions = { mask: '(999) 999-9999', showPlaceholder: true };

		it('should show placeholders for unfilled positions', () => {
			const result = applyMask('123', options);
			expect(result.masked).toBe('(123) ___-____');
			expect(result.raw).toBe('123');
		});

		it('should use custom placeholder character', () => {
			const result = applyMask('123', { ...options, placeholder: '#' });
			expect(result.masked).toBe('(123) ###-####');
		});

		it('should show full placeholder for empty input', () => {
			const result = applyMask('', options);
			expect(result.masked).toBe('(___) ___-____');
		});
	});

	describe('alphabetic masks', () => {
		const options: MaskOptions = { mask: 'aaa-9999' };

		it('should mask mixed alpha-numeric pattern', () => {
			const result = applyMask('ABC1234', options);
			expect(result.masked).toBe('ABC-1234');
			expect(result.raw).toBe('ABC1234');
			expect(result.complete).toBe(true);
		});

		it('should filter invalid characters for each position', () => {
			// The mask 'aaa-9999' expects: 3 letters, then 4 numbers
			// Input 'A1B2C31234' will:
			// - Match A to first 'a'
			// - Skip 1 (not a letter)
			// - Match B to second 'a'
			// - Skip 2 (not a letter)
			// - Match C to third 'a'
			// - For numeric positions: 3, 1, 2, 3, 4 -> matches 3, 1, 2, 3
			const result = applyMask('A1B2C31234', options);
			expect(result.masked).toBe('ABC-3123');
			expect(result.raw).toBe('ABC3123');
		});

		it('should handle lowercase input', () => {
			const result = applyMask('abc1234', options);
			expect(result.masked).toBe('abc-1234');
			expect(result.raw).toBe('abc1234');
		});
	});

	describe('uppercase transform', () => {
		const options: MaskOptions = { mask: 'AAA-9999' };

		it('should transform lowercase to uppercase', () => {
			const result = applyMask('abc1234', options);
			expect(result.masked).toBe('ABC-1234');
			expect(result.raw).toBe('ABC1234');
		});

		it('should keep uppercase as-is', () => {
			const result = applyMask('XYZ5678', options);
			expect(result.masked).toBe('XYZ-5678');
			expect(result.raw).toBe('XYZ5678');
		});
	});

	describe('alphanumeric masks', () => {
		const options: MaskOptions = { mask: '***-***' };

		it('should accept alphanumeric characters', () => {
			const result = applyMask('A1B2C3', options);
			expect(result.masked).toBe('A1B-2C3');
			expect(result.raw).toBe('A1B2C3');
			expect(result.complete).toBe(true);
		});

		it('should filter special characters', () => {
			const result = applyMask('A@1#B$2%C^3', options);
			expect(result.masked).toBe('A1B-2C3');
		});
	});

	describe('cursor position', () => {
		const options: MaskOptions = { mask: '(999) 999-9999' };

		it('should calculate cursor position after input', () => {
			const result = applyMask('123', options, 3);
			// Cursor is at end of masked output: "(123" -> position 4
			expect(result.cursorPosition).toBe(4);
		});

		it('should position cursor correctly for partial input', () => {
			const result = applyMask('123', options, 0);
			// Cursor is at end of masked output
			expect(result.cursorPosition).toBe(4);
		});
	});

	describe('custom tokens', () => {
		it('should support custom token definitions', () => {
			const options: MaskOptions = {
				mask: 'HH:MM',
				tokens: {
					H: { pattern: /[0-2]/ },
					M: { pattern: /[0-5]/ }
				}
			};

			const result = applyMask('1234', options);
			expect(result.masked).toBe('12:34');
			expect(result.raw).toBe('1234');
		});

		it('should support custom transform functions', () => {
			const options: MaskOptions = {
				mask: 'xxx',
				tokens: {
					x: { pattern: /[a-z]/i, transform: (c) => c.toLowerCase() }
				}
			};

			const result = applyMask('ABC', options);
			expect(result.masked).toBe('abc');
			expect(result.raw).toBe('abc');
		});
	});
});

describe('unmask', () => {
	describe('phone mask', () => {
		const options: MaskOptions = { mask: '(999) 999-9999' };

		it('should unmask a formatted phone number', () => {
			const raw = unmask('(123) 456-7890', options);
			expect(raw).toBe('1234567890');
		});

		it('should handle partial masked value', () => {
			const raw = unmask('(123) 456', options);
			expect(raw).toBe('123456');
		});

		it('should handle empty input', () => {
			const raw = unmask('', options);
			expect(raw).toBe('');
		});
	});

	describe('credit card mask', () => {
		const options: MaskOptions = { mask: '9999 9999 9999 9999' };

		it('should unmask a formatted credit card', () => {
			const raw = unmask('1234 5678 9012 3456', options);
			expect(raw).toBe('1234567890123456');
		});
	});

	describe('SSN mask', () => {
		const options: MaskOptions = { mask: '999-99-9999' };

		it('should unmask a formatted SSN', () => {
			const raw = unmask('123-45-6789', options);
			expect(raw).toBe('123456789');
		});
	});

	describe('mixed alpha-numeric', () => {
		const options: MaskOptions = { mask: 'aaa-9999' };

		it('should unmask mixed pattern', () => {
			const raw = unmask('ABC-1234', options);
			expect(raw).toBe('ABC1234');
		});
	});
});

describe('DEFAULT_TOKENS', () => {
	it('should have numeric token', () => {
		expect(DEFAULT_TOKENS['9']).toBeDefined();
		expect(DEFAULT_TOKENS['9'].pattern.test('5')).toBe(true);
		expect(DEFAULT_TOKENS['9'].pattern.test('a')).toBe(false);
	});

	it('should have alphabetic token', () => {
		expect(DEFAULT_TOKENS['a']).toBeDefined();
		expect(DEFAULT_TOKENS['a'].pattern.test('x')).toBe(true);
		expect(DEFAULT_TOKENS['a'].pattern.test('X')).toBe(true);
		expect(DEFAULT_TOKENS['a'].pattern.test('5')).toBe(false);
	});

	it('should have uppercase alphabetic token with transform', () => {
		expect(DEFAULT_TOKENS['A']).toBeDefined();
		expect(DEFAULT_TOKENS['A'].pattern.test('x')).toBe(true);
		expect(DEFAULT_TOKENS['A'].transform).toBeDefined();
		expect(DEFAULT_TOKENS['A'].transform!('x')).toBe('X');
	});

	it('should have alphanumeric token', () => {
		expect(DEFAULT_TOKENS['*']).toBeDefined();
		expect(DEFAULT_TOKENS['*'].pattern.test('a')).toBe(true);
		expect(DEFAULT_TOKENS['*'].pattern.test('5')).toBe(true);
		expect(DEFAULT_TOKENS['*'].pattern.test('@')).toBe(false);
	});
});

describe('MASK_PATTERNS', () => {
	it('should have common mask patterns', () => {
		expect(MASK_PATTERNS.phone).toBe('(999) 999-9999');
		expect(MASK_PATTERNS.ssn).toBe('999-99-9999');
		expect(MASK_PATTERNS.creditCard).toBe('9999 9999 9999 9999');
		expect(MASK_PATTERNS.zip).toBe('99999');
		expect(MASK_PATTERNS.date).toBe('99/99/9999');
	});

	it('should work with applyMask', () => {
		const result = applyMask('1234567890', { mask: MASK_PATTERNS.phone });
		expect(result.masked).toBe('(123) 456-7890');
	});
});

describe('edge cases', () => {
	it('should handle mask longer than input', () => {
		const result = applyMask('12', { mask: '99999' });
		expect(result.masked).toBe('12');
		expect(result.complete).toBe(false);
	});

	it('should handle input longer than mask', () => {
		const result = applyMask('123456789', { mask: '999' });
		expect(result.masked).toBe('123');
		expect(result.raw).toBe('123');
	});

	it('should handle mask with only literals', () => {
		const result = applyMask('anything', { mask: '---' });
		// No wildcards means no output (nothing to match)
		expect(result.masked).toBe('');
		expect(result.raw).toBe('');
		expect(result.complete).toBe(true);
	});

	it('should handle special regex characters in literals', () => {
		const result = applyMask('123', { mask: '9.9.9' });
		expect(result.masked).toBe('1.2.3');
	});
});
