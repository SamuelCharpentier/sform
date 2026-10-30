import type { StandardSchemaV1 } from '@standard-schema/spec';
import type {
	EnhanceCallback,
	RemoteFormInstance,
	RemoteFormInput,
	SformLifecycleHooks,
	ValidateOn
} from './types.js';
import { createSformContext } from './context.svelte.js';

export interface SformEngineOptions<Input extends RemoteFormInput, Output> {
	getForm: () => RemoteFormInstance<Input, Output>;
	getSchema: () => StandardSchemaV1<Input, unknown> | undefined;
	getEnhance: () => EnhanceCallback<Input> | undefined;
	getValidateOn: () => ValidateOn;
	getPreflightOnly: () => boolean;
	getResetOnSuccess: () => boolean;
	getLifecycle: () => SformLifecycleHooks | undefined;
	getDisabled: () => boolean;
	getFieldNames: () => string[];
	getElement: () => HTMLFormElement | undefined;
	/** Maps a rendered field name to the key used in schema issue paths. */
	getIssueFieldName?: (name: string) => string;
}

/**
 * Shared form orchestration used by both `<Sform>` (remote) and `<SformLocal>`
 * (no remote functions). Owns the context, lifecycle hooks, validation entry
 * point, and native submit bookkeeping.
 */
export function createSformEngine<Input extends RemoteFormInput, Output>(
	options: SformEngineOptions<Input, Output>
) {
	const isDisabled = $derived(options.getDisabled());
	const form = $derived(options.getForm());

	const triggerValidation = async () => {
		if (isDisabled) return;

		await context.runLifecycleHooks('beforeValidate');

		const validateRequest = form.validate({
			includeUntouched: true,
			preflightOnly: options.getPreflightOnly()
		});
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
		options.getValidateOn,
		options.getFieldNames,
		triggerValidation,
		() => options.getElement()?.requestSubmit(),
		() => form,
		() => isDisabled,
		options.getIssueFieldName
	);

	$effect(() => {
		const lifecycle = options.getLifecycle();
		if (!lifecycle) return;
		return context.registerLifecycleHooks(lifecycle);
	});

	const schema = $derived(options.getSchema());
	const formWithSchema = $derived(schema ? form.preflight(schema) : form);

	const guardedEnhance = $derived.by(() => {
		const enhance = options.getEnhance();
		if (!enhance) return undefined;

		return (opts: Parameters<EnhanceCallback<Input>>[0]) => {
			if (isDisabled) return;
			return enhance(opts);
		};
	});

	const formProps = $derived(
		guardedEnhance ? formWithSchema.enhance(guardedEnhance) : formWithSchema
	);

	let wasPending = $state(false);

	$effect(() => {
		const isPending = form.pending !== 0;
		const hasResult = form.result !== undefined;
		const allIssues =
			(form.fields as { allIssues?: () => unknown[] | undefined }).allIssues?.() ?? [];
		const hasNoIssues = allIssues.length === 0;

		if (wasPending && !isPending) {
			void context.runLifecycleHooks('afterSubmitResponse');

			if (options.getResetOnSuccess() && hasResult && hasNoIssues) {
				context.resetFieldStates();
			}
		}

		wasPending = isPending;
	});

	function handleInput(): void {
		if (isDisabled) return;
		void triggerValidation();
	}

	function handleSubmit(event: SubmitEvent): void {
		if (isDisabled) {
			event.preventDefault();
			event.stopImmediatePropagation();
			return;
		}

		context.markSubmitted();
		context.markAllFieldsDirty();
	}

	return {
		context,
		get formProps() {
			return formProps;
		},
		handleInput,
		handleSubmit
	};
}
