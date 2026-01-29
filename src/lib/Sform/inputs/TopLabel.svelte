<script lang="ts">
	import type { BaseInputComponentProps } from '../types';

	let { label, labelClass, name }: Pick<BaseInputComponentProps, 'label' | 'labelClass' | 'name'> =
		$props();
</script>

{#if label}
	{#if typeof label === 'function'}
		{@render label()}
	{:else}
		<label class={labelClass} for={name}>{label}</label>
	{/if}
{/if}
