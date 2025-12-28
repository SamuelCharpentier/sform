<script lang="ts">
	import type { HiddenInputProps } from '../types.js';

	let { field, name, value }: HiddenInputProps = $props();

	// Hidden fields require the value to be passed to field.as('hidden', value)
	const fieldAttrs = $derived(field.as('hidden', value ?? ''));
</script>

<input {...fieldAttrs} type="hidden" id={name} />
