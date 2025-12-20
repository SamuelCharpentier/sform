import { getContext, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import type { FieldState, SformContext, VisibilityMode } from './types.js';

const SFORM_CONTEXT_KEY = Symbol('sform-context');

export function createSformContext(
	getForm: () => SformContext['form'],
	getVisibility: () => VisibilityMode
): SformContext {
	const touched = new SvelteSet<string>();
	const dirty = new SvelteSet<string>();
	let submitted = $state(false);

	const context: SformContext = {
		get form() {
			return getForm();
		},
		get visibility() {
			return getVisibility();
		},
		get submitted() {
			return submitted;
		},
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
		shouldDisplayIssues: (name: string, fieldVisibility?: VisibilityMode) => {
			const effectiveVisibility = fieldVisibility ?? getVisibility();

			switch (effectiveVisibility) {
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
			// Get all field names from the form and mark them as touched and dirty
			const form = getForm();
			const fieldNames = Object.keys(form.fields).filter(
				(key) => !['value', 'set', 'allIssues'].includes(key)
			);
			for (const name of fieldNames) {
				touched.add(name);
				dirty.add(name);
			}
		},
		resetFieldStates: () => {
			touched.clear();
			dirty.clear();
			submitted = false;
		}
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
