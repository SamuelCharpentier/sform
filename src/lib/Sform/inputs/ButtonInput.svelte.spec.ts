/**
 * Tests for ButtonInput (Sbutton) component
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import ButtonTestWrapper from './ButtonTestWrapper.test.svelte';

// Helper to create mock form
function createMockForm(options: {
	pending?: number;
	result?: unknown;
	hasIssues?: boolean;
} = {}) {
	const { pending = 0, result, hasIssues = false } = options;

	return {
		pending,
		result,
		fields: {
			allIssues: () => (hasIssues ? [{ path: ['field'], message: 'Error' }] : [])
		}
	};
}

describe('ButtonInput', () => {
	describe('rendering', () => {
		it('should render button with default label', async () => {
			render(ButtonTestWrapper, {
				props: {
					form: createMockForm()
				}
			});

			const button = page.getByRole('button');
			await expect.element(button).toHaveTextContent('Submit');
		});

		it('should render button with custom label', async () => {
			render(ButtonTestWrapper, {
				props: {
					form: createMockForm(),
					label: 'Save'
				}
			});

			const button = page.getByRole('button');
			await expect.element(button).toHaveTextContent('Save');
		});

		it('should apply class prop', async () => {
			render(ButtonTestWrapper, {
				props: {
					form: createMockForm(),
					class: 'custom-class'
				}
			});

			const button = page.getByRole('button');
			await expect.element(button).toHaveClass('custom-class');
		});

		it('should have submit type by default', async () => {
			render(ButtonTestWrapper, {
				props: {
					form: createMockForm()
				}
			});

			const button = document.querySelector('button');
			expect(button?.getAttribute('type')).toBe('submit');
		});

		it('should allow button type override', async () => {
			render(ButtonTestWrapper, {
				props: {
					form: createMockForm(),
					buttonType: 'button'
				}
			});

			const button = document.querySelector('button');
			expect(button?.getAttribute('type')).toBe('button');
		});
	});

	describe('disabled state', () => {
		it('should be disabled when disabled prop is true', async () => {
			render(ButtonTestWrapper, {
				props: {
					form: createMockForm(),
					disabled: true
				}
			});

			const button = page.getByRole('button');
			await expect.element(button).toBeDisabled();
		});

		it('should be disabled when form is pending', async () => {
			render(ButtonTestWrapper, {
				props: {
					form: createMockForm({ pending: 1 })
				}
			});

			const button = page.getByRole('button');
			await expect.element(button).toBeDisabled();
		});

		it('should not be disabled by default', async () => {
			render(ButtonTestWrapper, {
				props: {
					form: createMockForm()
				}
			});

			const button = page.getByRole('button');
			await expect.element(button).not.toBeDisabled();
		});
	});

	describe('onsubmit callback', () => {
		it('should call onsubmit when button is clicked', async () => {
			const onsubmit = vi.fn();

			render(ButtonTestWrapper, {
				props: {
					form: createMockForm(),
					onsubmit
				}
			});

			const button = page.getByRole('button');
			await userEvent.click(button);

			expect(onsubmit).toHaveBeenCalled();
		});

		it('should await async onsubmit', async () => {
			let completed = false;
			const onsubmit = vi.fn(async () => {
				await new Promise((r) => setTimeout(r, 10));
				completed = true;
			});

			render(ButtonTestWrapper, {
				props: {
					form: createMockForm(),
					onsubmit
				}
			});

			const button = page.getByRole('button');
			await userEvent.click(button);

			// Give time for async to complete
			await new Promise((r) => setTimeout(r, 50));

			expect(onsubmit).toHaveBeenCalled();
			expect(completed).toBe(true);
		});

		it('should not call onsubmit when buttonType is not submit', async () => {
			const onsubmit = vi.fn();

			render(ButtonTestWrapper, {
				props: {
					form: createMockForm(),
					onsubmit,
					buttonType: 'button'
				}
			});

			const button = page.getByRole('button');
			await userEvent.click(button);

			expect(onsubmit).not.toHaveBeenCalled();
		});
	});
});
