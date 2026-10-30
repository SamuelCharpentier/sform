<script lang="ts" generics="Input extends import('@sveltejs/kit').RemoteFormInput, Output">
	import type { RemoteFormFields } from '@sveltejs/kit';
	import type { Snippet } from 'svelte';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import type {
		EnhanceCallback,
		RemoteFormInstance,
		SformLifecycleHooks,
		ValidateOn
	} from '../types.js';
	import { createSformEngine } from '../engine.svelte.js';
	import type { LocalForm } from './types.js';

	let {
		form,
		validateOn = 'blur',
		class: className,
		resetOnSuccess = true,
		lifecycle,
		enhance,
		children,
		disabled,
		novalidate
	}: {
		/** Local form instance created with `createForm()` */
		form: LocalForm<Input, Output>;
		/** When to validate and show issues: 'blur' (default), 'change', or 'submit' */
		validateOn?: ValidateOn;
		/** Form element class */
		class?: string;
		/** If true, reset touched/dirty/submitted state after successful submit response */
		resetOnSuccess?: boolean;
		/** Lifecycle hooks for submit/validate phases */
		lifecycle?: SformLifecycleHooks;
		/** Optional submission handler; overrides `onSubmit` from `createForm()` */
		enhance?: EnhanceCallback<Input>;
		/** If true, disables the entire form: no validation, no submission, all fields disabled */
		disabled?: boolean;
		/**
		 * `undefined` (default) keeps native constraint validation in the static
		 * markup so a no-JS submission is still guarded, then switches to schema
		 * only validation once JavaScript hydrates.
		 */
		novalidate?: boolean;
		children: Snippet<[RemoteFormFields<Input>]>;
	} = $props();

	let formElement: HTMLFormElement | undefined = $state();

	const engine = createSformEngine<Input, Output>({
		getForm: () => form as unknown as RemoteFormInstance<Input, Output>,
		getSchema: () => form.schema,
		getEnhance: () => enhance,
		getValidateOn: () => validateOn,
		getPreflightOnly: () => true,
		getResetOnSuccess: () => resetOnSuccess,
		getLifecycle: () => lifecycle,
		getDisabled: () => disabled === true,
		getFieldNames: () => form.fieldNames,
		getElement: () => formElement,
		getIssueFieldName: (name) => form.fieldNameForIssue(name)
	});

	const isDisabled = $derived(disabled === true);

	$effect(() => {
		form.setDisabledSource(() => disabled === true);
	});

	$effect(() => {
		const element = formElement;
		if (!element) return;

		if (novalidate !== undefined) {
			element.noValidate = novalidate;
			return;
		}

		element.noValidate = true;

		return () => {
			element.noValidate = false;
		};
	});
</script>

<!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
<form
	bind:this={formElement}
	{...engine.formProps as unknown as HTMLFormAttributes}
	class={className}
	novalidate={novalidate === true ? true : undefined}
	oninput={engine.handleInput}
	onsubmit={engine.handleSubmit}
	aria-disabled={isDisabled ? 'true' : undefined}
	data-disabled={isDisabled ? '' : undefined}
>
	{#each Object.entries(form.hiddenFields) as [name, value] (name)}
		<input type="hidden" {name} {value} />
	{/each}

	{@render (children as Snippet<[RemoteFormFields<Input>]>)(form.fields)}
</form>
