import type { StandardSchemaV1 } from '@standard-schema/spec';
import type {
	EnhanceCallback,
	RemoteFormFields,
	RemoteFormInput,
	SformLifecycleHooks,
	ValidateOn
} from '../types.js';

export interface LocalSubmitOptions<Input extends RemoteFormInput> {
	/** The form element that is being submitted. */
	form: HTMLFormElement;
	/** Form data converted to schema-shaped values. */
	data: Input;
	/** Perform the browser's native submission (useful for progressive enhancement). */
	submit: () => Promise<void>;
}

export interface LocalFormOptions<Input extends RemoteFormInput, Output = unknown> {
	/** Provider endpoint. Required for a native no-JS submission. */
	action?: string;
	/** HTTP method used for the native submission. Defaults to `POST`. */
	method?: 'GET' | 'POST';
	/** Optional `enctype` (e.g. `multipart/form-data`). */
	enctype?: string;
	/**
	 * Explicit HTML `name` per schema key. Takes precedence over `wireName()`
	 * metadata declared on the schema.
	 */
	names?: Partial<Record<keyof Input & string, string>>;
	/** Extra provider-specific hidden inputs that are submitted but not validated. */
	hidden?: Record<string, string>;
	/**
	 * Submission handler. When provided (or when `enhance` is passed to
	 * `<SformLocal>`), the native submission is intercepted and this callback
	 * decides what to do. Return a value to populate `form.result`.
	 */
	onSubmit?: (options: LocalSubmitOptions<Input>) => Output | Promise<Output>;
	onSuccess?: (result: Output) => void;
	onError?: (error: unknown) => void;
	/** Prefix `name` attributes with `n:`/`b:` like SvelteKit does. Defaults to `false`. */
	encodeTypes?: boolean;
	/** Append `[]` to array field names. Defaults to `false`. */
	arraySuffix?: boolean;
}

export interface LocalForm<Input extends RemoteFormInput = RemoteFormInput, Output = unknown> {
	readonly schema: StandardSchemaV1<Input, unknown>;
	readonly fieldNames: string[];
	readonly method: 'GET' | 'POST';
	readonly action: string;
	readonly enctype: string | undefined;
	readonly element: HTMLFormElement | null;
	readonly fields: RemoteFormFields<Input>;
	readonly pending: number;
	readonly result: Output | undefined;
	readonly error: unknown;
	readonly submitted: boolean;
	readonly hiddenFields: Record<string, string>;
	readonly disabled: boolean;
	preflight(schema: StandardSchemaV1<Input, unknown>): LocalForm<Input, Output>;
	validate(options?: {
		includeUntouched?: boolean;
		all?: boolean;
		preflightOnly?: boolean;
	}): Promise<void>;
	enhance(callback: EnhanceCallback<Input>): LocalForm<Input, Output>;
	submit(): Promise<boolean>;
	setDisabledSource(source: () => boolean): void;
	/** Maps a rendered HTML field name back to the schema key used in issue paths. */
	fieldNameForIssue(name: string): string;
}

export interface SformLocalProps<Input extends RemoteFormInput, Output> {
	form: LocalForm<Input, Output>;
	validateOn?: ValidateOn;
	class?: string;
	resetOnSuccess?: boolean;
	lifecycle?: SformLifecycleHooks;
	enhance?: EnhanceCallback<Input>;
	disabled?: boolean;
	/**
	 * `undefined` (default) keeps native constraint validation in the markup so
	 * the no-JS submission is guarded, then disables it once JavaScript hydrates
	 * so schema issues are the single source of truth.
	 */
	novalidate?: boolean;
}
