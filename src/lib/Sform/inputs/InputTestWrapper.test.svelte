<script lang="ts">
	import TextInput from './TextInput.svelte';
	import NumberInput from './NumberInput.svelte';
	import TextareaInput from './TextareaInput.svelte';
	import SelectInput from './SelectInput.svelte';
	import CheckboxInput from './CheckboxInput.svelte';
	import RadioInput from './RadioInput.svelte';
	import RangeInput from './RangeInput.svelte';
	import ToggleInput from './ToggleInput.svelte';
	import PasswordInput from './PasswordInput.svelte';
	import MaskedInput from './MaskedInput.svelte';
	import CheckboxGroupInput from './CheckboxGroupInput.svelte';
	import type {
		TextInputComponentProps,
		NumberInputComponentProps,
		TextareaInputProps,
		SelectInputProps,
		CheckboxRadioInputProps,
		RadioInputProps,
		RangeInputProps,
		ToggleInputProps,
		PasswordInputProps,
		MaskedInputProps,
		CheckboxGroupInputProps
	} from '../types.js';

	type TextInputWrapperProps = { component: 'TextInput' } & TextInputComponentProps;
	type NumberInputWrapperProps = { component: 'NumberInput' } & NumberInputComponentProps;
	type TextareaInputWrapperProps = { component: 'TextareaInput' } & TextareaInputProps;
	type SelectInputWrapperProps = { component: 'SelectInput' } & SelectInputProps;
	type CheckboxInputWrapperProps = { component: 'CheckboxInput' } & CheckboxRadioInputProps;
	type RadioInputWrapperProps = { component: 'RadioInput' } & RadioInputProps;
	type RangeInputWrapperProps = { component: 'RangeInput' } & RangeInputProps;
	type ToggleInputWrapperProps = { component: 'ToggleInput' } & ToggleInputProps;
	type PasswordInputWrapperProps = { component: 'PasswordInput' } & PasswordInputProps;
	type MaskedInputWrapperProps = { component: 'MaskedInput' } & MaskedInputProps;
	type CheckboxGroupInputWrapperProps = {
		component: 'CheckboxGroupInput';
	} & CheckboxGroupInputProps;

	type Props =
		| TextInputWrapperProps
		| NumberInputWrapperProps
		| TextareaInputWrapperProps
		| SelectInputWrapperProps
		| CheckboxInputWrapperProps
		| RadioInputWrapperProps
		| RangeInputWrapperProps
		| ToggleInputWrapperProps
		| PasswordInputWrapperProps
		| MaskedInputWrapperProps
		| CheckboxGroupInputWrapperProps;

	let { component, ...rest }: Props = $props();
</script>

<div data-testid="input-wrapper">
	{#if component === 'TextInput'}
		<TextInput {...rest as TextInputComponentProps} />
	{:else if component === 'NumberInput'}
		<NumberInput {...rest as NumberInputComponentProps} />
	{:else if component === 'TextareaInput'}
		<TextareaInput {...rest as TextareaInputProps} />
	{:else if component === 'SelectInput'}
		<SelectInput {...rest as SelectInputProps} />
	{:else if component === 'CheckboxInput'}
		<CheckboxInput {...rest as CheckboxRadioInputProps} />
	{:else if component === 'RadioInput'}
		<RadioInput {...rest as RadioInputProps} />
	{:else if component === 'RangeInput'}
		<RangeInput {...rest as RangeInputProps} />
	{:else if component === 'ToggleInput'}
		<ToggleInput {...rest as ToggleInputProps} />
	{:else if component === 'PasswordInput'}
		<PasswordInput {...rest as PasswordInputProps} />
	{:else if component === 'MaskedInput'}
		<MaskedInput {...rest as MaskedInputProps} />
	{:else if component === 'CheckboxGroupInput'}
		<CheckboxGroupInput {...rest as CheckboxGroupInputProps} />
	{/if}
</div>
