import { getContext, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import type {
	ButtonState,
	FieldState,
	RemoteFormIssue,
	SformLifecycleEvent,
	SformLifecycleHook,
	SformLifecycleHooks,
	SformContext,
	ValidateOn
} from './types.js';

const SFORM_CONTEXT_KEY = Symbol('sform-context');

interface FormLike {
	pending?: number;
	result?: unknown;
	fields: {
		allIssues?: () => RemoteFormIssue[] | undefined;
		// Allow other properties from RemoteFormFields
		[key: string]: unknown;
	};
}

export function createSformContext(
	getValidateOn: () => ValidateOn,
	getFieldNames: () => string[],
	triggerValidation: () => void | Promise<void>,
	submitForm: () => void,
	getForm: () => FormLike
): SformContext {
	const touched = new SvelteSet<string>();
	const dirty = new SvelteSet<string>();
	const registeredFields = new SvelteSet<string>();
	const fieldsWithIssueDisplay = new SvelteSet<string>();
	const lifecycleHooks: Record<SformLifecycleEvent, SvelteSet<SformLifecycleHook>> = {
		beforeSubmit: new SvelteSet<SformLifecycleHook>(),
		afterSubmitTriggered: new SvelteSet<SformLifecycleHook>(),
		afterSubmitResponse: new SvelteSet<SformLifecycleHook>(),
		beforeValidate: new SvelteSet<SformLifecycleHook>(),
		afterValidateCalled: new SvelteSet<SformLifecycleHook>(),
		afterValidateSettled: new SvelteSet<SformLifecycleHook>()
	};
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
		registerFieldWithIssueDisplay: (name: string) => {
			fieldsWithIssueDisplay.add(name);
		},
		registerLifecycleHooks: (hooks: SformLifecycleHooks) => {
			const registrations: Array<[SformLifecycleEvent, SformLifecycleHook]> = [];

			for (const event of Object.keys(lifecycleHooks) as SformLifecycleEvent[]) {
				const hook = hooks[event];
				if (!hook) continue;

				lifecycleHooks[event].add(hook);
				registrations.push([event, hook]);
			}

			return () => {
				for (const [event, hook] of registrations) {
					lifecycleHooks[event].delete(hook);
				}
			};
		},
		runLifecycleHooks: async (event: SformLifecycleEvent) => {
			for (const hook of [...lifecycleHooks[event]]) {
				await hook();
			}
		},
		resetFieldStates: () => {
			touched.clear();
			dirty.clear();
			submitted = false;
		},
		submitForm,
		getFormState: <T = unknown>(): ButtonState<T> => {
			const form = getForm();
			const pending = (form.pending ?? 0) !== 0;
			const hasResult = form.result !== undefined;
			const issues = form.fields.allIssues?.() ?? [];
			const hasIssues = issues.length > 0;

			if (pending) {
				return {
					state: 'pending',
					pending: true,
					success: false,
					hasIssues: false,
					result: undefined
				};
			}
			if (hasResult) {
				// If there's a result, it's success (issues come via invalid() which throws, no result)
				return {
					state: 'success',
					pending: false,
					success: true,
					hasIssues: false,
					result: form.result as T
				};
			}
			if (hasIssues) {
				return {
					state: 'hasIssues',
					pending: false,
					success: false,
					hasIssues: true,
					result: undefined
				};
			}
			return {
				state: 'default',
				pending: false,
				success: false,
				hasIssues: false,
				result: undefined
			};
		},
		getUnhandledIssues: (): RemoteFormIssue[] => {
			const form = getForm();
			const allIssues = form.fields.allIssues?.() ?? [];
			// Filter out issues that are linked to fields with issue display
			return allIssues.filter((issue) => {
				// If issue has no path, it's a form-level issue (from invalid("message"))
				if (!issue.path || issue.path.length === 0) {
					return true;
				}
				// Check if the first path segment is a field that displays issues
				const fieldName = String(issue.path[0]);
				return !fieldsWithIssueDisplay.has(fieldName);
			});
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
