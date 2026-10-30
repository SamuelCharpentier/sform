/* eslint-disable svelte/prefer-svelte-reactivity -- internal lookup tables are not reactive state */
import { tick } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { RemoteFormFields, RemoteFormInput } from '../types.js';
import type { LocalForm, LocalFormOptions } from './types.js';
import {
	buildPathString,
	createFieldProxy,
	deepGet,
	deepSet,
	flattenIssues,
	normalizeIssue,
	type LocalFieldContext,
	type LocalIssue
} from './field-proxy.js';
import { getWireName } from './naming.js';

interface ParsedName {
	path: (string | number)[];
	base: string;
	hasIndex: boolean;
	isArrayHint: boolean;
	typePrefix: string;
}

interface DomInfo {
	types: Map<string, string>;
	values: Map<string, string>;
	arrayNames: Set<string>;
}

function stripArraySuffix(name: string): string {
	let value = name;
	if (value.startsWith('n:') || value.startsWith('b:')) value = value.slice(2);
	if (value.endsWith('[]')) value = value.slice(0, -2);
	const match = value.match(/^(.*?)\[\d+\]$/);
	return match ? match[1] : value;
}

function coerceValue(
	value: FormDataEntryValue | undefined,
	type: string | undefined,
	prefix: string
): unknown {
	if (value === undefined) return undefined;
	if (typeof value !== 'string') return value;

	if (type === 'number' || type === 'range' || prefix === 'n:') {
		if (value === '') return undefined;
		const parsed = parseFloat(value);
		return Number.isNaN(parsed) ? value : parsed;
	}

	if (prefix === 'b:') return value === 'on';

	return value;
}

function coerceCheckbox(value: FormDataEntryValue | undefined): unknown {
	if (value === undefined) return undefined;
	if (typeof value !== 'string') return value;
	if (value === 'on' || value === 'true' || value === '1') return true;
	if (value === 'false') return false;
	return value;
}

function isBooleanCheckboxValue(value: string | undefined): boolean {
	return (
		value === undefined || value === 'on' || value === 'true' || value === 'false' || value === '1'
	);
}

/**
 * Create a schema-driven form instance that has no remote-function dependency.
 * The returned object is spread onto a `<form>` element by `<SformLocal>` and
 * exposes the same field proxy contract as a SvelteKit remote form, so the
 * existing `Sfield` components work unchanged.
 */
export function createForm<
	Schema extends StandardSchemaV1<RemoteFormInput, Record<string, unknown>>,
	Output = unknown
>(
	schema: Schema,
	options: LocalFormOptions<StandardSchemaV1.InferInput<Schema>, Output> = {}
): LocalForm<StandardSchemaV1.InferInput<Schema>, Output> {
	type Input = StandardSchemaV1.InferInput<Schema>;

	const method = options.method ?? 'POST';
	const action = options.action ?? '';
	const enctype = options.enctype;
	const encodeTypes = options.encodeTypes ?? false;
	const arraySuffix = options.arraySuffix ?? false;
	const hiddenFields = options.hidden ?? {};
	const ignoredNames = new Set(Object.keys(hiddenFields));

	let activeSchema: StandardSchemaV1<Input, unknown> = schema as StandardSchemaV1<Input, unknown>;

	let entries: Record<string, unknown> = {};
	let wireFor = new Map<string, string>();
	let reverse = new Map<string, string>();

	function rebuildNames(): void {
		const nextEntries = ((activeSchema as unknown as { entries?: Record<string, unknown> })
			.entries ?? {}) as Record<string, unknown>;

		entries = nextEntries;
		wireFor = new Map();
		reverse = new Map();

		for (const key of Object.keys(nextEntries)) {
			const wire = options.names?.[key] ?? getWireName(nextEntries[key]) ?? key;
			wireFor.set(key, wire);
			reverse.set(wire, key);
		}

		for (const [key, wire] of Object.entries(options.names ?? {})) {
			if (!wire) continue;
			wireFor.set(key, wire);
			reverse.set(wire, key);
		}
	}

	rebuildNames();

	let input = $state<Record<string, unknown>>({});
	let rawIssues = $state.raw<LocalIssue[]>([]);
	const issues = $derived(flattenIssues(rawIssues));

	let result = $state.raw<Output | undefined>(undefined);
	let error = $state.raw<unknown>(undefined);
	let pending = $state(0);
	let submitted = $state(false);
	let touched = $state<Record<string, boolean>>({});
	let dirty = $state<Record<string, boolean>>({});

	let element: HTMLFormElement | null = null;
	let enhanceCallback: ((options: unknown) => unknown) | undefined;
	let disabledSource: (() => boolean) | undefined;
	let passthrough = false;

	function resolveName(path: (string | number)[]): string {
		const schemaBase = String(path[0] ?? '');
		const wireBase = wireFor.get(schemaBase) ?? schemaBase;
		const rest = path.slice(1).filter((segment): segment is string => typeof segment === 'string');

		return rest.length ? `${wireBase}.${rest.join('.')}` : wireBase;
	}

	function fieldNameForIssue(name: string): string {
		const base = stripArraySuffix(name).split('.')[0];
		return reverse.get(base) ?? base;
	}

	function parseName(raw: string): ParsedName {
		let name = raw;
		let typePrefix = '';

		if (name.startsWith('n:') || name.startsWith('b:')) {
			typePrefix = name.slice(0, 2);
			name = name.slice(2);
		}

		let isArrayHint = false;
		if (name.endsWith('[]')) {
			isArrayHint = true;
			name = name.slice(0, -2);
		}

		let hasIndex = false;
		let index: number | undefined;
		const indexMatch = name.match(/^(.*?)\[(\d+)\]$/);
		if (indexMatch) {
			name = indexMatch[1];
			index = parseInt(indexMatch[2], 10);
			hasIndex = true;
		}

		const segments = name.split('.').filter(Boolean);
		const first = segments.shift() ?? name;
		const schemaBase = reverse.get(first) ?? first;
		const path: (string | number)[] = [schemaBase, ...segments];

		if (index !== undefined) path.push(index);

		return { path, base: first, hasIndex, isArrayHint, typePrefix };
	}

	function collectDomInfo(form: HTMLFormElement): DomInfo {
		const types = new Map<string, string>();
		const values = new Map<string, string>();
		const counts = new Map<string, number>();

		for (const node of Array.from(form.elements)) {
			const control = node as HTMLInputElement;
			const name = control.name;
			if (!name) continue;

			const base = stripArraySuffix(name);
			counts.set(base, (counts.get(base) ?? 0) + 1);
			types.set(base, control.type);
			values.set(base, control.value);
		}

		const arrayNames = new Set<string>();
		for (const [base, count] of counts) {
			if (count > 1 && types.get(base) === 'checkbox') arrayNames.add(base);
		}

		return { types, values, arrayNames };
	}

	function convert(formData: FormData, form: HTMLFormElement): Input {
		const dom = collectDomInfo(form);
		const data: Record<string, unknown> = {};
		const seen = new Set<string>();

		for (const key of formData.keys()) {
			if (seen.has(key)) continue;
			seen.add(key);

			if (ignoredNames.has(key)) continue;

			const parsed = parseName(key);
			const values = formData.getAll(key);
			const type = dom.types.get(parsed.base);
			const isArray =
				!parsed.hasIndex &&
				(parsed.isArrayHint || dom.arrayNames.has(parsed.base) || values.length > 1);

			let value: unknown;

			if (parsed.hasIndex) {
				value = coerceValue(values[0], type, parsed.typePrefix);
			} else if (isArray) {
				value = values.map((entry) => coerceValue(entry, type, parsed.typePrefix));
			} else if (type === 'checkbox') {
				value = coerceCheckbox(values[0]);
			} else if (type === 'file') {
				value = values;
			} else {
				value = coerceValue(values[0], type, parsed.typePrefix);
			}

			deepSet(data, parsed.path, value);
		}

		for (const base of dom.arrayNames) {
			const parsed = parseName(base);
			if (deepGet(data, parsed.path) === undefined) {
				deepSet(data, parsed.path, []);
			}
		}

		for (const [base, type] of dom.types) {
			if (type !== 'checkbox' || dom.arrayNames.has(base)) continue;
			if (!isBooleanCheckboxValue(dom.values.get(base))) continue;

			const parsed = parseName(base);
			if (deepGet(data, parsed.path) === undefined) {
				deepSet(data, parsed.path, false);
			}
		}

		return data as Input;
	}

	function elementsFor(form: HTMLFormElement, name: string): HTMLInputElement[] {
		return Array.from(form.elements).filter(
			(node) => (node as HTMLInputElement).name === name
		) as HTMLInputElement[];
	}

	const context: LocalFieldContext = {
		get: () => input,
		set: (path, value) => {
			if (path.length === 0) {
				input = value as Record<string, unknown>;
				return;
			}

			deepSet(input, path, value);
			const key = buildPathString(path);
			touched[key] = true;
			dirty[key] = true;
		},
		getIssues: () => issues,
		getTouched: () => touched,
		getDirty: () => dirty,
		resolveName,
		encodeTypes,
		arraySuffix
	};

	const fields = createFieldProxy(context) as unknown as RemoteFormFields<Input>;

	async function runValidation(form: HTMLFormElement, formData: FormData): Promise<boolean> {
		const data = convert(formData, form);

		const validated = await activeSchema['~standard'].validate(data);

		if (validated.issues) {
			rawIssues = validated.issues.map((issue) => normalizeIssue(issue));
			return false;
		}

		rawIssues = [];
		return true;
	}

	function requestNative(form: HTMLFormElement, submitter?: HTMLElement | null): void {
		passthrough = true;

		try {
			if (typeof form.requestSubmit === 'function') {
				form.requestSubmit(submitter ?? undefined);
			} else {
				form.submit();
			}
		} catch {
			form.submit();
		} finally {
			// `requestSubmit` consumes the flag synchronously. Reset it in case the
			// fallback (`form.submit()`) did not dispatch a submit event at all.
			queueMicrotask(() => {
				passthrough = false;
			});
		}
	}

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		if (passthrough) {
			passthrough = false;
			return;
		}

		if (event.defaultPrevented) return;

		const form = event.target as HTMLFormElement;

		if (disabledSource?.()) {
			event.preventDefault();
			event.stopImmediatePropagation();
			return;
		}

		event.preventDefault();

		const formData = new FormData(form, event.submitter as HTMLElement | undefined);
		const handler = enhanceCallback ?? options.onSubmit;

		submitted = true;
		pending++;

		try {
			const valid = await runValidation(form, formData);
			if (!valid) return;

			if (!handler) {
				requestNative(form, event.submitter as HTMLElement | undefined);
				return;
			}

			const data = convert(formData, form);
			const output = await handler({
				form,
				data,
				submit: async () => requestNative(form)
			});

			if (output !== undefined) {
				result = output as Output;
				error = undefined;
				options.onSuccess?.(output as Output);
			}
		} catch (caught) {
			error = caught;
			options.onError?.(caught);
		} finally {
			pending--;
		}
	}

	function handleInput(event: Event): void {
		if (disabledSource?.()) return;

		const form = element;
		const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
		if (!form || !target || !target.name) return;

		const parsed = parseName(target.name);
		const type = (target as HTMLInputElement).type;
		let value: unknown;

		if (parsed.hasIndex) {
			value = coerceValue((target as HTMLInputElement).value, type, parsed.typePrefix);
		} else if (type === 'checkbox' && elementsFor(form, target.name).length > 1) {
			value = elementsFor(form, target.name)
				.filter((control) => control.checked)
				.map((control) => coerceValue(control.value, control.type, parsed.typePrefix));
		} else if (type === 'checkbox') {
			const control = target as HTMLInputElement;
			value = control.checked ? coerceCheckbox(control.value) : false;
		} else if (type === 'file') {
			const files = (target as HTMLInputElement).files;
			value = files ? Array.from(files) : [];
		} else if (type === 'select-multiple') {
			value = Array.from((target as HTMLSelectElement).selectedOptions).map(
				(option) => option.value
			);
		} else {
			value = coerceValue((target as HTMLInputElement).value, type, parsed.typePrefix);
		}

		deepSet(input, parsed.path, value);
		dirty[buildPathString(parsed.path)] = true;
	}

	function handleFocusOut(event: Event): void {
		const target = event.target as HTMLInputElement;
		if (!target?.name || !element) return;

		const parsed = parseName(target.name);
		const key = buildPathString(parsed.path);
		touched[key] = true;
	}

	async function handleReset(): Promise<void> {
		const form = element;
		if (!form) return;

		await tick();

		input = convert(new FormData(form), form) as Record<string, unknown>;
		rawIssues = [];
		touched = {};
		dirty = {};
		submitted = false;
	}

	function attach(form: HTMLFormElement): () => void {
		element = form;
		touched = {};
		dirty = {};
		input = convert(new FormData(form), form) as Record<string, unknown>;

		form.addEventListener('submit', handleSubmit as unknown as EventListener);
		form.addEventListener('input', handleInput);
		form.addEventListener('focusout', handleFocusOut);
		form.addEventListener('reset', handleReset as EventListener);

		return () => {
			form.removeEventListener('submit', handleSubmit as unknown as EventListener);
			form.removeEventListener('input', handleInput);
			form.removeEventListener('focusout', handleFocusOut);
			form.removeEventListener('reset', handleReset as EventListener);
			element = null;
		};
	}

	async function validate(): Promise<void> {
		await tick();

		const form = element;
		if (!form || disabledSource?.()) return;

		await runValidation(form, new FormData(form));
	}

	async function submit(): Promise<boolean> {
		const form = element;
		if (!form || disabledSource?.()) return false;

		const formData = new FormData(form);
		const handler = enhanceCallback ?? options.onSubmit;

		submitted = true;

		const valid = await runValidation(form, formData);
		if (!valid) return false;

		if (!handler) {
			requestNative(form);
			return true;
		}

		pending++;

		try {
			const data = convert(formData, form);
			const output = await handler({
				form,
				data,
				submit: async () => requestNative(form)
			});

			if (output !== undefined) {
				result = output as Output;
				error = undefined;
				options.onSuccess?.(output as Output);
			}

			return true;
		} catch (caught) {
			error = caught;
			options.onError?.(caught);
			return false;
		} finally {
			pending--;
		}
	}

	const instance: Record<string, unknown> = { method, action, enctype };
	const localForm: LocalForm<Input, Output> = instance as unknown as LocalForm<Input, Output>;

	Object.defineProperties(instance, {
		schema: { get: () => activeSchema },
		fieldNames: { get: () => Object.keys(entries) },
		element: { get: () => element },
		fields: { get: () => fields },
		pending: { get: () => pending },
		result: { get: () => result },
		error: { get: () => error },
		submitted: { get: () => submitted },
		hiddenFields: { get: () => hiddenFields },
		disabled: { get: () => disabledSource?.() ?? false },
		fieldNameForIssue: { value: fieldNameForIssue },
		preflight: {
			value: (next: StandardSchemaV1<Input, unknown>) => {
				activeSchema = next;
				rebuildNames();
				return localForm;
			}
		},
		validate: { value: () => validate() },
		enhance: {
			value: (callback: (options: unknown) => unknown) => {
				enhanceCallback = callback;
				return localForm;
			}
		},
		submit: { value: () => submit() },
		setDisabledSource: {
			value: (source: () => boolean) => {
				disabledSource = source;
			}
		}
	});

	(instance as unknown as Record<symbol, unknown>)[createAttachmentKey()] = attach;

	return localForm;
}
