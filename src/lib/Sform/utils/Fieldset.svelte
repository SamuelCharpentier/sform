<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { FieldsetProps } from '../types';

	let { label, labelClass, className, disabled, children }: FieldsetProps = $props();
</script>

<fieldset class="sform-checkbox-group {className ?? ''}" {disabled}>
	{#if label}
		<legend class={labelClass}>{label}</legend>
	{/if}
	{@render children()}
</fieldset>

<style>
	.sform-checkbox-group legend {
		padding: 0.25rem 0.5rem;
		margin: 0;
		border: var(--sform-border-width) solid var(--sform-border);
		background: var(--sform-bg);
		border-radius: 0.25rem;
		line-height: 1;
	}
</style>
