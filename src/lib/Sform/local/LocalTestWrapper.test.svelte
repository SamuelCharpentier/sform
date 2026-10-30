<script lang="ts">
	import SformLocal from './SformLocal.svelte';
	import Sfield from '../Sfield.svelte';
	import Sbutton from '../inputs/ButtonInput.svelte';
	import type { LocalForm } from './types.js';

	type TestInput = { email: string; first_name: string };

	let {
		form,
		validateOn = 'blur'
	}: {
		form: LocalForm<TestInput, unknown>;
		validateOn?: 'blur' | 'change' | 'submit';
	} = $props();
</script>

<SformLocal {form} {validateOn}>
	{#snippet children(fields)}
		<Sfield field={fields.email} type="email" label="Email" />
		<Sfield field={fields.first_name} type="text" label="First name" />
		<Sbutton {form} label="Subscribe" />
	{/snippet}
</SformLocal>
