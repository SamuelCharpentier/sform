<script lang="ts">
	import type {
		SfieldClasses,
		RemoteFormField,
		RemoteFormFieldValue,
		TypedSfieldProps,
		SfieldTextProps,
		SfieldPasswordProps,
		SfieldNumberProps,
		SfieldTextareaProps,
		SfieldSelectProps,
		SfieldCheckboxProps,
		SfieldCheckboxGroupProps,
		SfieldRadioProps,
		SfieldRangeProps,
		SfieldToggleProps,
		SfieldMaskedProps,
		SfieldHiddenProps
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
	import MaskedInput from './inputs/MaskedInput.svelte';
	import PasswordInput from './inputs/PasswordInput.svelte';
	import HiddenInput from './inputs/HiddenInput.svelte';

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
	const issueDisplay = $derived(props.issueDisplay ?? 'auto');
	const shouldRenderFieldIssues = $derived(
		issueDisplay === 'field' || (issueDisplay === 'auto' && props.type !== 'hidden')
	);
	const shouldMarkIssuesHandled = $derived(issueDisplay === 'none' || shouldRenderFieldIssues);

	// Form-level disabled always wins over a field's own disabled prop (OR semantics)
	const effectiveDisabled = $derived(context.disabled || props.disabled === true);

	// Register this field with the context on mount
	$effect(() => {
		context.registerField(name);
		if (shouldMarkIssuesHandled) {
			context.registerFieldWithIssueDisplay(name);
		}
	});

	$effect(() => {
		if (!props.lifecycle) return;
		return context.registerLifecycleHooks(props.lifecycle);
	});

	const classes: SfieldClasses = $derived(
		typeof props.class === 'string' ? { wrapper: props.class } : (props.class ?? {})
	);

	const showIssues = $derived(
		shouldRenderFieldIssues && context.shouldDisplayIssues(name, props.validateOn)
	);
	const issues = $derived(showIssues ? field.issues() : []);
	const hasIssues = $derived(issues && issues instanceof Array && issues.length > 0);

	async function handleBlur() {
		if (effectiveDisabled) return;
		context.markTouched(name);
		context.triggerValidation();
	}

	function handleInput() {
		if (effectiveDisabled) return;
		context.markDirty(name);
	}

	function isTextSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldTextProps {
		switch (input.type) {
			case 'text':
			case 'email':
			case 'tel':
			case 'url':
			case 'search':
			case 'date':
			case 'datetime-local':
			case 'time':
			case 'month':
			case 'week':
			case 'color':
			case 'file':
				return true;
			default:
				return false;
		}
	}

	function isPasswordSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldPasswordProps {
		return input.type === 'password';
	}

	function isNumberSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldNumberProps {
		return input.type === 'number';
	}

	function isTextareaSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldTextareaProps {
		return input.type === 'textarea';
	}

	function isSelectSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldSelectProps {
		return input.type === 'select';
	}

	function isCheckboxSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldCheckboxProps {
		return input.type === 'checkbox';
	}

	function isCheckboxGroupSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldCheckboxGroupProps {
		return input.type === 'checkbox-group';
	}

	function isRadioSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldRadioProps {
		return input.type === 'radio';
	}

	function isRangeSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldRangeProps {
		return input.type === 'range';
	}

	function isToggleSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldToggleProps {
		return input.type === 'toggle';
	}

	function isMaskedSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldMaskedProps {
		return input.type === 'masked';
	}

	function isHiddenSfieldProps(
		input: TypedSfieldProps<RemoteFormFieldValue>
	): input is SfieldHiddenProps {
		return input.type === 'hidden';
	}

	// Props that Sfield manages internally - these are set by Sfield, not passed from parent
	type SfieldManagedProps =
		| 'field'
		| 'validateOn'
		| 'issueDisplay'
		| 'hint'
		| 'type'
		| 'lifecycle'
		| 'class'
		| 'disabled';

	type InputPassthrough<T extends TypedSfieldProps<RemoteFormFieldValue>> = Omit<
		T,
		SfieldManagedProps
	>;

	function getPassthroughProps<T extends TypedSfieldProps<RemoteFormFieldValue>>(
		input: T
	): InputPassthrough<T> {
		const {
			field,
			validateOn,
			issueDisplay,
			hint,
			type,
			lifecycle,
			class: className,
			disabled: fieldDisabled,
			...rest
		} = input;

		void field;
		void validateOn;
		void issueDisplay;
		void hint;
		void type;
		void lifecycle;
		void className;
		void fieldDisabled;

		return rest;
	}

	// Passthrough props: everything from parent except Sfield-managed props.
	// Keep this generic so each input branch can recover exact prop typing.
	const textPassthrough = $derived.by(() =>
		isTextSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const passwordPassthrough = $derived.by(() =>
		isPasswordSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const numberPassthrough = $derived.by(() =>
		isNumberSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const textareaPassthrough = $derived.by(() =>
		isTextareaSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const selectPassthrough = $derived.by(() =>
		isSelectSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const checkboxPassthrough = $derived.by(() =>
		isCheckboxSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const checkboxGroupPassthrough = $derived.by(() =>
		isCheckboxGroupSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const radioPassthrough = $derived.by(() =>
		isRadioSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const rangePassthrough = $derived.by(() =>
		isRangeSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const togglePassthrough = $derived.by(() =>
		isToggleSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const maskedPassthrough = $derived.by(() =>
		isMaskedSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const hiddenPassthrough = $derived.by(() =>
		isHiddenSfieldProps(props) ? getPassthroughProps(props) : undefined
	);
	const textInputType = $derived.by(() => (isTextSfieldProps(props) ? props.type : undefined));

	// Internal props that Sfield computes/manages
	const internalProps = $derived({
		field,
		name,
		class: hasIssues ? `${classes.input ?? ''} sform-field-error`.trim() : classes.input,
		labelClass: classes.label,
		wrapperClass: classes.inputWrapper,
		showIssues,
		disabled: effectiveDisabled,
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
			'file'
		].includes(props.type)
	);
</script>

<div class={classes.wrapper}>
	{#if isTextType && textPassthrough && textInputType}
		<TextInput {...textPassthrough} {...internalProps} type={textInputType} />
	{:else if passwordPassthrough}
		<PasswordInput {...passwordPassthrough} {...internalProps} />
	{:else if numberPassthrough}
		<NumberInput {...numberPassthrough} {...internalProps} />
	{:else if textareaPassthrough}
		<TextareaInput {...textareaPassthrough} {...internalProps} />
	{:else if selectPassthrough}
		<SelectInput {...selectPassthrough} {...internalProps} />
	{:else if checkboxPassthrough}
		<CheckboxInput {...checkboxPassthrough} {...internalProps} />
	{:else if checkboxGroupPassthrough}
		<CheckboxGroupInput {...checkboxGroupPassthrough} {...internalProps} />
	{:else if radioPassthrough}
		<RadioInput {...radioPassthrough} {...internalProps} />
	{:else if rangePassthrough}
		<RangeInput {...rangePassthrough} {...internalProps} />
	{:else if togglePassthrough}
		<ToggleInput {...togglePassthrough} {...internalProps} />
	{:else if maskedPassthrough}
		<MaskedInput {...maskedPassthrough} {...internalProps} />
	{:else if hiddenPassthrough}
		<HiddenInput {...hiddenPassthrough} {...internalProps} />
	{/if}

	{#if props.hint}
		<div class={classes.hint}>
			{#if typeof props.hint === 'string'}
				{props.hint}
			{:else}
				{@render props.hint()}
			{/if}
		</div>
	{/if}

	{#if hasIssues}
		<div class={classes.issues}>
			{#each issues as issue, i (i)}
				<p class={classes.issue}>{issue.message}</p>
			{/each}
		</div>
	{/if}
</div>
