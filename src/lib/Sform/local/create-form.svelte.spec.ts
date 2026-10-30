import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Component } from 'svelte';
import * as v from 'valibot';
import { createForm } from './create-form.svelte.js';
import { wireName } from './naming.js';
import LocalTestWrapper from './LocalTestWrapper.test.svelte';

const schema = v.object({
	email: v.pipe(
		v.string(),
		wireName('EMAIL'),
		v.nonEmpty('Email is required'),
		v.email('Enter a valid email address')
	),
	first_name: v.pipe(v.string(), wireName('FNAME'), v.nonEmpty('First name is required'))
});

function renderLocal(props: Record<string, unknown>) {
	return render(LocalTestWrapper as unknown as Component<Record<string, unknown>>, { props });
}

function setInput(selector: string, value: string) {
	const input = document.querySelector(selector) as HTMLInputElement;
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
}

function submit() {
	const form = document.querySelector('form') as HTMLFormElement;
	const event = new SubmitEvent('submit', { bubbles: true, cancelable: true });
	form.dispatchEvent(event);
	return { form, event };
}

describe('createForm / SformLocal', () => {
	it('exposes the provider action and mapped field names', async () => {
		const localForm = createForm(schema, {
			action: 'https://provider.example/subscribe',
			hidden: { u: 'demo-list' }
		});

		renderLocal({ form: localForm });

		expect(localForm.method).toBe('POST');
		expect(localForm.action).toBe('https://provider.example/subscribe');
		expect(localForm.fieldNames).toEqual(['email', 'first_name']);

		expect(document.querySelector('input[name="EMAIL"]')).toBeTruthy();
		expect(document.querySelector('input[name="FNAME"]')).toBeTruthy();
		expect(document.querySelector('input[type="hidden"][name="u"]')).toBeTruthy();

		const form = document.querySelector('form') as HTMLFormElement;
		expect(form.getAttribute('action')).toBe('https://provider.example/subscribe');
		expect(form.getAttribute('method')).toBe('POST');
	});

	it('lets an explicit names map override schema metadata', async () => {
		const localForm = createForm(schema, {
			action: 'https://provider.example/subscribe',
			names: { email: 'EMAIL_ADDRESS' }
		});

		renderLocal({ form: localForm });

		expect(document.querySelector('input[name="EMAIL_ADDRESS"]')).toBeTruthy();
		expect(document.querySelector('input[name="EMAIL"]')).toBeNull();
	});

	it('populates issues from the rendered form data', async () => {
		const localForm = createForm(schema, { action: 'https://provider.example/subscribe' });
		renderLocal({ form: localForm });

		setInput('input[name="EMAIL"]', 'not-an-email');
		setInput('input[name="FNAME"]', 'Ada');

		await localForm.validate();

		const messages = localForm.fields.email.issues()?.map((issue) => issue.message);
		expect(messages).toContain('Enter a valid email address');
	});

	it('blocks an invalid native submit and shows issues', async () => {
		const localForm = createForm(schema, { action: 'https://provider.example/subscribe' });
		renderLocal({ form: localForm, validateOn: 'submit' });

		const form = document.querySelector('form') as HTMLFormElement;
		const requestSubmit = vi.fn();
		(form as unknown as { requestSubmit: () => void }).requestSubmit = requestSubmit;

		setInput('input[name="EMAIL"]', 'not-an-email');

		const { event } = submit();

		expect(event.defaultPrevented).toBe(true);

		await vi.waitFor(() => {
			expect(localForm.fields.email.issues()?.length).toBeGreaterThan(0);
		});

		expect(document.body.textContent).toContain('Enter a valid email address');
		expect(requestSubmit).not.toHaveBeenCalled();
	});

	it('passes converted data to onSubmit and stores the result', async () => {
		const onSubmit = vi.fn(({ data }: { data: Record<string, unknown> }) => {
			return { success: true, email: data.email };
		});

		const localForm = createForm(schema, {
			action: 'https://provider.example/subscribe',
			onSubmit
		});

		renderLocal({ form: localForm });

		const form = document.querySelector('form') as HTMLFormElement;
		const requestSubmit = vi.fn();
		(form as unknown as { requestSubmit: () => void }).requestSubmit = requestSubmit;

		setInput('input[name="EMAIL"]', 'ada@example.com');
		setInput('input[name="FNAME"]', 'Ada');

		const { event } = submit();

		expect(event.defaultPrevented).toBe(true);

		await vi.waitFor(() => {
			expect(onSubmit).toHaveBeenCalledTimes(1);
		});

		expect(onSubmit.mock.calls[0][0].data).toMatchObject({
			email: 'ada@example.com',
			first_name: 'Ada'
		});
		expect(localForm.result).toEqual({ success: true, email: 'ada@example.com' });
		expect(requestSubmit).not.toHaveBeenCalled();
	});

	it('falls back to a real native submission when valid and no handler exists', async () => {
		const localForm = createForm(schema, { action: 'https://provider.example/subscribe' });
		renderLocal({ form: localForm });

		const form = document.querySelector('form') as HTMLFormElement;
		const requestSubmit = vi.fn();
		(form as unknown as { requestSubmit: () => void }).requestSubmit = requestSubmit;

		setInput('input[name="EMAIL"]', 'ada@example.com');
		setInput('input[name="FNAME"]', 'Ada');

		submit();

		await vi.waitFor(() => {
			expect(requestSubmit).toHaveBeenCalledTimes(1);
		});

		expect(localForm.fields.allIssues()).toBeUndefined();
	});
});
