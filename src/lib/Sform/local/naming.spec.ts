import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import { getWireName, readMetadata, wireName } from './naming.js';

describe('wireName metadata', () => {
	it('is readable from a pipe', () => {
		const schema = v.pipe(v.string(), wireName('EMAIL'), v.email());
		expect(getWireName(schema)).toBe('EMAIL');
	});

	it('is readable through an optional wrapper', () => {
		const schema = v.optional(v.pipe(v.string(), wireName('LNAME')), '');
		expect(getWireName(schema)).toBe('LNAME');
	});

	it('is readable through a nested pipe', () => {
		const schema = v.pipe(v.pipe(v.string(), wireName('INTERESTS')), v.minLength(1));
		expect(getWireName(schema)).toBe('INTERESTS');
	});

	it('returns an empty object when no metadata exists', () => {
		expect(readMetadata(v.string())).toEqual({});
	});
});
