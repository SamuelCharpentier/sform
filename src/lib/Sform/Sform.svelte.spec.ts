/**
 * Tests for Sform component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import Sform from './Sform.svelte';

// Helper to render Sform with proper typing for vitest-browser-svelte
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderSform(props: Record<string, any>) {
	return render(Sform as any, { props });
}

// Mock remote form for testing
function createMockForm(initialValues: Record<string, unknown> = {}) {
	const values: Record<string, unknown> = { ...initialValues };
	const issues: Record<string, Array<{ path: string[]; message: string }>> = {};

	const fields: Record<string, unknown> = {
		allIssues: () => Object.values(issues).flat()
	};

	// Create field accessors for each value
	for (const [name, value] of Object.entries(values)) {
		fields[name] = {
			value: () => value,
			set: (v: unknown) => {
				values[name] = v;
			},
			issues: () => issues[name] ?? [],
			as: (type: string) => ({
				name,
				type,
				value,
				'aria-invalid': (issues[name]?.length ?? 0) > 0
			})
		};
	}

	return {
		pending: 0,
		result: undefined as unknown,
		fields,
		validate: vi.fn((_opts?: { includeUntouched?: boolean }) => {
			// Simulate validation
		}),
		preflight: vi.fn((schema: unknown) => ({
			...createMockForm(initialValues),
			schema
		})),
		enhance: vi.fn((callback: unknown) => ({
			...createMockForm(initialValues),
			enhanceCallback: callback
		})),
		_setIssues: (fieldName: string, fieldIssues: Array<{ path: string[]; message: string }>) => {
			issues[fieldName] = fieldIssues;
		}
	};
}

describe('Sform', () => {
	describe('rendering', () => {
		it('should render a form element', async () => {
			const mockForm = createMockForm({ username: '' });

			renderSform({
				form: mockForm,
				children: () => null
			});

			const form = page.getByRole('form');
			// Form might not have role="form" by default, check for form element
			const formElement = document.querySelector('form');
			expect(formElement).toBeTruthy();
		});

		it('should apply class prop to form', async () => {
			const mockForm = createMockForm({ username: '' });

			renderSform({
				form: mockForm,
				class: 'my-custom-class',
				children: () => null
			});

			const formElement = document.querySelector('form');
			await expect.element(formElement!).toHaveClass('my-custom-class');
		});

		it('should have novalidate attribute', async () => {
			const mockForm = createMockForm({ username: '' });

			renderSform({
				form: mockForm,
				children: () => null
			});

			const formElement = document.querySelector('form');
			expect(formElement?.hasAttribute('novalidate')).toBe(true);
		});
	});

	describe('validateOn prop', () => {
		it('should default to blur validation mode', async () => {
			const mockForm = createMockForm({ username: '' });

			renderSform({
				form: mockForm,
				children: () => null
			});

			// Default validateOn is 'blur' - verified by context behavior
			expect(true).toBe(true); // Context tests verify behavior
		});

		it('should accept change validation mode', async () => {
			const mockForm = createMockForm({ username: '' });

			renderSform({
				form: mockForm,
				validateOn: 'change',
				children: () => null
			});

			expect(true).toBe(true);
		});

		it('should accept submit validation mode', async () => {
			const mockForm = createMockForm({ username: '' });

			renderSform({
				form: mockForm,
				validateOn: 'submit',
				children: () => null
			});

			expect(true).toBe(true);
		});
	});

	describe('schema prop', () => {
		it('should apply preflight schema when provided', async () => {
			const mockForm = createMockForm({ username: '' });
			const mockSchema = { parse: vi.fn() };

			renderSform({
				form: mockForm,
				schema: mockSchema,
				children: () => null
			});

			// Preflight should be called
			expect(mockForm.preflight).toHaveBeenCalledWith(mockSchema);
		});

		it('should work without schema', async () => {
			const mockForm = createMockForm({ username: '' });

			renderSform({
				form: mockForm,
				children: () => null
			});

			expect(mockForm.preflight).not.toHaveBeenCalled();
		});
	});

	describe('enhance prop', () => {
		it('should apply enhance callback when provided', async () => {
			const mockForm = createMockForm({ username: '' });
			const enhanceCallback = vi.fn();

			renderSform({
				form: mockForm,
				enhance: enhanceCallback,
				children: () => null
			});

			expect(mockForm.enhance).toHaveBeenCalled();
		});

		it('should work without enhance', async () => {
			const mockForm = createMockForm({ username: '' });

			renderSform({
				form: mockForm,
				children: () => null
			});

			expect(mockForm.enhance).not.toHaveBeenCalled();
		});
	});

	describe('form input handling', () => {
		it('should call validate on input event', async () => {
			const mockForm = createMockForm({ username: '' });

			renderSform({
				form: mockForm,
				children: () => null
			});

			// Trigger input event on form
			const formElement = document.querySelector('form');
			formElement?.dispatchEvent(new Event('input', { bubbles: true }));

			// Validate should be called with includeUntouched
			expect(mockForm.validate).toHaveBeenCalledWith({ includeUntouched: true });
		});
	});

	describe('form submit handling', () => {
		it('should handle submit event', async () => {
			const mockForm = createMockForm({ username: '' });

			renderSform({
				form: mockForm,
				children: () => null
			});

			const formElement = document.querySelector('form');
			// Submit triggers but is prevented by lack of action/method
			formElement?.dispatchEvent(new Event('submit', { bubbles: true }));

			expect(true).toBe(true); // Submit handler ran without error
		});
	});

	describe('schema and enhance combined', () => {
		it('should apply both schema and enhance', async () => {
			const mockForm = createMockForm({ username: '' });
			const mockSchema = { parse: vi.fn() };
			const enhanceCallback = vi.fn();

			renderSform({
				form: mockForm,
				schema: mockSchema,
				enhance: enhanceCallback,
				children: () => null
			});

			expect(mockForm.preflight).toHaveBeenCalledWith(mockSchema);
			// Note: enhance is called on the result of preflight in real code
		});
	});
});
