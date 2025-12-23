<script lang="ts">
	import type {
		SfieldClasses,
		RemoteFormField,
		RemoteFormFieldValue,
		TypedSfieldProps
	} from './types.js';
	import { getSformContext } from './context.svelte.js';
	import TextInput from './inputs/TextInput.svelte';
	import NumberInput from './inputs/NumberInput.svelte';
	import TextareaInput from './inputs/TextareaInput.svelte';
	import SelectInput from './inputs/SelectInput.svelte';
	import CheckboxInput from './inputs/CheckboxInput.svelte';
	import CheckboxGroupInput from './inputs/CheckboxGroupInput.svelte';
	import RadioInput from './inputs/RadioInput.svelte';
	import RangeInput from './inputs/RangeInput.svelte';
	import ToggleInput from './inputs/ToggleInput.svelte';
	import ToggleOptionsInput from './inputs/ToggleOptionsInput.svelte';
	import MaskedInput from './inputs/MaskedInput.svelte';
	import PasswordInput from './inputs/PasswordInput.svelte';

	/**
	 * Sfield - Type-safe form field component.
	 *
	 * The `type` prop is constrained based on the field's value type:
	 * - string fields: text, email, password, textarea, select, radio, masked, etc.
	 * - number fields: number, range
	 * - boolean fields: checkbox, toggle
	 * - string[] fields: checkbox-group
	 */
	let props: TypedSfieldProps<RemoteFormFieldValue> = $props();

	const context = getSformContext();

	// Field is directly passed as a prop
	const field = $derived(props.field as RemoteFormField<RemoteFormFieldValue>);

	// Derive name from the field - all field types include name in their .as() output
	const name = $derived(field.as('text').name);

	// Register this field with the context on mount
	$effect(() => {
		context.registerField(name);
	});

	const classes: SfieldClasses = $derived(
		typeof props.class === 'string' ? { wrapper: props.class } : (props.class ?? {})
	);

	const showIssues = $derived(context.shouldDisplayIssues(name, props.validateOn));
	const issues = $derived(showIssues ? field.issues() : []);
	const hasIssues = $derived(issues && issues instanceof Array && issues.length > 0);

	function handleBlur() {
		context.markTouched(name);
		// Trigger validation with includeUntouched so blur mode shows issues
		context.triggerValidation();
	}

	function handleInput() {
		context.markDirty(name);
	}

	// Props that Sfield manages internally - these are set by Sfield, not passed from parent
	const internalPropKeys = [
		'field',
		'name',
		'showIssues',
		'onblur',
		'oninput',
		'labelClass',
		'class'
	];
	// Props that are Sfield-specific and not passed to components
	const sfieldOnlyPropKeys = ['validateOn', 'hint', 'type'];

	// Passthrough props: everything from parent except internal and sfield-only props
	// This allows new component props to automatically flow through without updating Sfield
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const passthroughProps = $derived((): any => {
		const result: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(props)) {
			if (!internalPropKeys.includes(key) && !sfieldOnlyPropKeys.includes(key)) {
				result[key] = value;
			}
		}
		return result;
	});

	// Internal props that Sfield computes/manages
	const internalProps = $derived({
		field,
		name,
		class: hasIssues ? `${classes.input ?? ''} sform-field-error`.trim() : classes.input,
		labelClass: classes.label,
		showIssues,
		onblur: handleBlur,
		oninput: handleInput
	});

	// Check input type categories
	const isTextType = $derived(
		[
			'text',
			'email',
			'tel',
			'url',
			'search',
			'date',
			'datetime-local',
			'time',
			'month',
			'week',
			'color',
			'hidden',
			'file'
		].includes(props.type)
	);
</script>

<div class={classes.wrapper}>
	{#if isTextType}
		<TextInput
			{...passthroughProps()}
			{...internalProps}
			type={props.type as import('./types.js').TextInputType}
		/>
	{:else if props.type === 'password'}
		<PasswordInput {...passthroughProps()} {...internalProps} />
	{:else if props.type === 'number'}
		<NumberInput {...passthroughProps()} {...internalProps} />
	{:else if props.type === 'textarea'}
		<TextareaInput {...passthroughProps()} {...internalProps} />
	{:else if props.type === 'select'}
		<SelectInput {...passthroughProps()} {...internalProps} />
	{:else if props.type === 'checkbox'}
		<CheckboxInput {...passthroughProps()} {...internalProps} />
	{:else if props.type === 'checkbox-group'}
		<CheckboxGroupInput {...passthroughProps()} {...internalProps} />
	{:else if props.type === 'radio'}
		<RadioInput {...passthroughProps()} {...internalProps} />
	{:else if props.type === 'range'}
		<RangeInput {...passthroughProps()} {...internalProps} />
	{:else if props.type === 'toggle'}
		<ToggleInput {...passthroughProps()} {...internalProps} />
	{:else if props.type === 'toggle-options'}
		<ToggleOptionsInput {...passthroughProps()} {...internalProps} />
	{:else if props.type === 'masked'}
		<MaskedInput {...passthroughProps()} {...internalProps} />
	{/if}

	{#if props.hint}
		<div class="sform-hint">
			{#if typeof props.hint === 'string'}
				{props.hint}
			{:else}
				{@render props.hint()}
			{/if}
		</div>
	{/if}

	{#if hasIssues}
		<div class={classes.messages}>
			{#each issues as issue, i (i)}
				<p>{issue.message}</p>
			{/each}
		</div>
	{/if}
</div>
