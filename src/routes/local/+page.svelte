<script lang="ts">
	import { createForm, SformLocal, Sfield, Sbutton, SIssues } from '$lib/local';
	import { subscribeSchema } from './local.schema.js';

	const subscribe = createForm(subscribeSchema, {
		action: 'https://httpbin.org/post',
		method: 'POST',
		hidden: {
			u: 'sform-demo',
			id: 'demo-list'
		}
	});

	const interests = [
		{ value: 'news', label: 'Product news' },
		{ value: 'updates', label: 'Release updates' }
	];
</script>

<svelte:head>
	<title>Sform local mode</title>
</svelte:head>

<main>
	<h1>Local mode (no remote functions)</h1>
	<p>
		This form validates with the schema while JavaScript is running and falls back to a plain native
		POST to the provider endpoint when it is disabled.
	</p>

	<SformLocal form={subscribe} validateOn="blur" class="sform-form">
		{#snippet children(fields)}
			<Sfield field={fields.first_name} type="text" label="First name" autocomplete="given-name" />
			<Sfield field={fields.last_name} type="text" label="Last name" autocomplete="family-name" />
			<Sfield field={fields.email} type="email" label="Email" autocomplete="email" />
			<Sfield
				field={fields.interests}
				type="checkbox-group"
				label="Interests"
				options={interests}
			/>

			<Sbutton form={subscribe} label="Subscribe" />
			<SIssues message="Please fix the following issues:" />
		{/snippet}
	</SformLocal>
</main>
