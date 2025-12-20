export default function (wallaby) {
	process.env.VITEST_CONFIG = './vitest.config.wallaby.ts';

	return {
		autoDetect: ['vitest'],

		// Specify test files (only server/node tests)
		tests: ['src/**/*.{test,spec}.{js,ts}', '!src/**/*.svelte.{test,spec}.{js,ts}'],

		// Specify source files
		files: [
			'src/**/*.{js,ts,svelte}',
			'!src/**/*.{test,spec}.{js,ts}',
			'!src/**/*.svelte.{test,spec}.{js,ts}',
			'vitest.config.wallaby.ts'
		],

		env: {
			type: 'node'
		}
	};
}
