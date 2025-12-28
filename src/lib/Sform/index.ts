// Main components
export { default as Sform } from './Sform.svelte';
export { default as Sfield } from './Sfield.svelte';

// Standalone components (not routed through Sfield)
export { default as Sbutton } from './inputs/ButtonInput.svelte';
export { default as SIssues } from './SIssues.svelte';
export { default as SResult } from './SResult.svelte';

// Utilities
export {
	applyMask,
	unmask,
	MASK_PATTERNS,
	DEFAULT_TOKENS,
	type MaskOptions,
	type MaskResult,
	type MaskToken,
	type MaskPattern
} from './utils/mask.js';

// Types
export type {
	// Sform-specific types
	ValidateOn,
	FieldState,
	SfieldClasses,
	InputType,
	SelectOption,
	SformContext,
	SformProps,
	ButtonState,
	ButtonFormState,
	ButtonInputProps,
	SIssuesProps,
	InputAffixProps,
	RangeInputProps,
	ToggleInputProps,
	ToggleOption,
	ToggleOptionsInputProps,
	// Type-safe field types
	SfieldTypeMap,
	AllowedSfieldType,
	TypedSfieldProps,
	SfieldBaseProps,
	TypedBaseSfieldProps,
	// Individual Sfield type props (for extending)
	SfieldTextProps,
	SfieldPasswordProps,
	SfieldNumberProps,
	SfieldTextareaProps,
	SfieldSelectProps,
	SfieldCheckboxProps,
	SfieldCheckboxGroupProps,
	SfieldRadioProps,
	SfieldRangeProps,
	SfieldToggleProps,
	SfieldToggleOptionsProps,
	SfieldMaskedProps,
	// Re-exported SvelteKit remote form types
	RemoteForm,
	RemoteFormField,
	RemoteFormFields,
	RemoteFormFieldValue,
	RemoteFormInput,
	RemoteFormIssue
} from './types.js';
