import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const localRuntimeFiles = [
	'src/lib/local/index.ts',
	'src/lib/Sform/local/index.ts',
	'src/lib/Sform/local/SformLocal.svelte',
	'src/lib/Sform/local/create-form.svelte.ts',
	'src/lib/Sform/local/field-proxy.ts',
	'src/lib/Sform/local/naming.ts',
	'src/lib/Sform/engine.svelte.ts',
	'src/lib/Sform/context.svelte.ts'
];

describe('local mode runtime dependencies', () => {
	it('does not import SvelteKit or $app modules at runtime', () => {
		const offenders: string[] = [];

		for (const file of localRuntimeFiles) {
			const source = readFileSync(resolve(process.cwd(), file), 'utf8');

			for (const line of source.split('\n')) {
				const trimmed = line.trim();
				if (trimmed.startsWith('import type ')) continue;

				if (/from\s+['"]@sveltejs\/kit['"]/.test(trimmed) || /from\s+['"]\$app\//.test(trimmed)) {
					offenders.push(`${file}: ${trimmed}`);
				}
			}
		}

		expect(offenders).toEqual([]);
	});
});
