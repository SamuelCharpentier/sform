import { describe, expect, it } from 'vitest';
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

function createContext(overrides: Partial<LocalFieldContext> = {}) {
	const value: Record<string, unknown> = {};
	let issues: Record<string, LocalIssue[]> = {};
	const touched: Record<string, boolean> = {};
	const dirty: Record<string, boolean> = {};

	const context: LocalFieldContext = {
		get: () => value,
		set: (path, next) => deepSet(value, path, next),
		getIssues: () => issues,
		getTouched: () => touched,
		getDirty: () => dirty,
		resolveName: (path) => {
			const base = String(path[0]);
			if (base === 'email') return 'EMAIL';
			if (base === 'first_name') return 'FNAME';
			return base;
		},
		encodeTypes: false,
		arraySuffix: false,
		...overrides
	};

	return {
		context,
		setValue: (path: (string | number)[], next: unknown) => deepSet(value, path, next),
		setIssues: (next: LocalIssue[]) => {
			issues = flattenIssues(next);
		}
	};
}

describe('deepSet/deepGet', () => {
	it('round-trips nested arrays', () => {
		const object: Record<string, unknown> = {};
		deepSet(object, ['address', 'city'], 'Montreal');
		deepSet(object, ['groups', 0], 'news');

		expect(deepGet(object, ['address', 'city'])).toBe('Montreal');
		expect(deepGet(object, ['groups', 0])).toBe('news');
	});

	it('rejects prototype pollution keys', () => {
		expect(() => deepSet({}, ['__proto__', 'polluted'], true)).toThrow();
	});
});

describe('buildPathString', () => {
	it('formats nested and indexed paths', () => {
		expect(buildPathString(['email'])).toBe('email');
		expect(buildPathString(['address', 'city'])).toBe('address.city');
		expect(buildPathString(['groups', 0])).toBe('groups[0]');
	});
});

describe('normalizeIssue/flattenIssues', () => {
	it('normalizes paths and flattens prefixes', () => {
		const issue = normalizeIssue({ message: 'bad', path: ['address', 'city'] });
		expect(issue.name).toBe('address.city');

		const flat = flattenIssues([issue]);
		expect(flat.$.length).toBe(1);
		expect(flat.address.length).toBe(1);
		expect(flat['address.city'].length).toBe(1);
	});
});

describe('createFieldProxy', () => {
	it('uses provider-facing names from the context', () => {
		const { context } = createContext();
		const fields = createFieldProxy(context) as Record<
			string,
			{ as: (type: string, value?: unknown) => Record<string, unknown> }
		>;

		const email = fields.email.as('email');
		expect(email.name).toBe('EMAIL');
		expect(email.type).toBe('email');

		const first = fields.first_name.as('text');
		expect(first.name).toBe('FNAME');
		expect(first.type).toBeUndefined();
	});

	it('collapses indexed array paths onto the provider name', () => {
		const { context } = createContext();
		const fields = createFieldProxy(context) as Record<
			string,
			Record<number, { as: (type: string, value?: unknown) => Record<string, unknown> }>
		>;

		const hidden = fields.groups[0].as('hidden', 'news');
		expect(hidden.name).toBe('groups');
		expect(hidden.value).toBe('news');
	});

	it('reads and writes values', () => {
		const { context, setValue } = createContext();
		const fields = createFieldProxy(context) as Record<
			string,
			{ value: () => unknown; set: (v: unknown) => void }
		>;

		setValue(['first_name'], 'Ada');
		expect(fields.first_name.value()).toBe('Ada');

		fields.first_name.set('Grace');
		expect(deepGet(context.get(), ['first_name'])).toBe('Grace');
	});

	it('exposes checkbox group checked state', () => {
		const { context, setValue } = createContext();
		setValue(['groups'], ['news']);

		const fields = createFieldProxy(context) as Record<
			string,
			{ as: (type: string, value?: unknown) => Record<string, unknown> }
		>;

		const news = fields.groups.as('checkbox', 'news');
		expect(news.checked).toBe(true);

		const updates = fields.groups.as('checkbox', 'updates');
		expect(updates.checked).toBe(false);
	});

	it('surfaces issues and aria-invalid', () => {
		const { context, setIssues } = createContext();
		setIssues([{ name: 'email', path: ['email'], message: 'Enter a valid email' }]);

		const fields = createFieldProxy(context) as Record<
			string,
			{
				issues: () => Array<{ message: string }> | undefined;
				as: (type: string) => Record<string, unknown>;
			}
		>;

		expect(fields.email.issues()?.[0].message).toBe('Enter a valid email');
		expect(fields.email.as('email')['aria-invalid']).toBe('true');
	});

	it('returns all issues from allIssues()', () => {
		const { context, setIssues } = createContext();
		setIssues([
			{ name: 'email', path: ['email'], message: 'bad email' },
			{ name: 'first_name', path: ['first_name'], message: 'bad name' }
		]);

		const fields = createFieldProxy(context) as unknown as {
			allIssues: () => Array<{ message: string }>;
		};

		expect(fields.allIssues().map((issue) => issue.message)).toEqual(['bad email', 'bad name']);
	});
});
