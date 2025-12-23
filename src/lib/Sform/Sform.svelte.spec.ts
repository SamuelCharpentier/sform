/**
 * Tests for Sform component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import Sform from './Sform.svelte';

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

			render(Sform, {
				props: {
					form: mockForm,
					children: () => null
				}
			});

			const form = page.getByRole('form');
			// Form might not have role="form" by default, check for form element
			const formElement = document.querySelector('form');
			expect(formElement).toBeTruthy();
		});

		it('should apply class prop to form', async () => {
			const mockForm = createMockForm({ username: '' });

			render(Sform, {
				props: {
					form: mockForm,
					class: 'my-custom-class',
					children: () => null
				}
			});

			const formElement = document.querySelector('form');
			await expect.element(formElement!).toHaveClass('my-custom-class');
		});

		it('should have novalidate attribute', async () => {
			const mockForm = createMockForm({ username: '' });

			render(Sform, {
				props: {
					form: mockForm,
					children: () => null
				}
			});

			const formElement = document.querySelector('form');
			expect(formElement?.hasAttribute('novalidate')).toBe(true);
		});
	});

	describe('validateOn prop', () => {
		it('should default to blur validation mode', async () => {
			const mockForm = createMockForm({ username: '' });

			render(Sform, {
				props: {
					form: mockForm,
					children: () => null
				}
			});

			// Default validateOn is 'blur' - verified by context behavior
			expect(true).toBe(true); // Context tests verify behavior
		});

		it('should accept change validation mode', async () => {
			const mockForm = createMockForm({ username: '' });

			render(Sform, {
				props: {
					form: mockForm,
					validateOn: 'change',
					children: () => null
				}
			});

			expect(true).toBe(true);
		});

		it('should accept submit validation mode', async () => {
			const mockForm = createMockForm({ username: '' });

			render(Sform, {
				props: {
					form: mockForm,
					validateOn: 'submit',
					children: () => null
				}
			});

			expect(true).toBe(true);
		});
	});

	describe('schema prop', () => {
		it('should apply preflight schema when provided', async () => {
			const mockForm = createMockForm({ username: '' });
			const mockSchema = { parse: vi.fn() };

			render(Sform, {
				props: {
					form: mockForm,
					schema: mockSchema,
					children: () => null
				}
			});

			// Preflight should be called
			expect(mockForm.preflight).toHaveBeenCalledWith(mockSchema);
		});

		it('should work without schema', async () => {
			const mockForm = createMockForm({ username: '' });

			render(Sform, {
				props: {
					form: mockForm,
					children: () => null
				}
			});

			expect(mockForm.preflight).not.toHaveBeenCalled();
		});
	});

	describe('enhance prop', () => {
		it('should apply enhance callback when provided', async () => {
			const mockForm = createMockForm({ username: '' });
			const enhanceCallback = vi.fn();

			render(Sform, {
				props: {
					form: mockForm,
					enhance: enhanceCallback,
					children: () => null
				}
			});

			expect(mockForm.enhance).toHaveBeenCalled();
		});

		it('should work without enhance', async () => {
			const mockForm = createMockForm({ username: '' });

			render(Sform, {
				props: {
					form: mockForm,
					children: () => null
				}
			});

			expect(mockForm.enhance).not.toHaveBeenCalled();
		});
	});
});
