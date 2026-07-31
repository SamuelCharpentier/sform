<script lang="ts" generics="Input extends import('@sveltejs/kit').RemoteFormInput, Output">
	import type {
		RemoteFormInstance,
		ValidateOn,
		EnhanceCallback,
		SformLifecycleHooks
	} from './types.js';
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
		preflightOnly = false,
		resetOnSuccess = true,
		lifecycle,
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
	} = $props();

	// Get field names for marking all dirty on submit
	const getFieldNames = () => {
		return Object.keys(form.fields).filter((key) => !['value', 'set', 'allIssues'].includes(key));
	};

	// Trigger validation including untouched fields (for blur mode)
	const triggerValidation = async () => {
		await context.runLifecycleHooks('beforeValidate');

		const validateRequest = form.validate({ includeUntouched: true, preflightOnly });
		let afterCalledError: unknown;

		try {
			await context.runLifecycleHooks('afterValidateCalled');
		} catch (error) {
			afterCalledError = error;
		}

		try {
			await validateRequest;
		} finally {
			await context.runLifecycleHooks('afterValidateSettled');
		}

		if (afterCalledError) {
			throw afterCalledError;
		}
	};

	const context = createSformContext(
		() => validateOn,
		getFieldNames,
		triggerValidation,
		() => formElement?.requestSubmit(),
		() => form
	);

	$effect(() => {
		if (!lifecycle) return;
		return context.registerLifecycleHooks(lifecycle);
	});

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

		if (wasPending && !isPending) {
			void context.runLifecycleHooks('afterSubmitResponse');

			// Submission just completed successfully (was pending, now not, has result, no issues)
			if (resetOnSuccess && hasResult && hasNoIssues) {
				context.resetFieldStates();
			}
		}

		wasPending = isPending;
	});

	function handleInput() {
		void triggerValidation();
	}

	function handleSubmit() {
		context.markSubmitted();
		context.markAllFieldsDirty();
	}

	let formElement: HTMLFormElement | undefined = $state();
</script>

<form
	bind:this={formElement}
	{...formProps as unknown as HTMLFormAttributes}
	class={className}
	novalidate
	oninput={handleInput}
	onsubmit={handleSubmit}
>
	{@render (children as Snippet<[FormFields]>)(form.fields)}
</form>
