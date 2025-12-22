<script lang="ts" generics="Input extends import('@sveltejs/kit').RemoteFormInput, Output">
	import type { RemoteFormInstance, ValidateOn, EnhanceCallback } from './types.js';
	import type { RemoteFormFields } from '@sveltejs/kit';
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import { createSformContext } from './context.svelte.js';
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
		children
	}: {
		/** Remote form object from form() API, or the result of form.for(id) */
		form: RemoteFormInstance<Input, Output>;
		/** Preflight validation schema (Valibot, Zod, or any StandardSchema) */
		schema?: StandardSchemaV1<Input, unknown>;
		/** Enhance callback for custom form submission handling */
		enhance?: EnhanceCallback<Input>;
		/** When to validate and show issues: 'blur' (default), 'change', or 'submit' */
		validateOn?: ValidateOn;
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
	} = $props();

	// Get field names for marking all dirty on submit
	const getFieldNames = () => {
		return Object.keys(form.fields).filter((key) => !['value', 'set', 'allIssues'].includes(key));
	};

	// Trigger validation including untouched fields (for blur mode)
	const triggerValidation = () => {
		form.validate({ includeUntouched: true });
	};

	const context = createSformContext(() => validateOn, getFieldNames, triggerValidation);

	// Apply preflight schema if provided
	const formWithSchema = $derived(schema ? form.preflight(schema) : form);

	// Apply enhance if provided - returns a minimal object for spreading onto form element
	const formProps = $derived(enhance ? formWithSchema.enhance(enhance) : formWithSchema);

	// Track previous pending state to detect submission completion
	let wasPending = $state(false);

	$effect(() => {
		const isPending = form.pending !== 0;
		const hasResult = form.result !== undefined;
		const allIssues =
			(form.fields as { allIssues?: () => unknown[] | undefined }).allIssues?.() ?? [];
		const hasNoIssues = allIssues.length === 0;

		// Submission just completed successfully (was pending, now not, has result, no issues)
		if (wasPending && !isPending && hasResult && hasNoIssues) {
			context.resetFieldStates();
		}

		wasPending = isPending;
	});

	function handleInput() {
		// Always include untouched to preserve issues on fields that were already validated
		form.validate({ includeUntouched: true });
	}

	function handleSubmit() {
		context.markSubmitted();
		context.markAllFieldsDirty();
	}
</script>

<form
	{...formProps as unknown as HTMLFormAttributes}
	class={className}
	novalidate
	oninput={handleInput}
	onsubmit={handleSubmit}
>
	{@render (children as Snippet<[FormFields]>)(form.fields)}
</form>
