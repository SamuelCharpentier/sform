import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import * as v from 'valibot';
import { createForm } from './create-form.svelte.js';
import { wireName } from './naming.js';
import LocalTestWrapper from './LocalTestWrapper.test.svelte';

const schema = v.object({
	email: v.pipe(v.string(), wireName('EMAIL'), v.nonEmpty('Email is required')),
	first_name: v.pipe(v.string(), wireName('FNAME'), v.nonEmpty('First name is required'))
});

describe('local mode server markup', () => {
	it('renders a native form without novalidate so no-JS submissions work', () => {
		const localForm = createForm(schema, {
			action: 'https://provider.example/subscribe',
			hidden: { u: 'demo-list' }
		});

		const { body } = render(LocalTestWrapper, { props: { form: localForm } });

		expect(body).toContain('action="https://provider.example/subscribe"');
		expect(body).toContain('method="POST"');
		expect(body).toContain('name="EMAIL"');
		expect(body).toContain('name="FNAME"');
		expect(body).toContain('name="u"');
		expect(body).not.toContain('novalidate');
	});
});
