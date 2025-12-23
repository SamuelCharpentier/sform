<script lang="ts">
	import { Sform, Sfield, Sbutton, type ButtonFormState } from '$lib';
	import '$lib/Sform/sform.css';
	import { login } from './auth.remote';
	import { loginSchema } from './auth.schema';
	import { settings, contactInfo, survey, customAmount } from './demo.remote';
	import { customAmountSchema } from './customAmount.schema';

	const fieldClasses = {
		wrapper: 'sform-field',
		label: 'sform-label',
		input: 'sform-input',
		messages: 'sform-messages'
	};

	const myLogin = login.for('myLoginForm');
</script>

<h1>Sform Library Demo</h1>

<p class="intro">
	A type-safe form library for Svelte 5 with SvelteKit remote functions. All forms use preflight
	validation - submit to see all errors at once.
</p>

<!-- Login Form -->
<section class="demo">
	<h2>🔐 Login Form</h2>
	<p class="description">Basic text and password inputs with visibility toggle.</p>

	<Sform
		form={myLogin}
		schema={loginSchema}
		enhance={async ({ form, submit, data }) => {
			try {
				await submit();
				console.log('Successfully submitted!');
				console.log('Form result:', myLogin.result);
			} catch (error) {
				console.log('Oh no! Something went wrong');
			}
		}}
		class="sform-form"
	>
		{#snippet children(fields)}
			<Sfield
				field={fields.username}
				type="text"
				label="Username"
				placeholder="Enter username"
				class={fieldClasses}
			>
				{#snippet prefix()}
					😅 | @
				{/snippet}
				{#snippet hint()}
					Try using admin to simulate a login.
				{/snippet}
			</Sfield>
			<Sfield
				field={fields._password}
				type="password"
				label="Password"
				placeholder="Enter password"
				class={fieldClasses}
				hint="Try using password123 to simulate a login."
			>
				{#snippet showToggleIcon(passwordShown)}
					{#if passwordShown}
						🙈
					{:else}
						👁️
					{/if}
				{/snippet}
			</Sfield>

			<Sbutton form={login} class="sform-button">
				{#snippet defaultState(_state: ButtonFormState)}
					Login
				{/snippet}
				{#snippet pendingState(_state: ButtonFormState)}
					Logging in...
				{/snippet}
			</Sbutton>
		{/snippet}
	</Sform>

	{#if myLogin.result}
		<div
			class="sform-result"
			class:sform-result-success={myLogin.result.success}
			class:sform-result-error={!myLogin.result.success}
		>
			{myLogin.result.message}
		</div>
	{/if}

	<div class="hint">
		<strong>Try:</strong> <code>admin</code> / <code>password123</code>
	</div>
</section>

<!-- Custom Amount Form -->
<section class="demo">
	<h2>💰 Custom Amount Form</h2>
	<p class="description">Number input with decimal limits and no spinner controls.</p>

	<Sform form={customAmount} schema={customAmountSchema} validateOn="blur" class="sform-form">
		{#snippet children(fields)}
			<Sfield
				field={fields.amount}
				type="number"
				label="Custom Amount"
				placeholder="Enter amount"
				class={fieldClasses}
				maxDecimals={2}
				showControls={false}
				suffix="$"
				align="end"
			/>
			<Sbutton form={customAmount} class="sform-button">
				{#snippet defaultState(_state: ButtonFormState)}
					Submit Amount
				{/snippet}
				{#snippet pendingState(_state: ButtonFormState)}
					Submitting...
				{/snippet}
			</Sbutton>
		{/snippet}
	</Sform>

	{#if customAmount.result}
		<div class="sform-result sform-result-success">Amount submitted! Check console for data.</div>
	{/if}
</section>

<!-- Settings Form -->
<section class="demo">
	<h2>⚙️ Settings Form</h2>
	<p class="description">Range slider, toggle switch, and toggle options.</p>
	<p class="description">
		This form will only validate on submit and on input after initial validation failiure.
	</p>

	<Sform form={settings} validateOn="submit" class="sform-form">
		{#snippet children(fields)}
			<Sfield
				field={fields.volume}
				type="range"
				label="Volume"
				min={0}
				max={100}
				class={fieldClasses}
			/>

			<Sfield
				field={fields.notifications}
				type="checkbox"
				label="Enable Notifications"
				class={fieldClasses}
			/>

			<Sfield
				field={fields.theme}
				type="toggle-options"
				label="Theme"
				options={[
					{ value: 'light', label: 'Light' },
					{ value: 'dark', label: 'Dark' },
					{ value: 'auto', label: 'Auto' }
				]}
				class={fieldClasses}
			/>

			<Sfield
				field={fields.priority}
				type="select"
				label="Priority Level"
				options={[
					{ value: 'low', label: 'Low' },
					{ value: 'medium', label: 'Medium' },
					{ value: 'high', label: 'High' }
				]}
				class={fieldClasses}
			/>

			<Sbutton form={settings} class="sform-button">
				{#snippet defaultState(_state: ButtonFormState)}
					Save Settings
				{/snippet}
				{#snippet pendingState(_state: ButtonFormState)}
					Saving...
				{/snippet}
			</Sbutton>
		{/snippet}
	</Sform>

	{#if settings.result}
		<div class="sform-result sform-result-success">Settings saved! Check console for data.</div>
	{/if}
</section>

<!-- Contact Info Form -->
<section class="demo">
	<h2>📞 Contact Info Form</h2>
	<p class="description">Masked inputs for phone, credit card, and SSN.</p>

	<Sform form={contactInfo} validateOn="blur" class="sform-form">
		{#snippet children(fields)}
			<Sfield
				field={fields.phone}
				type="masked"
				label="Phone Number"
				mask="### ###-####"
				class={fieldClasses}
				placeholder="123 456-7890"
				unmaskValue={true}
			/>

			<Sfield
				field={fields.creditCard}
				type="masked"
				label="Credit Card"
				mask="#### #### #### ####"
				class={fieldClasses}
				placeholder="1234 5678 9012 3456"
			/>

			<Sfield
				field={fields.ssn}
				type="masked"
				label="SSN"
				mask="###-##-####"
				class={fieldClasses}
				placeholder="123-45-6789"
			/>

			<Sbutton form={contactInfo} class="sform-button">
				{#snippet defaultState(_state: ButtonFormState)}
					Save Contact Info
				{/snippet}
				{#snippet pendingState(_state: ButtonFormState)}
					Saving...
				{/snippet}
			</Sbutton>
		{/snippet}
	</Sform>

	{#if contactInfo.result}
		<div class="sform-result sform-result-success">
			Contact info saved! Check console for unmasked data.
		</div>
	{/if}
</section>

<!-- Survey Form -->
<section class="demo">
	<h2>📝 Survey Form</h2>
	<p class="description">Textarea, number input, checkbox, checkbox-group, and radio buttons.</p>

	<Sform form={survey} validateOn="change" class="sform-form">
		{#snippet children(fields)}
			<Sfield
				field={fields.feedback}
				type="textarea"
				label="Your Feedback"
				placeholder="Tell us more..."
				class={fieldClasses}
			/>

			<Sfield
				field={fields.rating}
				type="number"
				label="Rating (1-10)"
				min={1}
				max={10}
				class={fieldClasses}
			/>

			<Sfield
				field={fields.interests}
				type="checkbox-group"
				label="Your Interests"
				options={[
					{ value: 'tech', label: 'Technology' },
					{ value: 'sports', label: 'Sports' },
					{ value: 'music', label: 'Music' },
					{ value: 'travel', label: 'Travel' }
				]}
				class={fieldClasses}
			/>

			<Sfield
				field={fields.subscribe}
				type="checkbox"
				label="Subscribe to newsletter"
				class={fieldClasses}
			/>

			<Sfield
				field={fields.contactMethod}
				type="radio"
				label="Preferred Contact Method"
				options={[
					{ value: 'email', label: 'Email' },
					{ value: 'phone', label: 'Phone' },
					{ value: 'none', label: 'Do not contact' }
				]}
				class={fieldClasses}
			/>

			<Sbutton form={survey} class="sform-button">
				{#snippet defaultState(_state: ButtonFormState)}
					Submit Survey
				{/snippet}
				{#snippet pendingState(_state: ButtonFormState)}
					Submitting...
				{/snippet}
			</Sbutton>
		{/snippet}
	</Sform>

	{#if survey.result}
		<div class="sform-result sform-result-success">Survey submitted! Check console for data.</div>
	{/if}
</section>

<!-- Features Section -->
<section class="features">
	<h2>✨ Features</h2>
	<ul>
		<li><strong>Type-safe:</strong> Field-to-input type matching at compile time</li>
		<li><strong>Preflight validation:</strong> All errors shown on submit, not one at a time</li>
		<li><strong>Validate modes:</strong> blur, change, or submit</li>
		<li><strong>Password toggle:</strong> Eye icon to show/hide password</li>
		<li><strong>Masked inputs:</strong> Phone, credit card, SSN formatting</li>
		<li><strong>Range slider:</strong> With optional value display</li>
		<li><strong>Toggle switch:</strong> Modern on/off control</li>
		<li><strong>Toggle options:</strong> Segmented control for mutually exclusive options</li>
		<li><strong>Stateful button:</strong> Shows pending state during submission</li>
	</ul>
</section>

<style>
	:global(body) {
		background: #f9f9f9;
		font-family: system-ui, sans-serif;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		align-items: center;
	}
	h1 {
		color: #ff3e00;
		margin-bottom: 0.5rem;
	}

	.sform-result {
		margin-top: 1rem;
		padding: 1rem;
		border-radius: 4px;
	}
	.intro {
		color: #666;
		margin-bottom: 2rem;
		max-width: 600px;
	}

	.demo {
		max-width: 450px;
		margin: 2rem 0;
		padding: 1.5rem;
		background: #fff;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
	}

	.demo h2 {
		margin-top: 0;
		margin-bottom: 0.25rem;
	}

	.description {
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.hint {
		margin-top: 1rem;
		padding: 0.75rem;
		background: #f0f0f0;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	code {
		background: #e4e4e4;
		padding: 0.2rem 0.4rem;
		border-radius: 2px;
		font-family: monospace;
	}

	.features {
		max-width: 600px;
		margin: 3rem 0;
		padding: 1.5rem;
		background: #fef3e2;
		border: 1px solid #fcd9a0;
		border-radius: 8px;
	}

	.features h2 {
		margin-top: 0;
		color: #ff3e00;
	}

	.features ul {
		margin: 0;
		padding-left: 1.5rem;
	}

	.features li {
		margin-bottom: 0.5rem;
	}
</style>
