/**
 * Tests for Input Components
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import InputTestWrapper from './InputTestWrapper.test.svelte';
import type { RemoteFormField, RemoteFormFieldValue, RemoteFormIssue } from '../types.js';

// Helper to create mock field that matches RemoteFormField interface
function createMockField(
	value: RemoteFormFieldValue = '',
	issues: RemoteFormIssue[] = []
): RemoteFormField<RemoteFormFieldValue> {
	return {
		value: () => value,
		set: vi.fn(),
		issues: () => issues,
		as: (type: string, hiddenValue?: string) => ({
			name: 'testField',
			type,
			value: type === 'hidden' ? hiddenValue : value,
			'aria-invalid': issues.length > 0
		})
	} as unknown as RemoteFormField<RemoteFormFieldValue>;
}

// Helper to render InputTestWrapper with proper typing for vitest-browser-svelte
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderInput(props: Record<string, any>) {
	return render(InputTestWrapper as any, { props });
}

describe('TextInput', () => {
	describe('rendering', () => {
		it('should render text input', async () => {
			renderInput({
					component: 'TextInput',
					field: createMockField('test value'),
					type: 'text',
					name: 'testField',
					showIssues: false
				});

			const input = page.getByRole('textbox');
			await expect.element(input).toBeVisible();
		});

		it('should render label when provided', async () => {
			renderInput({
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					label: 'Test Label',
					showIssues: false
				});

			const label = page.getByText('Test Label');
			await expect.element(label).toBeVisible();
		});

		it('should apply placeholder', async () => {
			renderInput({
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					placeholder: 'Enter value',
					showIssues: false
				});

			const input = page.getByPlaceholder('Enter value');
			await expect.element(input).toBeVisible();
		});

		it('should render prefix as string', async () => {
			renderInput({
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					prefix: '$',
					showIssues: false
				});

			const prefix = page.getByText('$');
			await expect.element(prefix).toBeVisible();
		});

		it('should render suffix as string', async () => {
			renderInput({
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					suffix: '%',
					showIssues: false
				});

			const suffix = page.getByText('%');
			await expect.element(suffix).toBeVisible();
		});

		it('should set disabled attribute', async () => {
			renderInput({
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					disabled: true,
					showIssues: false
				});

			const input = page.getByRole('textbox');
			await expect.element(input).toBeDisabled();
		});

		it('should set readonly attribute', async () => {
			renderInput({
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					readonly: true,
					showIssues: false
				});

			const input = document.querySelector('input');
			expect(input?.hasAttribute('readonly')).toBe(true);
		});
	});

	describe('callbacks', () => {
		it('should call onblur when blurred', async () => {
			const onblur = vi.fn();

			renderInput({
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					showIssues: false,
					onblur
				});

			const input = page.getByRole('textbox');
			await userEvent.click(input);
			await userEvent.tab();

			expect(onblur).toHaveBeenCalled();
		});

		it('should call oninput when typing', async () => {
			const oninput = vi.fn();

			renderInput({
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					showIssues: false,
					oninput
				});

			const input = page.getByRole('textbox');
			await userEvent.type(input, 'test');

			expect(oninput).toHaveBeenCalled();
		});
	});
});

describe('NumberInput', () => {
	describe('rendering', () => {
		it('should render number input', async () => {
			renderInput({
					component: 'NumberInput',
					field: createMockField(42),
					name: 'testField',
					showIssues: false
				});

			const input = page.getByRole('spinbutton');
			await expect.element(input).toBeVisible();
		});

		it('should render prefix and suffix', async () => {
			renderInput({
					component: 'NumberInput',
					field: createMockField(100),
					name: 'testField',
					prefix: '$',
					suffix: 'USD',
					showIssues: false
				});

			const prefix = page.getByText('$');
			const suffix = page.getByText('USD');
			await expect.element(prefix).toBeVisible();
			await expect.element(suffix).toBeVisible();
		});

		it('should set min and max', async () => {
			renderInput({
					component: 'NumberInput',
					field: createMockField(50),
					name: 'testField',
					min: 0,
					max: 100,
					showIssues: false
				});

			const input = document.querySelector('input');
			expect(input?.getAttribute('min')).toBe('0');
			expect(input?.getAttribute('max')).toBe('100');
		});

		it('should set step', async () => {
			renderInput({
					component: 'NumberInput',
					field: createMockField(5),
					name: 'testField',
					step: 5,
					showIssues: false
				});

			const input = document.querySelector('input');
			expect(input?.getAttribute('step')).toBe('5');
		});

		it('should hide controls when showControls is false', async () => {
			renderInput({
					component: 'NumberInput',
					field: createMockField(10),
					name: 'testField',
					showControls: false,
					showIssues: false
				});

			const input = document.querySelector('input');
			expect(input?.classList.contains('sform-number-no-controls')).toBe(true);
			expect(input?.style.cssText).toContain('appearance: textfield');
		});

		it('should align text to end', async () => {
			renderInput({
					component: 'NumberInput',
					field: createMockField(10),
					name: 'testField',
					align: 'end',
					showIssues: false
				});

			const input = document.querySelector('input');
			expect(input?.style.cssText).toContain('text-align: end');
		});
	});

	describe('maxDecimals', () => {
		it('should prevent period key when maxDecimals is 0', async () => {
			renderInput({
					component: 'NumberInput',
					field: createMockField(10),
					name: 'testField',
					maxDecimals: 0,
					showIssues: false
				});

			const input = page.getByRole('spinbutton');
			await userEvent.click(input);

			// Try to type period
			await userEvent.keyboard('.');

			// Value should not contain period
			const inputEl = document.querySelector('input');
			expect(inputEl?.value).not.toContain('.');
		});

		it('should truncate decimals on input', async () => {
			const field = createMockField(0);

			renderInput({
					component: 'NumberInput',
					field,
					name: 'testField',
					maxDecimals: 2,
					showIssues: false
				});

			const input = document.querySelector('input')!;
			// Simulate input with too many decimals
			input.value = '10.12345';
			input.dispatchEvent(new Event('input', { bubbles: true }));

			expect(input.value).toBe('10.12');
		});
	});
});

describe('SelectInput', () => {
	it('should render select with options', async () => {
		renderInput({
				component: 'SelectInput',
				field: createMockField('option1'),
				name: 'testField',
				options: [
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2' }
				],
				showIssues: false
			});

		const select = page.getByRole('combobox');
		await expect.element(select).toBeVisible();

		const options = document.querySelectorAll('option');
		expect(options.length).toBe(2);
	});

	it('should render options with disabled flag', async () => {
		renderInput({
				component: 'SelectInput',
				field: createMockField(''),
				name: 'testField',
				options: [
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2', disabled: true }
				],
				showIssues: false
			});

		const disabledOption = document.querySelector('option[disabled]');
		expect(disabledOption).toBeTruthy();
		expect(disabledOption?.textContent?.trim()).toBe('Option 2');
	});

	it('should support string options shorthand', async () => {
		renderInput({
				component: 'SelectInput',
				field: createMockField(''),
				name: 'testField',
				options: ['Apple', 'Banana', 'Cherry'],
				showIssues: false
			});

		const options = document.querySelectorAll('option');
		expect(options.length).toBe(3);
		expect(options[0].textContent?.trim()).toBe('Apple');
	});
});

describe('CheckboxInput', () => {
	it('should render checkbox', async () => {
		renderInput({
				component: 'CheckboxInput',
				field: createMockField(false),
				name: 'testField',
				showIssues: false
			});

		const checkbox = page.getByRole('checkbox');
		await expect.element(checkbox).toBeVisible();
	});

	it('should render label', async () => {
		renderInput({
				component: 'CheckboxInput',
				field: createMockField(false),
				name: 'testField',
				label: 'Accept terms',
				showIssues: false
			});

		const label = page.getByText('Accept terms');
		await expect.element(label).toBeVisible();
	});

	it('should support disabled state', async () => {
		renderInput({
				component: 'CheckboxInput',
				field: createMockField(false),
				name: 'testField',
				disabled: true,
				showIssues: false
			});

		const checkbox = page.getByRole('checkbox');
		await expect.element(checkbox).toBeDisabled();
	});
});

describe('RadioInput', () => {
	it('should render radio options', async () => {
		renderInput({
				component: 'RadioInput',
				field: createMockField('option1'),
				name: 'testField',
				options: [
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2' }
				],
				showIssues: false
			});

		const radios = page.getByRole('radio').all();
		expect((await radios).length).toBe(2);
	});

	it('should render with fieldset and legend', async () => {
		renderInput({
				component: 'RadioInput',
				field: createMockField(''),
				name: 'testField',
				label: 'Choose an option',
				options: [
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2' }
				],
				showIssues: false
			});

		const fieldset = document.querySelector('fieldset');
		const legend = document.querySelector('legend');
		expect(fieldset).toBeTruthy();
		expect(legend?.textContent?.trim()).toBe('Choose an option');
	});

	it('should support disabled options', async () => {
		renderInput({
				component: 'RadioInput',
				field: createMockField(''),
				name: 'testField',
				options: [
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2', disabled: true }
				],
				showIssues: false
			});

		const radios = document.querySelectorAll('input[type="radio"]');
		const disabledRadio = radios[1] as HTMLInputElement;
		expect(disabledRadio.disabled).toBe(true);
	});
});

describe('TextareaInput', () => {
	it('should render textarea', async () => {
		renderInput({
				component: 'TextareaInput',
				field: createMockField('test content'),
				name: 'testField',
				showIssues: false
			});

		const textarea = page.getByRole('textbox');
		await expect.element(textarea).toBeVisible();
	});

	it('should render placeholder', async () => {
		renderInput({
				component: 'TextareaInput',
				field: createMockField(''),
				name: 'testField',
				placeholder: 'Enter description...',
				showIssues: false
			});

		const textarea = page.getByPlaceholder('Enter description...');
		await expect.element(textarea).toBeVisible();
	});

	it('should support disabled state', async () => {
		renderInput({
				component: 'TextareaInput',
				field: createMockField(''),
				name: 'testField',
				disabled: true,
				showIssues: false
			});

		const textarea = page.getByRole('textbox');
		await expect.element(textarea).toBeDisabled();
	});

	it('should render prefix as string', async () => {
		renderInput({
				component: 'TextareaInput',
				field: createMockField(''),
				name: 'testField',
				prefix: 'Note:',
				showIssues: false
			});

		const prefix = page.getByText('Note:');
		await expect.element(prefix).toBeVisible();
	});

	it('should render suffix as string', async () => {
		renderInput({
				component: 'TextareaInput',
				field: createMockField(''),
				name: 'testField',
				suffix: '(optional)',
				showIssues: false
			});

		const suffix = page.getByText('(optional)');
		await expect.element(suffix).toBeVisible();
	});
});

describe('RangeInput', () => {
	it('should render range slider', async () => {
		renderInput({
				component: 'RangeInput',
				field: createMockField(50),
				name: 'testField',
				min: 0,
				max: 100,
				showIssues: false
			});

		const slider = page.getByRole('slider');
		await expect.element(slider).toBeVisible();
	});

	it('should set min and max', async () => {
		renderInput({
				component: 'RangeInput',
				field: createMockField(25),
				name: 'testField',
				min: 0,
				max: 100,
				showIssues: false
			});

		const slider = document.querySelector('input[type="range"]');
		expect(slider?.getAttribute('min')).toBe('0');
		expect(slider?.getAttribute('max')).toBe('100');
	});
});

describe('ToggleInput', () => {
	it('should render toggle', async () => {
		renderInput({
				component: 'ToggleInput',
				field: createMockField(false),
				name: 'testField',
				showIssues: false
			});

		// Toggle is implemented as checkbox with styling
		const toggle = document.querySelector('.sform-toggle');
		expect(toggle).toBeTruthy();
	});
});

describe('PasswordInput', () => {
	it('should render password input', async () => {
		renderInput({
				component: 'PasswordInput',
				field: createMockField('secret'),
				name: 'testField',
				showIssues: false
			});

		const input = document.querySelector('input[type="password"]');
		expect(input).toBeTruthy();
	});

	it('should have show/hide toggle', async () => {
		renderInput({
				component: 'PasswordInput',
				field: createMockField('secret'),
				name: 'testField',
				showIssues: false
			});

		const toggleButton = document.querySelector('.sform-password-toggle');
		expect(toggleButton).toBeTruthy();
	});
});

describe('aria-invalid', () => {
	it('should set aria-invalid when showIssues is true and has issues', async () => {
		renderInput({
				component: 'TextInput',
				field: createMockField('', [{ path: ['testField'], message: 'Required' }]),
				type: 'text',
				name: 'testField',
				showIssues: true
			});

		const input = document.querySelector('input');
		expect(input?.getAttribute('aria-invalid')).toBe('true');
	});

	it('should not set aria-invalid when showIssues is false', async () => {
		renderInput({
				component: 'TextInput',
				field: createMockField('', [{ path: ['testField'], message: 'Required' }]),
				type: 'text',
				name: 'testField',
				showIssues: false
			});

		const input = document.querySelector('input');
		// aria-invalid should be undefined/null when showIssues is false
		expect(input?.getAttribute('aria-invalid')).toBeNull();
	});
});

describe('MaskedInput', () => {
	it('should render masked input', async () => {
		renderInput({
				component: 'MaskedInput',
				field: createMockField(''),
				name: 'testField',
				mask: '999-999-9999',
				showIssues: false
			});

		const input = page.getByRole('textbox');
		await expect.element(input).toBeVisible();
	});

	it('should render with label', async () => {
		renderInput({
				component: 'MaskedInput',
				field: createMockField(''),
				name: 'testField',
				mask: 'phone',
				label: 'Phone Number',
				showIssues: false
			});

		const label = page.getByText('Phone Number');
		await expect.element(label).toBeVisible();
	});

	it('should support predefined mask patterns', async () => {
		renderInput({
				component: 'MaskedInput',
				field: createMockField(''),
				name: 'testField',
				mask: 'phone',
				showIssues: false
			});

		const input = page.getByRole('textbox');
		await expect.element(input).toBeVisible();
	});

	it('should render prefix', async () => {
		renderInput({
				component: 'MaskedInput',
				field: createMockField(''),
				name: 'testField',
				mask: 'phone',
				prefix: '+1',
				showIssues: false
			});

		const prefix = page.getByText('+1');
		await expect.element(prefix).toBeVisible();
	});

	it('should render suffix', async () => {
		renderInput({
				component: 'MaskedInput',
				field: createMockField(''),
				name: 'testField',
				mask: 'phone',
				suffix: 'ext',
				showIssues: false
			});

		const suffix = page.getByText('ext');
		await expect.element(suffix).toBeVisible();
	});

	it('should support disabled state', async () => {
		renderInput({
				component: 'MaskedInput',
				field: createMockField(''),
				name: 'testField',
				mask: 'phone',
				disabled: true,
				showIssues: false
			});

		const input = page.getByRole('textbox');
		await expect.element(input).toBeDisabled();
	});

	it('should apply mask on input', async () => {
		const field = createMockField('');

		renderInput({
				component: 'MaskedInput',
				field,
				name: 'testField',
				mask: '999-999-9999',
				showIssues: false
			});

		const input = page.getByRole('textbox');
		await userEvent.type(input, '1234567890');

		const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
		expect(inputEl.value).toBe('123-456-7890');
	});

	it('should handle backspace correctly', async () => {
		const field = createMockField('');

		renderInput({
				component: 'MaskedInput',
				field,
				name: 'testField',
				mask: '999-999',
				showIssues: false
			});

		const input = page.getByRole('textbox');
		await userEvent.type(input, '123456');
		await userEvent.keyboard('{Backspace}');

		const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
		expect(inputEl.value).toBe('123-45');
	});
});

describe('CheckboxGroupInput', () => {
	it('should render checkbox group', async () => {
		renderInput({
				component: 'CheckboxGroupInput',
				field: createMockField([]),
				name: 'testField',
				options: [
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2' }
				],
				showIssues: false
			});

		const checkboxes = page.getByRole('checkbox').all();
		expect((await checkboxes).length).toBe(2);
	});

	it('should render with legend', async () => {
		renderInput({
				component: 'CheckboxGroupInput',
				field: createMockField([]),
				name: 'testField',
				label: 'Select options',
				options: [
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2' }
				],
				showIssues: false
			});

		const legend = document.querySelector('legend');
		expect(legend?.textContent?.trim()).toBe('Select options');
	});

	it('should support disabled options', async () => {
		renderInput({
				component: 'CheckboxGroupInput',
				field: createMockField([]),
				name: 'testField',
				options: [
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2', disabled: true }
				],
				showIssues: false
			});

		const checkboxes = document.querySelectorAll('input[type="checkbox"]');
		const disabledCheckbox = checkboxes[1] as HTMLInputElement;
		expect(disabledCheckbox.disabled).toBe(true);
	});
});

describe('HiddenInput', () => {
	describe('rendering', () => {
		it('should render hidden input', async () => {
			renderInput({
				component: 'HiddenInput',
				field: createMockField(),
				name: 'testField',
				value: 'secret-token'
			});

			const input = document.querySelector('input[type="hidden"]');
			expect(input).not.toBeNull();
		});

		it('should set the value attribute from value prop', async () => {
			renderInput({
				component: 'HiddenInput',
				field: createMockField(),
				name: 'testField',
				value: 'my-token-value'
			});

			const input = document.querySelector('input[type="hidden"]') as HTMLInputElement;
			expect(input?.value).toBe('my-token-value');
		});

		it('should set the id attribute from name prop', async () => {
			renderInput({
				component: 'HiddenInput',
				field: createMockField(),
				name: 'hiddenTokenField',
				value: 'token'
			});

			const input = document.querySelector('input[type="hidden"]');
			expect(input?.id).toBe('hiddenTokenField');
		});

		it('should set the name attribute from field.as()', async () => {
			renderInput({
				component: 'HiddenInput',
				field: createMockField(),
				name: 'testField',
				value: 'test'
			});

			const input = document.querySelector('input[type="hidden"]');
			expect(input?.getAttribute('name')).toBe('testField');
		});

		it('should not be visible in the DOM', async () => {
			renderInput({
				component: 'HiddenInput',
				field: createMockField(),
				name: 'testField',
				value: 'hidden-value'
			});

			const input = document.querySelector('input[type="hidden"]') as HTMLInputElement;
			// Hidden inputs have no visible rendering
			expect(input.offsetWidth).toBe(0);
			expect(input.offsetHeight).toBe(0);
		});

		it('should handle empty value', async () => {
			renderInput({
				component: 'HiddenInput',
				field: createMockField(),
				name: 'testField',
				value: ''
			});

			const input = document.querySelector('input[type="hidden"]') as HTMLInputElement;
			expect(input?.value).toBe('');
		});

		it('should handle undefined value by defaulting to empty string', async () => {
			renderInput({
				component: 'HiddenInput',
				field: createMockField(),
				name: 'testField'
			});

			const input = document.querySelector('input[type="hidden"]') as HTMLInputElement;
			expect(input?.value).toBe('');
		});
	});
});
