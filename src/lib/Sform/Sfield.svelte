<script lang="ts">
	import type {
		SfieldClasses,
		SfieldProps,
		RemoteFormField,
		RemoteFormFieldValue
	} from './types.js';
	import { getSformContext } from './context.svelte.js';
	import TextInput from './inputs/TextInput.svelte';
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

	let props: SfieldProps = $props();

	const context = getSformContext();
	const field = $derived(context.form.fields[props.name] as RemoteFormField<RemoteFormFieldValue>);

	const classes: SfieldClasses = $derived(
		typeof props.class === 'string' ? { wrapper: props.class } : (props.class ?? {})
	);

	const showIssues = $derived(context.shouldDisplayIssues(props.name, props.visibility));
	const issues = $derived(showIssues ? field.issues() : []);
	const hasIssues = $derived(issues && issues instanceof Array && issues.length > 0);

	function handleBlur() {
		context.markTouched(props.name);
	}

	function handleInput() {
		context.markDirty(props.name);
	}

	// Base input props shared by all input types (now includes label)
	const baseInputProps = $derived({
		field,
		type: props.type,
		name: props.name,
		label: props.label,
		placeholder: props.placeholder,
		class: hasIssues ? `${classes.input ?? ''} sform-field-error`.trim() : classes.input,
		labelClass: classes.label,
		disabled: props.disabled,
		readonly: props.readonly,
		autocomplete: props.autocomplete,
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
		<TextInput {...baseInputProps} />
	{:else if props.type === 'password'}
		<PasswordInput {...baseInputProps} showToggle={props.showToggle} />
	{:else if props.type === 'number'}
		<TextInput {...baseInputProps} min={props.min} max={props.max} step={props.step} />
	{:else if props.type === 'textarea'}
		<TextareaInput {...baseInputProps} />
	{:else if props.type === 'select'}
		<SelectInput {...baseInputProps} options={props.options} />
	{:else if props.type === 'checkbox'}
		<CheckboxInput {...baseInputProps} />
	{:else if props.type === 'checkbox-group'}
		<CheckboxGroupInput {...baseInputProps} options={props.options} />
	{:else if props.type === 'radio'}
		<RadioInput {...baseInputProps} options={props.options} />
	{:else if props.type === 'range'}
		<RangeInput
			{...baseInputProps}
			min={props.min}
			max={props.max}
			step={props.step}
			showValue={props.showValue}
			formatValue={props.formatValue}
		/>
	{:else if props.type === 'toggle'}
		<ToggleInput
			{...baseInputProps}
			onLabel={props.onLabel}
			offLabel={props.offLabel}
			checkedValue={props.checkedValue}
			uncheckedValue={props.uncheckedValue}
		/>
	{:else if props.type === 'toggle-options'}
		<ToggleOptionsInput {...baseInputProps} options={props.options} multiple={props.multiple} />
	{:else if props.type === 'masked'}
		<MaskedInput
			{...baseInputProps}
			mask={props.mask}
			maskPlaceholder={props.maskPlaceholder}
			showMaskPlaceholder={props.showMaskPlaceholder}
			unmaskValue={props.unmaskValue}
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
