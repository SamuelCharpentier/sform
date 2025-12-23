import { getContext, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import type { FieldState, SformContext, ValidateOn } from './types.js';

const SFORM_CONTEXT_KEY = Symbol('sform-context');

export function createSformContext(
	getValidateOn: () => ValidateOn,
	getFieldNames: () => string[],
	triggerValidation: () => void,
	submitForm: () => void
): SformContext {
	const touched = new SvelteSet<string>();
	const dirty = new SvelteSet<string>();
	const registeredFields = new SvelteSet<string>();
	let submitted = $state(false);

	const context: SformContext = {
		get validateOn() {
			return getValidateOn();
		},
		get submitted() {
			return submitted;
		},
		triggerValidation,
		getFieldState: (name: string): FieldState => ({
			touched: touched.has(name),
			dirty: dirty.has(name)
		}),
		markTouched: (name: string) => {
			touched.add(name);
		},
		markDirty: (name: string) => {
			dirty.add(name);
		},
		shouldDisplayIssues: (name: string, fieldValidateOn?: ValidateOn) => {
			const effectiveValidateOn = fieldValidateOn ?? getValidateOn();

			switch (effectiveValidateOn) {
				case 'blur':
					return touched.has(name);
				case 'change':
					return dirty.has(name);
				case 'submit':
					return submitted;
				default:
					return false;
			}
		},
		markSubmitted: () => {
			submitted = true;
		},
		markAllFieldsDirty: () => {
			// Use registered fields from Sfield components
			const fieldNames = [...registeredFields];
			for (const name of fieldNames) {
				touched.add(name);
				dirty.add(name);
			}
		},
		registerField: (name: string) => {
			registeredFields.add(name);
		},
		resetFieldStates: () => {
			touched.clear();
			dirty.clear();
			submitted = false;
		},
		submitForm
	};

	setContext(SFORM_CONTEXT_KEY, context);
	return context;
}

export function getSformContext(): SformContext {
	const context = getContext<SformContext | undefined>(SFORM_CONTEXT_KEY);
	if (!context) {
		throw new Error('Sfield must be used within an Sform component');
	}
	return context;
}
