/**
 * Tests for Sfield component
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import SfieldTestWrapper from './SfieldTestWrapper.test.svelte';
import type { RemoteFormField, RemoteFormFieldValue, RemoteFormIssue } from './types.js';

// Helper to create mock field that matches RemoteFormField interface
function createMockField(
	value: RemoteFormFieldValue = '',
	fieldName = 'testField',
	issues: RemoteFormIssue[] = []
): RemoteFormField<RemoteFormFieldValue> {
	return {
		value: () => value,
		set: vi.fn(),
		issues: () => issues,
		as: (type: string) => ({
			name: fieldName,
			type,
			value,
			'aria-invalid': issues.length > 0
		})
	} as unknown as RemoteFormField<RemoteFormFieldValue>;
}

// Helper to render SfieldTestWrapper with proper typing for vitest-browser-svelte
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderSfield(props: Record<string, any>) {
	return render(SfieldTestWrapper as any, { props });
}

describe('Sfield', () => {
	describe('type routing', () => {
		it('should render TextInput for text type', async () => {
			renderSfield({
				type: 'text',
				field: createMockField('', 'username')
			});

			const input = page.getByRole('textbox');
			await expect.element(input).toBeVisible();
		});

		it('should render TextInput for email type', async () => {
			renderSfield({
				type: 'email',
				field: createMockField('', 'email')
			});

			const input = document.querySelector('input[type="email"]');
			expect(input).toBeTruthy();
		});

		it('should render NumberInput for number type', async () => {
			renderSfield({
				type: 'number',
				field: createMockField(0, 'amount')
			});

			const input = page.getByRole('spinbutton');
			await expect.element(input).toBeVisible();
		});

		it('should render TextareaInput for textarea type', async () => {
			renderSfield({
				type: 'textarea',
				field: createMockField('', 'description')
			});

			const textarea = document.querySelector('textarea');
			expect(textarea).toBeTruthy();
		});

		it('should render SelectInput for select type', async () => {
			renderSfield({
				type: 'select',
				field: createMockField('', 'country'),
				options: [
					{ value: 'us', label: 'USA' },
					{ value: 'ca', label: 'Canada' }
				]
			});

			const select = page.getByRole('combobox');
			await expect.element(select).toBeVisible();
		});

		it('should render CheckboxInput for checkbox type', async () => {
			renderSfield({
				type: 'checkbox',
				field: createMockField(false, 'agree')
			});

			const checkbox = page.getByRole('checkbox');
			await expect.element(checkbox).toBeVisible();
		});

		it('should render RadioInput for radio type', async () => {
			renderSfield({
				type: 'radio',
				field: createMockField('', 'gender'),
				options: [
					{ value: 'male', label: 'Male' },
					{ value: 'female', label: 'Female' }
				]
			});

			const radios = page.getByRole('radio').all();
			expect((await radios).length).toBe(2);
		});

		it('should render RangeInput for range type', async () => {
			renderSfield({
				type: 'range',
				field: createMockField(50, 'volume'),
				min: 0,
				max: 100
			});

			const slider = page.getByRole('slider');
			await expect.element(slider).toBeVisible();
		});

		it('should render PasswordInput for password type', async () => {
			renderSfield({
				type: 'password',
				field: createMockField('', 'password')
			});

			const input = document.querySelector('input[type="password"]');
			expect(input).toBeTruthy();
		});
	});

	describe('wrapper classes', () => {
		it('should apply wrapper class from string', async () => {
			renderSfield({
				type: 'text',
				field: createMockField('', 'test'),
				class: 'custom-wrapper'
			});

			const wrapper = document.querySelector('.custom-wrapper');
			expect(wrapper).toBeTruthy();
		});

		it('should apply class object with wrapper, input, label', async () => {
			renderSfield({
				type: 'text',
				field: createMockField('', 'test'),
				label: 'Test Label',
				class: {
					wrapper: 'wrapper-class',
					input: 'input-class',
					label: 'label-class'
				}
			});

			const wrapper = document.querySelector('.wrapper-class');
			const input = document.querySelector('.input-class');
			const label = document.querySelector('.label-class');

			expect(wrapper).toBeTruthy();
			expect(input).toBeTruthy();
			expect(label).toBeTruthy();
		});
	});

	describe('issue display', () => {
		it('should show issues when field has issues and showIssues is true', async () => {
			renderSfield({
				type: 'text',
				field: createMockField('', 'test', [{ path: ['test'], message: 'This field is required' }]),
				forceShowIssues: true
			});

			const issueText = page.getByText('This field is required');
			await expect.element(issueText).toBeVisible();
		});

		it('should not show issues when field is not touched', async () => {
			renderSfield({
				type: 'text',
				field: createMockField('', 'test', [{ path: ['test'], message: 'This field is required' }])
			});

			const issueText = document.body.textContent;
			expect(issueText).not.toContain('This field is required');
		});

		it('should add error class when has issues', async () => {
			renderSfield({
				type: 'text',
				field: createMockField('', 'test', [{ path: ['test'], message: 'Error' }]),
				forceShowIssues: true
			});

			const input = document.querySelector('.sform-field-error');
			expect(input).toBeTruthy();
		});
	});

	describe('hint display', () => {
		it('should render string hint', async () => {
			renderSfield({
				type: 'text',
				field: createMockField('', 'test'),
				hint: 'Enter your username'
			});

			const hint = page.getByText('Enter your username');
			await expect.element(hint).toBeVisible();
		});
	});

	describe('blur and input handlers', () => {
		it('should mark field touched on blur', async () => {
			let touched = false;

			renderSfield({
				type: 'text',
				field: createMockField('', 'test'),
				onTouched: () => {
					touched = true;
				}
			});

			const input = page.getByRole('textbox');
			await userEvent.click(input);
			await userEvent.tab();

			expect(touched).toBe(true);
		});

		it('should mark field dirty on input', async () => {
			let dirty = false;

			renderSfield({
				type: 'text',
				field: createMockField('', 'test'),
				onDirty: () => {
					dirty = true;
				}
			});

			const input = page.getByRole('textbox');
			await userEvent.type(input, 'test');

			expect(dirty).toBe(true);
		});
	});
});
