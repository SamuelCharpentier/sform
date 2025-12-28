<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getSformContext } from './context.svelte.js';

	interface Props {
		/** General message shown when there are any issues (string or snippet) */
		message?: string | Snippet;
		/** Display message only if  */
		showMessageIf?: 'noUnhandledIssue' | 'hasUnhandledIssue' | 'hasAnyIssue';
		/** CSS class for the wrapper */
		class?: string;
		/** CSS class for the issues list */
		listClass?: string;
	}

	let { message, class: className, listClass, showMessageIf = 'hasAnyIssue' }: Props = $props();

	const context = getSformContext();

	// Get unhandled issues from context (issues not displayed by any Sfield)
	const unhandledIssues = $derived(context.getUnhandledIssues());
	const formState = $derived(context.getFormState());

	// Show issues only after form submission and when there are issues
	const shouldShow = $derived(context.submitted && formState.hasIssues);
	const hasUnhandledIssues = $derived(unhandledIssues.length > 0);
</script>

{#if shouldShow}
	<div class={className ?? 'sform-issues'}>
		{#if message && (showMessageIf === 'hasAnyIssue' || (showMessageIf === 'noUnhandledIssue' && !hasUnhandledIssues) || (showMessageIf === 'hasUnhandledIssue' && hasUnhandledIssues))}
			<div class="sform-issues-message">
				{#if typeof message === 'string'}
					{message}
				{:else}
					{@render message()}
				{/if}
			</div>
		{/if}

		{#if hasUnhandledIssues}
			<ul class={listClass ?? 'sform-issues-list'}>
				{#each unhandledIssues as issue, i (i)}
					<li>{issue.message}</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
