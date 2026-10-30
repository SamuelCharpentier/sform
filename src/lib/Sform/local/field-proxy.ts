/**
 * A local, remote-function-free counterpart to SvelteKit's form field proxy.
 *
 * The behaviour mirrors `packages/kit/src/runtime/form-utils.js` so that the
 * existing `Sfield` input components can be reused unchanged, with two
 * deliberate differences:
 *
 * - HTML `name` attributes are provider-controlled (no `/<form-id>` suffix and
 *   type prefixes are opt-in), so a native form POST reaches third-party
 *   endpoints with the names they expect.
 * - Array suffixes (`[]`) are opt-in.
 */

export interface LocalIssue {
	name: string;
	path: (string | number)[];
	message: string;
	server?: boolean;
}

export interface LocalFieldContext {
	get: () => Record<string, unknown>;
	set: (path: (string | number)[], value: unknown) => void;
	getIssues: () => Record<string, LocalIssue[]>;
	getTouched: () => Record<string, boolean>;
	getDirty: () => Record<string, boolean>;
	resolveName: (path: (string | number)[]) => string;
	encodeTypes: boolean;
	arraySuffix: boolean;
}

export type FieldAttributes = Record<string, unknown>;

const pathRegex = /^[a-zA-Z_$]\w*(\.[a-zA-Z_$]\w*|\[\d+\])*$/;

export function splitPath(path: string): string[] {
	if (!pathRegex.test(path)) {
		return path.split(/\.|\[|\]/).filter(Boolean);
	}

	return path.split(/\.|\[|\]/).filter(Boolean);
}

export function buildPathString(path: (string | number)[]): string {
	let result = '';

	for (const segment of path) {
		if (typeof segment === 'number') {
			result += `[${segment}]`;
		} else {
			result += result === '' ? segment : '.' + segment;
		}
	}

	return result;
}

function checkPrototypePollution(key: string): void {
	if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
		throw new Error(`Forbidden form field key: ${key}`);
	}
}

export function deepSet(
	object: Record<string, unknown>,
	keys: (string | number)[],
	value: unknown
): void {
	let current: Record<string, unknown> = object;

	for (let i = 0; i < keys.length - 1; i += 1) {
		const key = String(keys[i]);
		checkPrototypePollution(key);

		const isArray = typeof keys[i + 1] === 'number';
		const inner = Object.hasOwn(current, key) ? current[key] : undefined;

		if (inner === null || inner === undefined) {
			current[key] = isArray ? [] : {};
		}

		current = current[key] as Record<string, unknown>;
	}

	const finalKey = String(keys[keys.length - 1]);
	checkPrototypePollution(finalKey);
	current[finalKey] = value;
}

export function deepGet(object: unknown, path: (string | number)[]): unknown {
	let current = object;

	for (const key of path) {
		if (current === null || typeof current !== 'object' || !Object.hasOwn(current, key)) {
			return undefined;
		}

		current = (current as Record<string | number, unknown>)[key];
	}

	return current;
}

function deepClone<T>(value: T): T {
	if (value !== null && typeof value === 'object') {
		if (value instanceof Date) return new Date(value.getTime()) as T;
		if (typeof File !== 'undefined' && value instanceof File) return value;
		if (Array.isArray(value)) return value.map(deepClone) as T;

		const clone: Record<string, unknown> = {};
		for (const key of Object.keys(value as Record<string, unknown>)) {
			clone[key] = deepClone((value as Record<string, unknown>)[key]);
		}

		return clone as T;
	}

	return value;
}

export function normalizeIssue(issue: {
	message: string;
	path?: readonly (PropertyKey | { key: PropertyKey })[] | undefined;
}): LocalIssue {
	const normalized: LocalIssue = { name: '', path: [], message: issue.message };

	if (issue.path !== undefined) {
		let name = '';

		for (const segment of issue.path) {
			const key = (typeof segment === 'object' ? segment.key : segment) as string | number;

			normalized.path.push(key);

			if (typeof key === 'number') {
				name += `[${key}]`;
			} else if (typeof key === 'string') {
				name += name === '' ? key : '.' + key;
			}
		}

		normalized.name = name;
	}

	return normalized;
}

export function flattenIssues(issues: LocalIssue[]): Record<string, LocalIssue[]> {
	const result: Record<string, LocalIssue[]> = Object.create(null);

	for (const issue of issues) {
		(result.$ ??= []).push(issue);

		let name = '';

		if (issue.path !== undefined) {
			for (const key of issue.path) {
				if (typeof key === 'number') {
					name += `[${key}]`;
				} else if (typeof key === 'string') {
					name += name === '' ? key : '.' + key;
				}

				(result[name] ??= []).push(issue);
			}
		}
	}

	return result;
}

function addProps(base: FieldAttributes, props: Record<string, unknown>): FieldAttributes {
	for (const prop in props) {
		const value = props[prop];

		if (typeof value === 'function') {
			Object.defineProperty(base, prop, {
				enumerable: true,
				get: value as () => unknown
			});
		} else {
			base[prop] = value;
		}
	}

	return base;
}

function getTypePrefix(type: string, isArray: boolean, inputValue: unknown): string {
	if (!type) return '';

	if (type === 'number' || type === 'range') return 'n:';
	if (type === 'checkbox' && !isArray) return 'b:';
	if (type === 'hidden' || type === 'submit') {
		if (typeof inputValue === 'boolean') return 'b:';
		if (typeof inputValue === 'number') return 'n:';
	}
	return '';
}

function createFieldMethod(
	context: LocalFieldContext,
	path: (string | number)[],
	prop: string
): unknown {
	const key = buildPathString(path);

	switch (prop) {
		case 'set':
			return (value: unknown) => {
				context.set(path, value);
				return value;
			};

		case 'value':
			return () => deepClone(deepGet(context.get(), path));

		case 'issues':
		case 'allIssues': {
			const all = prop === 'allIssues';

			return () => {
				const issues = context.getIssues()[key === '' ? '$' : key];

				if (all) {
					return issues?.map(({ path, message }) => ({ path, message }));
				}

				const own = issues
					?.filter((issue) => issue.name === key)
					.map(({ path, message }) => ({ path, message }));
				return own?.length ? own : undefined;
			};
		}

		case 'touched':
		case 'dirty': {
			return () => {
				const object = prop === 'dirty' ? context.getDirty() : context.getTouched();

				if (Object.hasOwn(object, key)) return true;

				for (const candidate in object) {
					if (!Object.hasOwn(object, candidate)) continue;
					if (key === '') return true;
					if (!candidate.startsWith(key)) continue;

					const next = candidate[key.length];
					if (next === '.' || next === '[') return true;
				}

				return false;
			};
		}

		case 'as': {
			const read = (fallback?: unknown) => {
				const current = deepGet(context.get(), path);

				if (current !== undefined && current !== null) return current;
				if (fallback !== undefined && Object.hasOwn(context.getDirty(), key)) return undefined;

				return fallback;
			};

			return (type: string, inputValue?: unknown, checked?: boolean) => {
				const isArray =
					type === 'file multiple' ||
					type === 'select multiple' ||
					(type === 'checkbox' && typeof inputValue === 'string');

				const typePrefix = context.encodeTypes ? getTypePrefix(type, isArray, inputValue) : '';

				const resolvedName = context.resolveName(path);
				const name = typePrefix + resolvedName + (isArray && context.arraySuffix ? '[]' : '');

				const base: FieldAttributes = {
					name,
					get 'aria-invalid'() {
						const issues = context.getIssues();
						return key in issues ? 'true' : undefined;
					}
				};

				if (type !== 'text' && type !== 'select' && type !== 'select multiple') {
					base.type = type === 'file multiple' ? 'file' : type;
				}

				if (type === 'submit' || type === 'hidden') {
					return addProps(base, {
						value: typeof inputValue === 'boolean' ? (inputValue ? 'on' : 'off') : inputValue
					});
				}

				if (type === 'select' || type === 'select multiple') {
					return addProps(base, {
						multiple: isArray,
						value: () => {
							const value = read(inputValue);
							return Array.isArray(value) ? [...value] : value;
						}
					});
				}

				if (type === 'checkbox' || type === 'radio') {
					const hasOption = type === 'radio' || isArray;

					if (hasOption) {
						base.value = inputValue ?? 'on';
					} else {
						checked = inputValue as boolean | undefined;
					}

					return addProps(base, {
						defaultChecked: checked,
						checked: () => {
							const value = read();

							if (value === null || value === undefined) return read(checked);
							if (type === 'radio') return value === inputValue;
							if (isArray) {
								return Array.isArray(value)
									? value.includes(inputValue)
									: String(value).includes(String(inputValue));
							}
							return Boolean(value);
						}
					});
				}

				if (type === 'file' || type === 'file multiple') {
					return addProps(base, {
						multiple: isArray,
						files: () => {
							const value = read();
							const files = typeof File !== 'undefined' && value instanceof File ? [value] : value;

							if (!Array.isArray(files) || !files.every((file) => file instanceof File)) {
								return null;
							}

							if (typeof DataTransfer === 'undefined') {
								return Object.assign({ length: files.length }, files);
							}

							const transfer = new DataTransfer();
							for (const file of files) transfer.items.add(file);

							return transfer.files;
						}
					});
				}

				if (type === 'image') return base;

				return addProps(base, {
					defaultValue: inputValue,
					value: () => String(read(inputValue) ?? '')
				});
			};
		}

		default:
			return undefined;
	}
}

export function createFieldProxy(
	context: LocalFieldContext,
	target: unknown = {},
	path: (string | number)[] = []
): unknown {
	return new Proxy(target as object, {
		get(object, prop) {
			if (typeof prop === 'symbol') return (object as Record<symbol, unknown>)[prop];

			const next = [...path, /^\d+$/.test(prop) ? parseInt(prop, 10) : prop];

			return createFieldProxy(context, createFieldMethod(context, path, prop), next);
		}
	});
}
