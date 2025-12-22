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

	// Base input props shared by all input types (without type - added explicitly per component)
	const baseInputProps = $derived({
		field,
		name,
		label: props.label,
		placeholder: props.placeholder,
		class: hasIssues ? `${classes.input ?? ''} sform-field-error`.trim() : classes.input,
		labelClass: classes.label,
		disabled: props.disabled,
		readonly: props.readonly,
		autocomplete: props.autocomplete,
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
		<TextInput {...baseInputProps} type={props.type as import('./types.js').TextInputType} />
	{:else if props.type === 'password'}
		<PasswordInput
			{...baseInputProps}
			showToggle={'showToggle' in props ? props.showToggle : undefined}
		/>
	{:else if props.type === 'number'}
		<NumberInput
			{...baseInputProps}
			min={'min' in props ? props.min : undefined}
			max={'max' in props ? props.max : undefined}
			step={'step' in props ? props.step : undefined}
		/>
	{:else if props.type === 'textarea'}
		<TextareaInput {...baseInputProps} />
	{:else if props.type === 'select'}
		<SelectInput {...baseInputProps} options={'options' in props ? props.options : []} />
	{:else if props.type === 'checkbox'}
		<CheckboxInput {...baseInputProps} />
	{:else if props.type === 'checkbox-group'}
		<CheckboxGroupInput {...baseInputProps} options={'options' in props ? props.options : []} />
	{:else if props.type === 'radio'}
		<RadioInput {...baseInputProps} options={'options' in props ? props.options : []} />
	{:else if props.type === 'range'}
		<RangeInput
			{...baseInputProps}
			min={'min' in props ? props.min : undefined}
			max={'max' in props ? props.max : undefined}
			step={'step' in props ? props.step : undefined}
			showValue={'showValue' in props ? props.showValue : undefined}
			formatValue={'formatValue' in props ? props.formatValue : undefined}
		/>
	{:else if props.type === 'toggle'}
		<ToggleInput
			{...baseInputProps}
			onLabel={'onLabel' in props ? props.onLabel : undefined}
			offLabel={'offLabel' in props ? props.offLabel : undefined}
			checkedValue={'checkedValue' in props ? props.checkedValue : undefined}
			uncheckedValue={'uncheckedValue' in props ? props.uncheckedValue : undefined}
		/>
	{:else if props.type === 'toggle-options'}
		<ToggleOptionsInput
			{...baseInputProps}
			options={'options' in props ? props.options : []}
			multiple={'multiple' in props ? props.multiple : undefined}
		/>
	{:else if props.type === 'masked'}
		<MaskedInput
			{...baseInputProps}
			mask={'mask' in props ? props.mask : ''}
			maskPlaceholder={'maskPlaceholder' in props ? props.maskPlaceholder : undefined}
			showMaskPlaceholder={'showMaskPlaceholder' in props ? props.showMaskPlaceholder : undefined}
			unmaskValue={'unmaskValue' in props ? props.unmaskValue : undefined}
		/>
	{/if}

	{#if hasIssues}
		<div class={classes.messages}>
			{#each issues as issue, i (i)}
				<p>{issue.message}</p>
			{/each}
		</div>
	{/if}
</div>
