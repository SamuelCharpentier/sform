import * as v from 'valibot';

/**
 * custom amount Demo Form
 * Demonstrates: number input with custom min, maxDecimals and suffix
 */

export const customAmountSchema = v.object({
	amount: v.pipe(
		v.number(),
		v.minValue(0, 'Amount cannot be negative'),
		v.maxValue(1000, 'Amount cannot exceed 1 000$')
	)
});
