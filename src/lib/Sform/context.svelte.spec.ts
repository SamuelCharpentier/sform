/**
 * Tests for Sform context
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ContextTestWrapper from './ContextTestWrapper.test.svelte';
import type { SformContext } from './types.js';

// Helper to render ContextTestWrapper with proper typing for vitest-browser-svelte
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderContext(props: Record<string, any>) {
	return render(ContextTestWrapper as any, { props });
}

describe('createSformContext', () => {
	describe('field state management', () => {
		it('should track touched fields', async () => {
			const results: boolean[] = [];

			renderContext({
				onMount: (ctx: SformContext) => {
					results.push(ctx.getFieldState('username').touched); // false initially
					ctx.markTouched('username');
					results.push(ctx.getFieldState('username').touched); // true after marking
				}
			});

			expect(results[0]).toBe(false);
			expect(results[1]).toBe(true);
		});

		it('should track dirty fields', async () => {
			const results: boolean[] = [];

			renderContext({
				onMount: (ctx: SformContext) => {
					results.push(ctx.getFieldState('email').dirty); // false initially
					ctx.markDirty('email');
					results.push(ctx.getFieldState('email').dirty); // true after marking
				}
			});

			expect(results[0]).toBe(false);
			expect(results[1]).toBe(true);
		});

		it('should track both touched and dirty independently', async () => {
			const results: Record<string, boolean> = {};

			renderContext({
				onMount: (ctx: SformContext) => {
					ctx.markTouched('field1');
					ctx.markDirty('field2');

					const state1 = ctx.getFieldState('field1');
					const state2 = ctx.getFieldState('field2');

					results.field1Touched = state1.touched;
					results.field1Dirty = state1.dirty;
					results.field2Touched = state2.touched;
					results.field2Dirty = state2.dirty;
				}
			});

			expect(results.field1Touched).toBe(true);
			expect(results.field1Dirty).toBe(false);
			expect(results.field2Touched).toBe(false);
			expect(results.field2Dirty).toBe(true);
		});
	});

	describe('field registration', () => {
		it('should register fields', async () => {
			const results: Record<string, { touched: boolean; dirty: boolean }> = {};

			renderContext({
				onMount: (ctx: SformContext) => {
					ctx.registerField('field1');
					ctx.registerField('field2');
					ctx.registerField('field3');

					// markAllFieldsDirty uses registered fields
					ctx.markAllFieldsDirty();

					// Check all are now touched and dirty
					results.field1 = ctx.getFieldState('field1');
					results.field2 = ctx.getFieldState('field2');
					results.field3 = ctx.getFieldState('field3');
				}
			});

			expect(results.field1.touched).toBe(true);
			expect(results.field1.dirty).toBe(true);
			expect(results.field2.touched).toBe(true);
			expect(results.field2.dirty).toBe(true);
			expect(results.field3.touched).toBe(true);
			expect(results.field3.dirty).toBe(true);
		});

		it('should not duplicate registrations', async () => {
			const results: boolean[] = [];

			renderContext({
				onMount: (ctx: SformContext) => {
					ctx.registerField('field1');
					ctx.registerField('field1');
					ctx.registerField('field1');
					ctx.markAllFieldsDirty();

					results.push(ctx.getFieldState('field1').dirty);
				}
			});

			expect(results[0]).toBe(true);
		});
	});

	describe('submission state', () => {
		it('should track submitted state', async () => {
			const results: boolean[] = [];

			renderContext({
				onMount: (ctx: SformContext) => {
					results.push(ctx.submitted); // false initially
					ctx.markSubmitted();
					results.push(ctx.submitted); // true after marking
				}
			});

			expect(results[0]).toBe(false);
			expect(results[1]).toBe(true);
		});

		it('should reset all states', async () => {
			const results: Record<string, boolean> = {};

			renderContext({
				onMount: (ctx: SformContext) => {
					// Set up state
					ctx.markTouched('field1');
					ctx.markDirty('field1');
					ctx.markSubmitted();

					// Verify state is set
					results.beforeResetTouched = ctx.getFieldState('field1').touched;
					results.beforeResetDirty = ctx.getFieldState('field1').dirty;
					results.beforeResetSubmitted = ctx.submitted;

					// Reset
					ctx.resetFieldStates();

					// Verify state is cleared
					results.afterResetTouched = ctx.getFieldState('field1').touched;
					results.afterResetDirty = ctx.getFieldState('field1').dirty;
					results.afterResetSubmitted = ctx.submitted;
				}
			});

			expect(results.beforeResetTouched).toBe(true);
			expect(results.beforeResetDirty).toBe(true);
			expect(results.beforeResetSubmitted).toBe(true);
			expect(results.afterResetTouched).toBe(false);
			expect(results.afterResetDirty).toBe(false);
			expect(results.afterResetSubmitted).toBe(false);
		});
	});

	describe('shouldDisplayIssues', () => {
		it('should show issues on blur mode when field is touched', async () => {
			const results: boolean[] = [];

			renderContext({
				validateOn: 'blur',
				onMount: (ctx: SformContext) => {
					results.push(ctx.shouldDisplayIssues('field1')); // false - not touched
					ctx.markTouched('field1');
					results.push(ctx.shouldDisplayIssues('field1')); // true - touched
				}
			});

			expect(results[0]).toBe(false);
			expect(results[1]).toBe(true);
		});

		it('should show issues on change mode when field is dirty', async () => {
			const results: boolean[] = [];

			renderContext({
				validateOn: 'change',
				onMount: (ctx: SformContext) => {
					results.push(ctx.shouldDisplayIssues('field1')); // false - not dirty
					ctx.markDirty('field1');
					results.push(ctx.shouldDisplayIssues('field1')); // true - dirty
				}
			});

			expect(results[0]).toBe(false);
			expect(results[1]).toBe(true);
		});

		it('should show issues on submit mode when form is submitted', async () => {
			const results: boolean[] = [];

			renderContext({
				validateOn: 'submit',
				onMount: (ctx: SformContext) => {
					results.push(ctx.shouldDisplayIssues('field1')); // false - not submitted
					ctx.markSubmitted();
					results.push(ctx.shouldDisplayIssues('field1')); // true - submitted
				}
			});

			expect(results[0]).toBe(false);
			expect(results[1]).toBe(true);
		});

		it('should use field-level validateOn override', async () => {
			const results: boolean[] = [];

			renderContext({
				validateOn: 'blur',
				onMount: (ctx: SformContext) => {
					// Field override to 'change'
					results.push(ctx.shouldDisplayIssues('field1', 'change')); // false - not dirty
					ctx.markDirty('field1');
					results.push(ctx.shouldDisplayIssues('field1', 'change')); // true - dirty

					// Same field without override uses form's blur mode
					ctx.markTouched('field1');
					results.push(ctx.shouldDisplayIssues('field1')); // true - touched
				}
			});

			expect(results[0]).toBe(false);
			expect(results[1]).toBe(true);
			expect(results[2]).toBe(true);
		});
	});

	describe('markAllFieldsDirty', () => {
		it('should mark all registered fields as touched and dirty', async () => {
			const results: Record<string, { touched: boolean; dirty: boolean }> = {};

			renderContext({
				onMount: (ctx: SformContext) => {
					ctx.registerField('field1');
					ctx.registerField('field2');

					ctx.markAllFieldsDirty();

					results.field1 = ctx.getFieldState('field1');
					results.field2 = ctx.getFieldState('field2');
				}
			});

			expect(results.field1.touched).toBe(true);
			expect(results.field1.dirty).toBe(true);
			expect(results.field2.touched).toBe(true);
			expect(results.field2.dirty).toBe(true);
		});
	});
});

