/**
 * Tests for library exports
 */

import { describe, it, expect } from 'vitest';
import { Sform, Sfield, Sbutton, SIssues, SResult } from '$lib/index.js';
import { applyMask, unmask, MASK_PATTERNS, DEFAULT_TOKENS } from './utils/mask.js';

describe('Library exports', () => {
	it('should export Sform component', () => {
		expect(Sform).toBeDefined();
	});

	it('should export Sfield component', () => {
		expect(Sfield).toBeDefined();
	});

	it('should export Sbutton component', () => {
		expect(Sbutton).toBeDefined();
	});

	it('should export SIssues component', () => {
		expect(SIssues).toBeDefined();
	});

	it('should export SResult component', () => {
		expect(SResult).toBeDefined();
	});
});

describe('Mask utilities', () => {
	it('should export applyMask utility', () => {
		expect(applyMask).toBeDefined();
		expect(typeof applyMask).toBe('function');
	});

	it('should export unmask utility', () => {
		expect(unmask).toBeDefined();
		expect(typeof unmask).toBe('function');
	});

	it('should export MASK_PATTERNS', () => {
		expect(MASK_PATTERNS).toBeDefined();
		expect(MASK_PATTERNS.phone).toBeDefined();
		expect(MASK_PATTERNS.creditCard).toBeDefined();
	});

	it('should export DEFAULT_TOKENS', () => {
		expect(DEFAULT_TOKENS).toBeDefined();
		expect(DEFAULT_TOKENS['9']).toBeDefined();
	});
});
