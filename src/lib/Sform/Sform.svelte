<script lang="ts" generics="Input extends import('@sveltejs/kit').RemoteFormInput, Output">
	import type {
		RemoteFormInstance,
		ValidateOn,
		EnhanceCallback,
		SformLifecycleHooks
	} from './types.js';
	import type { RemoteFormFields } from '@sveltejs/kit';
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import { createSformEngine } from './engine.svelte.js';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	/**
	 * Form fields accessor type - provides typed access to all form fields
	 */
	type FormFields = RemoteFormFields<Input>;

	let {
		form,
		schema,
		enhance,
		validateOn = 'blur',
		class: className,
		preflightOnly = false,
		resetOnSuccess = true,
		lifecycle,
		children,
		disabled
	}: {
		/** Remote form object from form() API, or the result of form.for(id) */
		form: RemoteFormInstance<Input, Output>;
		/** Preflight validation schema (Valibot, Zod, or any StandardSchema) */
		schema?: StandardSchemaV1<Input, unknown>;
		/** Enhance callback for custom form submission handling */
		enhance?: EnhanceCallback<Input>;
		/** When to validate and show issues: 'blur' (default), 'change', or 'submit' */
		validateOn?: ValidateOn;
		/** If true, only run preflight validation (no submission) */
		preflightOnly?: boolean;
		/** If true, reset touched/dirty/submitted state after successful submit response */
		resetOnSuccess?: boolean;
		/** Lifecycle hooks for submit/validate phases */
		lifecycle?: SformLifecycleHooks;
		/** Form element class */
		class?: string;
		/**
		 * Children snippet receives typed fields for type-safe field access.
		 * @example
		 * ```svelte
		 * <Sform {form}>
		 *   {#snippet children(fields)}
		 *     <Sfield field={fields.username} type="text" />
		 *   {/snippet}
		 * </Sform>
		 * ```
		 */
		children: Snippet<[FormFields]>;
		disabled?: boolean;
	} = $props();

	let formElement: HTMLFormElement | undefined = $state();

	const getFieldNames = () => {
		return Object.keys(form.fields).filter((key) => !['value', 'set', 'allIssues'].includes(key));
	};

	const engine = createSformEngine<Input, Output>({
		getForm: () => form,
		getSchema: () => schema,
		getEnhance: () => enhance,
		getValidateOn: () => validateOn,
		getPreflightOnly: () => preflightOnly,
		getResetOnSuccess: () => resetOnSuccess,
		getLifecycle: () => lifecycle,
		getDisabled: () => disabled === true,
		getFieldNames,
		getElement: () => formElement
	});

	const isDisabled = $derived(disabled === true);
</script>

<!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
<form
	bind:this={formElement}
	{...engine.formProps as unknown as HTMLFormAttributes}
	class={className}
	novalidate
	oninput={engine.handleInput}
	onsubmit={engine.handleSubmit}
	aria-disabled={isDisabled ? 'true' : undefined}
	data-disabled={isDisabled ? '' : undefined}
>
	{@render (children as Snippet<[FormFields]>)(form.fields)}
</form>
