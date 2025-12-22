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
	RemoteFormIssue,
	RemoteQuery,
	RemoteQueryOverride
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
 * When to trigger validation and show issues
 * - 'blur': Validate and show issues after leaving field (default)
 * - 'change': Validate and show issues on every keystroke
 * - 'submit': Validate and show all issues only after submit
 */
export type ValidateOn = 'blur' | 'change' | 'submit';

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
 * Maps Sfield input types to the value types they handle.
 * Used for type-safe field-to-input matching.
 */
export interface SfieldTypeMap {
	// String types
	text: string;
	email: string;
	password: string;
	tel: string;
	url: string;
	search: string;
	date: string;
	'datetime-local': string;
	time: string;
	month: string;
	week: string;
	color: string;
	textarea: string;
	hidden: string;
	masked: string;
	// Number types
	number: number;
	range: number;
	// Boolean types
	checkbox: boolean;
	toggle: boolean;
	// String (single selection)
	select: string;
	radio: string;
	'toggle-options': string;
	// String array types
	'checkbox-group': string[];
	// File types (less commonly used with remote forms)
	file: File;
}

/**
 * Given a field value type T, returns the Sfield types that can handle it.
 * This is the inverse of SfieldTypeMap - we find which keys produce T.
 */
export type AllowedSfieldType<T> = {
	[K in keyof SfieldTypeMap]: T extends SfieldTypeMap[K] ? K : never;
}[keyof SfieldTypeMap];

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
 * A remote form instance - either a full RemoteForm or the result of .for(id).
 * The .for(id) method returns Omit<RemoteForm, 'for'>, so this type accepts both.
 */
export type RemoteFormInstance<
	Input extends RemoteFormInput | void = RemoteFormInput,
	Output = unknown
> = SvelteKitRemoteForm<Input, Output> | Omit<SvelteKitRemoteForm<Input, Output>, 'for'>;

/**
 * Form context provided by Sform to children.
 * Manages field state (touched, dirty, submitted) for validation display.
 */
export interface SformContext {
	/** Get field state */
	getFieldState: (name: string) => FieldState;
	/** Mark field as touched */
	markTouched: (name: string) => void;
	/** Mark field as dirty */
	markDirty: (name: string) => void;
	/** Check if field should display issues */
	shouldDisplayIssues: (name: string, fieldValidateOn?: ValidateOn) => boolean;
	/** Form-level validateOn mode */
	validateOn: ValidateOn;
	/** Trigger validation (called on blur/input based on mode) */
	triggerValidation: () => void;
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
 * Enhance callback options - typed based on form Input type.
 * Matches SvelteKit's RemoteForm.enhance() callback signature exactly.
 */
export interface EnhanceCallbackOptions<Input extends RemoteFormInput> {
	/** The HTML form element */
	form: HTMLFormElement;
	/** The typed form data */
	data: Input;
	/** Submit the form and optionally update queries */
	submit: () => Promise<void> & {
		updates: (...queries: Array<RemoteQuery<unknown> | RemoteQueryOverride>) => Promise<void>;
	};
}

/**
 * Enhance callback function type
 */
export type EnhanceCallback<Input extends RemoteFormInput> = (
	opts: EnhanceCallbackOptions<Input>
) => void | Promise<void>;

/**
 * Props for Sform component.
 * Generic over the form's input and output types.
 */
export interface SformProps<Input extends RemoteFormInput = RemoteFormInput, Output = unknown> {
	/** Remote form object from form() API, or the result of form.for(id) */
	form: SvelteKitRemoteForm<Input, Output> | Omit<SvelteKitRemoteForm<Input, Output>, 'for'>;
	/** Preflight validation schema (Valibot, Zod, or any StandardSchema) */
	schema?: StandardSchemaV1<Input, unknown>;
	/** Enhance callback for custom form submission handling */
	enhance?: EnhanceCallback<Input>;
	/** When to validate and show issues: 'blur' (default), 'change', or 'submit' */
	validateOn?: ValidateOn;
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
	/** Field-level validateOn override */
	validateOn?: ValidateOn;
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

// ============================================================================
// TYPED SFIELD PROPS - For type-safe field-to-input matching
// ============================================================================

/**
 * Base props for typed Sfield - includes the field prop instead of name lookup
 */
export interface TypedBaseSfieldProps<T extends RemoteFormFieldValue> {
	/** The remote form field - passed directly for type safety */
	field: RemoteFormField<T>;
	/** Field label */
	label?: string;
	/** Placeholder text */
	placeholder?: string;
	/** Field-level validateOn override */
	validateOn?: ValidateOn;
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
 * Extract the props type for a given Sfield type, replacing BaseSfieldProps with TypedBaseSfieldProps
 */
type TypedPropsForType<Type extends keyof SfieldTypeMap> = Type extends
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
	| 'hidden'
	| 'file'
	? TypedBaseSfieldProps<SfieldTypeMap[Type]> & { type: Type }
	: Type extends 'password'
		? TypedBaseSfieldProps<string> & { type: 'password'; showToggle?: boolean }
		: Type extends 'number'
			? TypedBaseSfieldProps<number> & {
					type: 'number';
					min?: number | string;
					max?: number | string;
					step?: number | string;
				}
			: Type extends 'textarea'
				? TypedBaseSfieldProps<string> & { type: 'textarea' }
				: Type extends 'select'
					? TypedBaseSfieldProps<string> & { type: 'select'; options: SelectOption[] | string[] }
					: Type extends 'checkbox'
						? TypedBaseSfieldProps<boolean> & { type: 'checkbox' }
						: Type extends 'checkbox-group'
							? TypedBaseSfieldProps<string[]> & {
									type: 'checkbox-group';
									options: SelectOption[] | string[];
								}
							: Type extends 'radio'
								? TypedBaseSfieldProps<string> & {
										type: 'radio';
										options: SelectOption[] | string[];
									}
								: Type extends 'range'
									? TypedBaseSfieldProps<number> & {
											type: 'range';
											min?: number | string;
											max?: number | string;
											step?: number | string;
											showValue?: boolean;
											formatValue?: (value: number) => string;
										}
									: Type extends 'toggle'
										? TypedBaseSfieldProps<boolean> & {
												type: 'toggle';
												onLabel?: string;
												offLabel?: string;
												checkedValue?: string;
												uncheckedValue?: string;
											}
										: Type extends 'toggle-options'
											? TypedBaseSfieldProps<string> & {
													type: 'toggle-options';
													options: ToggleOption[] | string[];
													multiple?: boolean;
												}
											: Type extends 'masked'
												? TypedBaseSfieldProps<string> & {
														type: 'masked';
														mask: string;
														maskPlaceholder?: string;
														showMaskPlaceholder?: boolean;
														unmaskValue?: boolean;
													}
												: never;

/**
 * Typed Sfield props - constrains the 'type' based on the field's value type.
 *
 * @example
 * ```typescript
 * // If fields.name is RemoteFormField<string>, only string-compatible types are allowed
 * <Sfield field={fields.name} name="name" type="text" /> // ✓ OK
 * <Sfield field={fields.name} name="name" type="number" /> // ✗ Error: number not compatible with string
 *
 * // If fields.age is RemoteFormField<number>, only number-compatible types are allowed
 * <Sfield field={fields.age} name="age" type="number" /> // ✓ OK
 * <Sfield field={fields.age} name="age" type="text" /> // ✗ Error: text not compatible with number
 * ```
 */
export type TypedSfieldProps<T extends RemoteFormFieldValue> = {
	[K in AllowedSfieldType<T>]: TypedPropsForType<K>;
}[AllowedSfieldType<T>];

/**
 * Base props for internal input components (without type - for components with fixed types)
 */
export interface BaseInputComponentProps {
	/** Remote field from form */
	field: RemoteFormField<RemoteFormFieldValue>;
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
	/** Whether to show validation state (controls aria-invalid) */
	showIssues?: boolean;
	/** Blur handler */
	onblur?: () => void;
	/** Input handler */
	oninput?: () => void;
}

/**
 * Props for internal input components that need a dynamic type
 */
export interface InputComponentProps extends BaseInputComponentProps {
	/** Input type */
	type: InputType;
}

/**
 * Props for numeric input components (number, range) - uses base props since type is fixed
 */
export interface NumericInputComponentProps extends BaseInputComponentProps {
	/** Minimum value */
	min?: number | string;
	/** Maximum value */
	max?: number | string;
	/** Step value */
	step?: number | string;
}

/**
 * Props for number input component
 */
export interface NumberInputComponentProps extends BaseInputComponentProps {
	/** Minimum value */
	min?: number | string;
	/** Maximum value */
	max?: number | string;
	/** Step value */
	step?: number | string;
}

/**
 * Props for text input component (text, email, tel, url, search, date, etc.)
 */
export interface TextInputComponentProps extends BaseInputComponentProps {
	/** Input type - text-like types only */
	type: TextInputType;
}

/**
 * Props for textarea input component
 */
export type TextareaInputProps = BaseInputComponentProps;

/**
 * Props for select input component
 */
export interface SelectInputProps extends BaseInputComponentProps {
	/** Options for select */
	options: SelectOption[] | string[];
}

/**
 * Props for checkbox input component (single yes/no)
 */
export interface CheckboxRadioInputProps extends BaseInputComponentProps {
	/** Value for the input (unused for single checkbox) */
	value?: string;
}

/**
 * Props for checkbox group input component
 */
export interface CheckboxGroupInputProps extends BaseInputComponentProps {
	/** Options for the checkbox group */
	options: SelectOption[] | string[];
}

/**
 * Props for radio input component
 */
export interface RadioInputProps extends BaseInputComponentProps {
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
export interface PasswordInputProps extends BaseInputComponentProps {
	/** Whether to show the password visibility toggle */
	showToggle?: boolean;
}

/**
 * Props for toggle input component
 */
export interface ToggleInputProps extends BaseInputComponentProps {
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
export interface ToggleOptionsInputProps extends BaseInputComponentProps {
	/** Options to display as toggle buttons */
	options: ToggleOption[] | string[];
	/** Allow multiple selections */
	multiple?: boolean;
}
