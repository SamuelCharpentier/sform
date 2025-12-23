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

	interface Props {
		component:
			| 'TextInput'
			| 'NumberInput'
			| 'TextareaInput'
			| 'SelectInput'
			| 'CheckboxInput'
			| 'RadioInput'
			| 'RangeInput'
			| 'ToggleInput'
			| 'PasswordInput';
		[key: string]: unknown;
	}

	let { component, ...rest }: Props = $props();
</script>

<div data-testid="input-wrapper">
	{#if component === 'TextInput'}
		<TextInput {...rest} />
	{:else if component === 'NumberInput'}
		<NumberInput {...rest} />
	{:else if component === 'TextareaInput'}
		<TextareaInput {...rest} />
	{:else if component === 'SelectInput'}
		<SelectInput {...rest} />
	{:else if component === 'CheckboxInput'}
		<CheckboxInput {...rest} />
	{:else if component === 'RadioInput'}
		<RadioInput {...rest} />
	{:else if component === 'RangeInput'}
		<RangeInput {...rest} />
	{:else if component === 'ToggleInput'}
		<ToggleInput {...rest} />
	{:else if component === 'PasswordInput'}
		<PasswordInput {...rest} />
	{/if}
</div>
