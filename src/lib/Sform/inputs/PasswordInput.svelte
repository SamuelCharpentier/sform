<script lang="ts">
	import type { PasswordInputProps } from '../types.js';

	let {
		field,
		name,
		label,
		placeholder,
		class: className,
		labelClass,
		disabled,
		readonly,
		autocomplete,
		showToggle = true,
		onblur,
		oninput
	}: PasswordInputProps = $props();

	let showPassword = $state(false);

	const fieldAttrs = $derived(field.as(showPassword ? 'text' : 'password'));

	function toggleVisibility() {
		showPassword = !showPassword;
	}
</script>

{#if label}
	<label class={labelClass} for={name}>{label}</label>
{/if}
<div class="sform-password-wrapper">
	<input
		{...fieldAttrs}
		type={showPassword ? 'text' : 'password'}
		id={name}
		class={className}
		{placeholder}
		{disabled}
		{readonly}
		{autocomplete}
		{onblur}
		{oninput}
	/>
	{#if showToggle}
		<button
			type="button"
			class="sform-password-toggle"
			onclick={toggleVisibility}
			aria-label={showPassword ? 'Hide password' : 'Show password'}
			tabindex={-1}
			{disabled}
		>
			{#if showPassword}
				<!-- Eye closed icon (password visible) -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
					></path>
					<line x1="1" y1="1" x2="23" y2="23"></line>
				</svg>
			{:else}
				<!-- Eye open icon (password hidden) -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
					<circle cx="12" cy="12" r="3"></circle>
				</svg>
			{/if}
		</button>
	{/if}
</div>

<style>
	.sform-password-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
		width: 100%;
	}

	.sform-password-wrapper input {
		width: 100%;
		padding-right: 2.5rem;
	}

	.sform-password-toggle {
		position: absolute;
		right: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #666;
		border-radius: 0.25rem;
	}

	.sform-password-toggle:hover:not(:disabled) {
		color: #333;
		background-color: rgba(0, 0, 0, 0.05);
	}

	.sform-password-toggle:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.sform-password-toggle:focus {
		outline: 2px solid #2196f3;
		outline-offset: 2px;
	}
</style>
