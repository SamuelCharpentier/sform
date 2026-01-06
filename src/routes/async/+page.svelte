<script lang="ts">
	import { subscribeForm } from './auth.remote';
	import { subscribeFormSchema } from './auth.schema';
	import { Sform, Sfield, Sbutton, SResult, SIssues } from '$lib';
	import * as v from 'valibot';

	const submitLabel = 'Subscribe';
	const groups = ['news', 'updates'];
	let recaptchaToken: string = $state('waiting for submit');
	async function refreshReCAPTCHA(): Promise<void> {
		console.log('Refreshing reCAPTCHA token...');
		// Simulate reCAPTCHA token retrieval
		return new Promise((resolve) => {
			setTimeout(() => {
				recaptchaToken = 'simulated-recaptcha-token-' + Date.now();
				resolve();
				console.log('reCAPTCHA token refreshed:', recaptchaToken);
			}, 500);
		});
	}
</script>

<Sform form={subscribeForm} schema={subscribeFormSchema} preflightOnly={true}>
	{#snippet children(fields)}
		<Sfield
			field={fields.first_name}
			type="text"
			label={v.getTitle(subscribeFormSchema.entries.first_name)}
			hint={v.getDescription(subscribeFormSchema.entries.first_name)}
			autocomplete="given-name"
			disabled={subscribeForm.pending > 0}
		/>
		<Sfield
			field={fields.last_name}
			type="text"
			label={v.getTitle(subscribeFormSchema.entries.last_name)}
			autocomplete="family-name"
			disabled={subscribeForm.pending > 0}
		/>
		<Sfield
			field={fields.email}
			type="email"
			label={v.getTitle(subscribeFormSchema.entries.email)}
			disabled={subscribeForm.pending > 0}
		/>
		{#each groups as group, index}
			<input {...fields.groups[index].as('hidden', group)} data-value-index={index} />
		{/each}
		<Sfield field={fields.recaptchaToken} type="hidden" value={recaptchaToken} />
		<Sbutton form={subscribeForm} disabled={subscribeForm.pending > 0}>
			{#snippet children(state)}
				{#if state.state === 'pending'}
					Loading...
				{:else}
					{submitLabel ?? 'Subscribe'}
				{/if}
			{/snippet}
		</Sbutton>
		<SIssues />
		<SResult form={subscribeForm}>
			{#snippet children(result)}
				{#if result?.success}
					<p class="text-green-600">Success: {result.message}</p>
				{:else if result}
					<p class="text-red-600">Error: {result.message}</p>
				{/if}
			{/snippet}
		</SResult>
	{/snippet}
</Sform>
