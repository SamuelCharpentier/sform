/**
 * Sform TypeScript Types
 * Defines all types for the Sform library
 */

import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type {
	RemoteForm as SvelteKitRemoteForm,
	RemoteFormField,
	RemoteFormFields,
	RemoteFormFieldValue,
	RemoteFormInput,
	RemoteFormIssue
} from '@sveltejs/kit';

/**
 * Re-export SvelteKit's remote form types for library consumers
 */
export type {
	RemoteFormField,
	RemoteFormFields,
	RemoteFormFieldValue,
	RemoteFormInput,
	RemoteFormIssue
};

/**
 * Validation visibility modes
 * - 'blur': Show issues after leaving field (default)
 * - 'change': Show issues on every keystroke
 * - 'submit': Show all issues only after submit
 */
export type VisibilityMode = 'blur' | 'change' | 'submit';

/**
 * Field state tracking
 */
export interface FieldState {
	/** Field has been focused and blurred */
	touched: boolean;
	/** Field value has changed from initial */
	dirty: boolean;
}

/**
 * Class names for Sfield customization
 */
export interface SfieldClasses {
	/** Wrapper element class */
	wrapper?: string;
	/** Label element class */
	label?: string;
	/** Input element class */
	input?: string;
	/** Messages/errors container class */
	messages?: string;
}

/**
 * Supported input types for Sfield
 */
export type InputType =
	| 'text'
	| 'email'
	| 'password'
	| 'number'
	| 'tel'
	| 'url'
	| 'search'
	| 'date'
	| 'datetime-local'
	| 'time'
	| 'month'
	| 'week'
	| 'color'
	| 'textarea'
	| 'select'
	| 'checkbox'
	| 'checkbox-group'
	| 'radio'
	| 'file'
	| 'hidden'
	| 'range'
	| 'toggle'
	| 'toggle-options'
	| 'masked';

/** Text-like input types */
export type TextInputType =
	| 'text'
	| 'email'
	| 'tel'
	| 'url'
	| 'search'
	| 'date'
	| 'datetime-local'
	| 'time'
	| 'month'
	| 'week'
	| 'color'
	| 'file'
	| 'hidden';

/** Numeric input types */
export type NumericInputType = 'number';

/**
 * Select option type
 */
export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

/**
 * Remote form type alias using SvelteKit's official type.
 * Generic parameters allow type-safe form handling:
 * - Input: The schema type for form data (defaults to RemoteFormInput)
 * - Output: The return type from form submission (defaults to unknown)
 */
export type RemoteForm<
	Input extends RemoteFormInput | void = RemoteFormInput,
	Output = unknown
> = SvelteKitRemoteForm<Input, Output>;

/**
 * Form context provided by Sform to children.
 * Uses a structural form type to accept any RemoteForm.
 */
export interface SformContext {
	/** The remote form object (structural type for any RemoteForm) */
	form: {
		fields: {
			allIssues?: () => RemoteFormIssue[] | undefined;
			[key: string]: unknown;
		};
		[key: string]: unknown;
	};
	/** Get field state */
	getFieldState: (name: string) => FieldState;
	/** Mark field as touched */
	markTouched: (name: string) => void;
	/** Mark field as dirty */
	markDirty: (name: string) => void;
	/** Check if field should display issues */
	shouldDisplayIssues: (name: string, fieldVisibility?: VisibilityMode) => boolean;
	/** Form-level visibility mode */
	visibility: VisibilityMode;
	/** Whether form has been submitted */
	submitted: boolean;
	/** Mark form as submitted */
	markSubmitted: () => void;
	/** Mark all fields as touched and dirty to show all issues */
	markAllFieldsDirty: () => void;
	/** Reset all field states (touched, dirty, submitted) */
	resetFieldStates: () => void;
}

/**
 * Props for Sform component.
 * Generic over the form's input and output types.
 */
export interface SformProps<Input extends RemoteFormInput = RemoteFormInput, Output = unknown> {
	/** Remote form object from form() API */
	form: SvelteKitRemoteForm<Input, Output>;
	/** Preflight validation schema (Valibot, Zod, or any StandardSchema) */
	schema?: StandardSchemaV1<Input, unknown>;
	/** Default validation visibility mode */
	visibility?: VisibilityMode;
	/** Form element class */
	class?: string;
	/** Children content */
	children: Snippet;
}

/**
 * Base props shared by all Sfield types
 */
export interface BaseSfieldProps {
	/** Field name - corresponds to form.fields[name] */
	name: string;
	/** Field label */
	label?: string;
	/** Placeholder text */
	placeholder?: string;
	/** Field-level visibility override */
	visibility?: VisibilityMode;
	/** CSS classes for sub-elements */
	class?: SfieldClasses | string;
	/** Whether field is disabled */
	disabled?: boolean;
	/** Whether field is readonly */
	readonly?: boolean;
	/** Autocomplete attribute */
	autocomplete?: HTMLInputAttributes['autocomplete'];
}

/**
 * Props for text-like inputs (text, email, tel, url, search, date, etc.)
 */
export interface TextSfieldProps extends BaseSfieldProps {
	type: TextInputType;
}

/**
 * Props for password input
 */
export interface PasswordSfieldProps extends BaseSfieldProps {
	type: 'password';
	/** Whether to show the password visibility toggle (default: true) */
	showToggle?: boolean;
}

/**
 * Props for number input
 */
export interface NumberSfieldProps extends BaseSfieldProps {
	type: 'number';
	/** Minimum value */
	min?: number | string;
	/** Maximum value */
	max?: number | string;
	/** Step value */
	step?: number | string;
}

/**
 * Props for textarea input
 */
export interface TextareaSfieldProps extends BaseSfieldProps {
	type: 'textarea';
}

/**
 * Props for select input
 */
export interface SelectSfieldProps extends BaseSfieldProps {
	type: 'select';
	/** Options for select */
	options: SelectOption[] | string[];
}

/**
 * Props for checkbox input (single yes/no)
 */
export interface CheckboxSfieldProps extends BaseSfieldProps {
	type: 'checkbox';
}

/**
 * Props for checkbox group input (multi-select)
 */
export interface CheckboxGroupSfieldProps extends BaseSfieldProps {
	type: 'checkbox-group';
	/** Options for checkbox group */
	options: SelectOption[] | string[];
}

/**
 * Props for radio input
 */
export interface RadioSfieldProps extends BaseSfieldProps {
	type: 'radio';
	/** Options for radio button group */
	options: SelectOption[] | string[];
}

/**
 * Props for range input
 */
export interface RangeSfieldProps extends BaseSfieldProps {
	type: 'range';
	/** Minimum value */
	min?: number | string;
	/** Maximum value */
	max?: number | string;
	/** Step value */
	step?: number | string;
	/** Show value display */
	showValue?: boolean;
	/** Format function for value display */
	formatValue?: (value: number) => string;
}

/**
 * Props for toggle input
 */
export interface ToggleSfieldProps extends BaseSfieldProps {
	type: 'toggle';
	/** Label when toggle is on */
	onLabel?: string;
	/** Label when toggle is off */
	offLabel?: string;
	/** Value when checked */
	checkedValue?: string;
	/** Value when unchecked */
	uncheckedValue?: string;
}

/**
 * Props for toggle-options input (button group)
 */
export interface ToggleOptionsSfieldProps extends BaseSfieldProps {
	type: 'toggle-options';
	/** Options for toggle buttons */
	options: ToggleOption[] | string[];
	/** Allow multiple selections */
	multiple?: boolean;
}

/**
 * Props for masked input
 */
export interface MaskedSfieldProps extends BaseSfieldProps {
	type: 'masked';
	/** Mask pattern (e.g., '(999) 999-9999') or preset name */
	mask: string;
	/** Placeholder character for masked inputs */
	maskPlaceholder?: string;
	/** Whether to show the full mask with placeholders */
	showMaskPlaceholder?: boolean;
	/** Whether to store the unmasked (raw) value. If true, stores '1234567890'. If false, stores '(123) 456-7890'. Default: true */
	unmaskValue?: boolean;
}

/**
 * Discriminated union of all Sfield prop types
 */
export type SfieldProps =
	| TextSfieldProps
	| PasswordSfieldProps
	| NumberSfieldProps
	| TextareaSfieldProps
	| SelectSfieldProps
	| CheckboxSfieldProps
	| CheckboxGroupSfieldProps
	| RadioSfieldProps
	| RangeSfieldProps
	| ToggleSfieldProps
	| ToggleOptionsSfieldProps
	| MaskedSfieldProps;

/**
 * Props for internal input components
 */
export interface InputComponentProps {
	/** Remote field from form */
	field: RemoteFormField<RemoteFormFieldValue>;
	/** Input type */
	type: InputType;
	/** Field name */
	name: string;
	/** Field label */
	label?: string;
	/** Placeholder text */
	placeholder?: string;
	/** Input class */
	class?: string;
	/** Label class */
	labelClass?: string;
	/** Whether input is disabled */
	disabled?: boolean;
	/** Whether input is readonly */
	readonly?: boolean;
	/** Autocomplete attribute */
	autocomplete?: HTMLInputAttributes['autocomplete'];
	/** Blur handler */
	onblur?: () => void;
	/** Input handler */
	oninput?: () => void;
}

/**
 * Props for numeric input components (number, range)
 */
export interface NumericInputComponentProps extends InputComponentProps {
	/** Minimum value */
	min?: number | string;
	/** Maximum value */
	max?: number | string;
	/** Step value */
	step?: number | string;
}

/**
 * Props for text input component (includes number with min/max/step)
 */
export interface TextInputComponentProps extends NumericInputComponentProps {}

/**
 * Props for textarea input component
 */
export interface TextareaInputProps extends InputComponentProps {}

/**
 * Props for select input component
 */
export interface SelectInputProps extends InputComponentProps {
	/** Options for select */
	options: SelectOption[] | string[];
}

/**
 * Props for checkbox input component (single yes/no)
 */
export interface CheckboxRadioInputProps extends InputComponentProps {
	/** Value for the input (unused for single checkbox) */
	value?: string;
}

/**
 * Props for checkbox group input component
 */
export interface CheckboxGroupInputProps extends InputComponentProps {
	/** Options for the checkbox group */
	options: SelectOption[] | string[];
}

/**
 * Props for radio input component
 */
export interface RadioInputProps extends InputComponentProps {
	/** Options for the radio group */
	options: SelectOption[] | string[];
}

/**
 * Form state for button snippets
 */
export interface ButtonFormState {
	/** Whether form is submitting */
	pending: boolean;
	/** Whether form submission was successful (has result, no issues) */
	success: boolean;
	/** Whether form has validation issues */
	hasIssues: boolean;
	/** The form result if available */
	result: unknown;
}

/**
 * Props for button input component
 */
export interface ButtonInputProps {
	/** Button text (used if no snippets provided) */
	label?: string;
	/** Button type */
	buttonType?: 'submit' | 'reset' | 'button';
	/** Button class */
	class?: string;
	/** Whether button is disabled */
	disabled?: boolean;
	/** Snippet for default state */
	defaultState?: Snippet;
	/** Snippet for pending state */
	pendingState?: Snippet;
	/** Snippet for success state */
	successState?: Snippet;
	/** Snippet for error/issues state */
	errorState?: Snippet;
	/** Access to form state for custom rendering */
	formState?: ButtonFormState;
}

/**
 * Props for range input component
 */
export interface RangeInputProps extends NumericInputComponentProps {
	/** Show value display */
	showValue?: boolean;
	/** Format function for value display */
	formatValue?: (value: number) => string;
}

/**
 * Props for password input component
 */
export interface PasswordInputProps extends InputComponentProps {
	/** Whether to show the password visibility toggle */
	showToggle?: boolean;
}

/**
 * Props for toggle input component
 */
export interface ToggleInputProps extends InputComponentProps {
	/** Label when toggle is on */
	onLabel?: string;
	/** Label when toggle is off */
	offLabel?: string;
	/** Value when checked */
	checkedValue?: string;
	/** Value when unchecked */
	uncheckedValue?: string;
}

/**
 * Toggle option for ToggleOptions component
 */
export interface ToggleOption {
	value: string;
	label: string;
	disabled?: boolean;
}

/**
 * Props for toggle options (button group) component
 */
export interface ToggleOptionsInputProps extends InputComponentProps {
	/** Options to display as toggle buttons */
	options: ToggleOption[] | string[];
	/** Allow multiple selections */
	multiple?: boolean;
}
