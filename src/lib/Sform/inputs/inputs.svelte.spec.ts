/**
 * Tests for Input Components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import InputTestWrapper from './InputTestWrapper.test.svelte';

// Helper to create mock field
function createMockField(value: unknown = '', issues: Array<{ message: string }> = []) {
	return {
		value: () => value,
		set: vi.fn(),
		issues: () => issues,
		as: (type: string) => ({
			name: 'testField',
			type,
			value,
			'aria-invalid': issues.length > 0
		})
	};
}

describe('TextInput', () => {
	describe('rendering', () => {
		it('should render text input', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'TextInput',
					field: createMockField('test value'),
					type: 'text',
					name: 'testField',
					showIssues: false
				}
			});

			const input = page.getByRole('textbox');
			await expect.element(input).toBeVisible();
		});

		it('should render label when provided', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					label: 'Test Label',
					showIssues: false
				}
			});

			const label = page.getByText('Test Label');
			await expect.element(label).toBeVisible();
		});

		it('should apply placeholder', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					placeholder: 'Enter value',
					showIssues: false
				}
			});

			const input = page.getByPlaceholder('Enter value');
			await expect.element(input).toBeVisible();
		});

		it('should render prefix as string', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					prefix: '$',
					showIssues: false
				}
			});

			const prefix = page.getByText('$');
			await expect.element(prefix).toBeVisible();
		});

		it('should render suffix as string', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					suffix: '%',
					showIssues: false
				}
			});

			const suffix = page.getByText('%');
			await expect.element(suffix).toBeVisible();
		});

		it('should hide input when type is hidden', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'TextInput',
					field: createMockField(),
					type: 'hidden',
					name: 'testField',
					showIssues: false
				}
			});

			const wrapper = document.querySelector('.sform-input-wrapper');
			expect(wrapper).toBeNull();
		});

		it('should set disabled attribute', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					disabled: true,
					showIssues: false
				}
			});

			const input = page.getByRole('textbox');
			await expect.element(input).toBeDisabled();
		});

		it('should set readonly attribute', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					readonly: true,
					showIssues: false
				}
			});

			const input = document.querySelector('input');
			expect(input?.hasAttribute('readonly')).toBe(true);
		});
	});

	describe('callbacks', () => {
		it('should call onblur when blurred', async () => {
			const onblur = vi.fn();

			render(InputTestWrapper, {
				props: {
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					showIssues: false,
					onblur
				}
			});

			const input = page.getByRole('textbox');
			await userEvent.click(input);
			await userEvent.tab();

			expect(onblur).toHaveBeenCalled();
		});

		it('should call oninput when typing', async () => {
			const oninput = vi.fn();

			render(InputTestWrapper, {
				props: {
					component: 'TextInput',
					field: createMockField(),
					type: 'text',
					name: 'testField',
					showIssues: false,
					oninput
				}
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
			render(InputTestWrapper, {
				props: {
					component: 'NumberInput',
					field: createMockField(42),
					name: 'testField',
					showIssues: false
				}
			});

			const input = page.getByRole('spinbutton');
			await expect.element(input).toBeVisible();
		});

		it('should render prefix and suffix', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'NumberInput',
					field: createMockField(100),
					name: 'testField',
					prefix: '$',
					suffix: 'USD',
					showIssues: false
				}
			});

			const prefix = page.getByText('$');
			const suffix = page.getByText('USD');
			await expect.element(prefix).toBeVisible();
			await expect.element(suffix).toBeVisible();
		});

		it('should set min and max', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'NumberInput',
					field: createMockField(50),
					name: 'testField',
					min: 0,
					max: 100,
					showIssues: false
				}
			});

			const input = document.querySelector('input');
			expect(input?.getAttribute('min')).toBe('0');
			expect(input?.getAttribute('max')).toBe('100');
		});

		it('should set step', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'NumberInput',
					field: createMockField(5),
					name: 'testField',
					step: 5,
					showIssues: false
				}
			});

			const input = document.querySelector('input');
			expect(input?.getAttribute('step')).toBe('5');
		});

		it('should hide controls when showControls is false', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'NumberInput',
					field: createMockField(10),
					name: 'testField',
					showControls: false,
					showIssues: false
				}
			});

			const input = document.querySelector('input');
			expect(input?.classList.contains('sform-number-no-controls')).toBe(true);
			expect(input?.style.cssText).toContain('appearance: textfield');
		});

		it('should align text to end', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'NumberInput',
					field: createMockField(10),
					name: 'testField',
					align: 'end',
					showIssues: false
				}
			});

			const input = document.querySelector('input');
			expect(input?.style.cssText).toContain('text-align: end');
		});
	});

	describe('maxDecimals', () => {
		it('should prevent period key when maxDecimals is 0', async () => {
			render(InputTestWrapper, {
				props: {
					component: 'NumberInput',
					field: createMockField(10),
					name: 'testField',
					maxDecimals: 0,
					showIssues: false
				}
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

			render(InputTestWrapper, {
				props: {
					component: 'NumberInput',
					field,
					name: 'testField',
					maxDecimals: 2,
					showIssues: false
				}
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
		render(InputTestWrapper, {
			props: {
				component: 'SelectInput',
				field: createMockField('option1'),
				name: 'testField',
				options: [
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2' }
				],
				showIssues: false
			}
		});

		const select = page.getByRole('combobox');
		await expect.element(select).toBeVisible();

		const options = document.querySelectorAll('option');
		expect(options.length).toBe(2);
	});

	it('should render empty option when provided', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'SelectInput',
				field: createMockField(''),
				name: 'testField',
				emptyOption: 'Select...',
				options: [{ value: 'option1', label: 'Option 1' }],
				showIssues: false
			}
		});

		const emptyOption = page.getByText('Select...');
		await expect.element(emptyOption).toBeVisible();
	});

	it('should disable empty option when disableEmptyOption is true', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'SelectInput',
				field: createMockField(''),
				name: 'testField',
				emptyOption: 'Select...',
				disableEmptyOption: true,
				options: [{ value: 'option1', label: 'Option 1' }],
				showIssues: false
			}
		});

		const emptyOption = document.querySelector('option[disabled]');
		expect(emptyOption).toBeTruthy();
	});
});

describe('CheckboxInput', () => {
	it('should render checkbox', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'CheckboxInput',
				field: createMockField(true),
				name: 'testField',
				showIssues: false
			}
		});

		const checkbox = page.getByRole('checkbox');
		await expect.element(checkbox).toBeVisible();
	});

	it('should be checked when value is true', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'CheckboxInput',
				field: createMockField(true),
				name: 'testField',
				showIssues: false
			}
		});

		const checkbox = page.getByRole('checkbox');
		await expect.element(checkbox).toBeChecked();
	});

	it('should render label', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'CheckboxInput',
				field: createMockField(false),
				name: 'testField',
				label: 'Accept terms',
				showIssues: false
			}
		});

		const label = page.getByText('Accept terms');
		await expect.element(label).toBeVisible();
	});
});

describe('RadioInput', () => {
	it('should render radio options', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'RadioInput',
				field: createMockField('option1'),
				name: 'testField',
				options: [
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2' }
				],
				showIssues: false
			}
		});

		const radios = page.getByRole('radio').all();
		expect((await radios).length).toBe(2);
	});

	it('should check selected option', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'RadioInput',
				field: createMockField('option2'),
				name: 'testField',
				options: [
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2' }
				],
				showIssues: false
			}
		});

		// Find the checked radio
		const radios = document.querySelectorAll('input[type="radio"]');
		const checkedRadio = Array.from(radios).find(
			(r) => (r as HTMLInputElement).value === 'option2'
		) as HTMLInputElement;
		expect(checkedRadio?.checked).toBe(true);
	});
});

describe('TextareaInput', () => {
	it('should render textarea', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'TextareaInput',
				field: createMockField('test content'),
				name: 'testField',
				showIssues: false
			}
		});

		const textarea = page.getByRole('textbox');
		await expect.element(textarea).toBeVisible();
	});

	it('should set rows', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'TextareaInput',
				field: createMockField(''),
				name: 'testField',
				rows: 10,
				showIssues: false
			}
		});

		const textarea = document.querySelector('textarea');
		expect(textarea?.getAttribute('rows')).toBe('10');
	});
});

describe('RangeInput', () => {
	it('should render range slider', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'RangeInput',
				field: createMockField(50),
				name: 'testField',
				min: 0,
				max: 100,
				showIssues: false
			}
		});

		const slider = page.getByRole('slider');
		await expect.element(slider).toBeVisible();
	});

	it('should set min and max', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'RangeInput',
				field: createMockField(25),
				name: 'testField',
				min: 0,
				max: 100,
				showIssues: false
			}
		});

		const slider = document.querySelector('input[type="range"]');
		expect(slider?.getAttribute('min')).toBe('0');
		expect(slider?.getAttribute('max')).toBe('100');
	});
});

describe('ToggleInput', () => {
	it('should render toggle', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'ToggleInput',
				field: createMockField(false),
				name: 'testField',
				showIssues: false
			}
		});

		// Toggle is implemented as checkbox with styling
		const toggle = document.querySelector('.sform-toggle');
		expect(toggle).toBeTruthy();
	});
});

describe('PasswordInput', () => {
	it('should render password input', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'PasswordInput',
				field: createMockField('secret'),
				name: 'testField',
				showIssues: false
			}
		});

		const input = document.querySelector('input[type="password"]');
		expect(input).toBeTruthy();
	});

	it('should have show/hide toggle', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'PasswordInput',
				field: createMockField('secret'),
				name: 'testField',
				showIssues: false
			}
		});

		const toggleButton = document.querySelector('.sform-password-toggle');
		expect(toggleButton).toBeTruthy();
	});
});

describe('aria-invalid', () => {
	it('should set aria-invalid when showIssues is true and has issues', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'TextInput',
				field: createMockField('', [{ message: 'Required' }]),
				type: 'text',
				name: 'testField',
				showIssues: true
			}
		});

		const input = document.querySelector('input');
		expect(input?.getAttribute('aria-invalid')).toBe('true');
	});

	it('should not set aria-invalid when showIssues is false', async () => {
		render(InputTestWrapper, {
			props: {
				component: 'TextInput',
				field: createMockField('', [{ message: 'Required' }]),
				type: 'text',
				name: 'testField',
				showIssues: false
			}
		});

		const input = document.querySelector('input');
		// aria-invalid should be undefined/null when showIssues is false
		expect(input?.getAttribute('aria-invalid')).toBeNull();
	});
});
