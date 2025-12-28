# Sform

A type-safe form library for **Svelte 5** with **SvelteKit remote functions**.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Create a Remote Form](#1-create-a-remote-form)
  - [Create Your Form Component](#2-create-your-form-component)
- [Components](#components)
  - [`<Sform>`](#sform)
  - [`<Sfield>`](#sfield)
    - [Common Props (all types)](#common-props-all-types)
    - [Text Inputs](#text-inputs)
    - [Password Input](#password-input)
    - [Number Input](#number-input)
    - [Textarea](#textarea)
    - [Select](#select)
    - [Checkbox](#checkbox)
    - [Radio](#radio)
    - [Range](#range)
    - [Toggle](#toggle)
    - [Toggle Options](#toggle-options)
    - [Masked Input](#masked-input)
    - [Hidden Input](#hidden-input)
  - [`<Sbutton>`](#sbutton)
  - [`<SIssues>`](#sissues)
  - [`<SResult>`](#sresult)
- [Styling](#styling)
- [Validation](#validation)
- [Type Safety](#type-safety)
- [Development](#development)
- [License](#license)

## Features

- ✅ **Type-safe** - Discriminated union types for each input type
- ✅ **Preflight validation** - All errors shown on submit, not one at a time
- ✅ **Validate modes** - `blur`, `change`, or `submit`
- ✅ **Password toggle** - Eye icon to show/hide password
- ✅ **Masked inputs** - Phone, credit card, SSN formatting
- ✅ **Range slider** - With optional value display
- ✅ **Toggle switch** - Modern on/off control
- ✅ **Toggle options** - Segmented control for mutually exclusive options
- ✅ **Stateful button** - Shows pending state during submission

## Requirements

- Svelte 5
- SvelteKit with `remoteFunctions: true` in config
- Valibot for schema validation

## Installation

```bash
npm install @samuel-charpentier/sform
```

Enable remote functions in `svelte.config.js`:

```javascript
export default {
	kit: {
		experimental: {
			remoteFunctions: true
		}
	}
};
```

## Quick Start

### 1. Create a Remote Form

Create a `.remote.ts` file with your form schema and handler:

```typescript
// src/routes/auth.remote.ts
import * as v from 'valibot';
import { form } from '@sveltejs/kit/remote';

const loginSchema = v.object({
	username: v.pipe(v.string(), v.minLength(3, 'Username must be at least 3 characters')),
	_password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters'))
});

export const login = form(loginSchema, async ({ username, _password }) => {
	// Your authentication logic here
	return { success: true, message: 'Welcome!' };
});
```

### 2. Create Your Form Component

```svelte
<script lang="ts">
	import { Sform, Sfield, Sbutton } from '@samuel-charpentier/sform';
	import { login } from './auth.remote.ts';
</script>

<Sform form={login} validateOn="blur">
	{#snippet children(fields)}
		<Sfield field={fields.username} type="text" label="Username" />
		<Sfield field={fields._password} type="password" label="Password" />

		<Sbutton form={login} label="Login" />
	{/snippet}
</Sform>
```

## Components

### `<Sform>`

Wrapper component that provides form context to all child fields.

```svelte
<Sform form={remoteForm} validateOn="blur" class="my-form">
	{#snippet children(fields)}
		<!-- Sfield components here -->
	{/snippet}
</Sform>
```

| Prop         | Type                             | Default     | Description                          |
| ------------ | -------------------------------- | ----------- | ------------------------------------ |
| `form`       | `RemoteForm`                     | required    | Remote form object from `form()` API |
| `validateOn` | `'blur' \| 'change' \| 'submit'` | `'blur'`    | When to validate and show errors     |
| `class`      | `string`                         | `undefined` | CSS class for form element           |

**Validate Modes:**

- `blur` - Validate and show errors after leaving field (default)
- `change` - Validate and show errors as soon as value changes
- `submit` - Validate and show all errors only after submit attempt

### `<Sfield>`

Smart field component with type-safe props based on input type.

#### Common Props (all types)

| Prop          | Type                      | Default     | Description                           |
| ------------- | ------------------------- | ----------- | ------------------------------------- |
| `field`       | `RemoteFormField`         | required    | Field from `fields` snippet parameter |
| `type`        | `InputType`               | required    | Input type                            |
| `label`       | `string`                  | `undefined` | Field label                           |
| `placeholder` | `string`                  | `undefined` | Placeholder text (text/password/etc)  |
| `disabled`    | `boolean`                 | `false`     | Disable the field                     |
| `readonly`    | `boolean`                 | `false`     | Make field readonly                   |
| `validateOn`  | `ValidateOn`              | inherited   | Override form validateOn              |
| `class`       | `SfieldClasses \| string` | `undefined` | CSS classes                           |
| `hint`        | `string \| Snippet`       | `undefined` | Help text shown below the field       |

#### Text Inputs

```svelte
<Sfield field={fields.email} type="email" label="Email" placeholder="you@example.com" />
<Sfield field={fields.search} type="search" label="Search" />
<Sfield field={fields.phone} type="tel" label="Phone" />
<Sfield field={fields.website} type="url" label="Website" prefix="https://" />
```

Supported text types: `text`, `email`, `tel`, `url`, `search`, `date`, `datetime-local`, `time`, `month`, `week`, `color`, `file`

| Prop     | Type                | Default     | Description          |
| -------- | ------------------- | ----------- | -------------------- |
| `prefix` | `string \| Snippet` | `undefined` | Content before input |
| `suffix` | `string \| Snippet` | `undefined` | Content after input  |

#### Password Input

```svelte
<Sfield field={fields._password} type="password" label="Password" />
<Sfield field={fields._password} type="password" label="Password" showToggle={false} />
<Sfield field={fields._password} type="password" label="Password">
	{#snippet showToggleIcon(passwordShown)}
		{#if passwordShown}
			🙈
		{:else}
			👁️
		{/if}
	{/snippet}
</Sfield>
```

| Prop             | Type                                | Default     | Description                        |
| ---------------- | ----------------------------------- | ----------- | ---------------------------------- |
| `showToggle`     | `boolean`                           | `true`      | Show eye icon to toggle visibility |
| `showToggleIcon` | `Snippet<[passwordShown: boolean]>` | `undefined` | Custom toggle icon snippet         |
| `prefix`         | `string \| Snippet`                 | `undefined` | Content before input               |
| `suffix`         | `string \| Snippet`                 | `undefined` | Content after input                |

#### Number Input

```svelte
<Sfield field={fields.age} type="number" label="Age" min={0} max={150} step={1} />
<Sfield field={fields.price} type="number" label="Price" prefix="$" suffix="USD" align="end" />
<Sfield field={fields.quantity} type="number" label="Qty" showControls={false} maxDecimals={0} />
```

| Prop           | Type                | Default     | Description                            |
| -------------- | ------------------- | ----------- | -------------------------------------- |
| `min`          | `number \| string`  | `undefined` | Minimum value                          |
| `max`          | `number \| string`  | `undefined` | Maximum value                          |
| `step`         | `number \| string`  | `undefined` | Step increment                         |
| `prefix`       | `string \| Snippet` | `undefined` | Content before input (e.g., "$")       |
| `suffix`       | `string \| Snippet` | `undefined` | Content after input (e.g., "USD")      |
| `showControls` | `boolean`           | `true`      | Show spinner controls                  |
| `align`        | `'start' \| 'end'`  | `'start'`   | Text alignment                         |
| `maxDecimals`  | `number`            | `undefined` | Max decimal places (0 = integers only) |
| `autocomplete` | `string`            | `undefined` | HTML autocomplete attribute            |

#### Textarea

```svelte
<Sfield field={fields.bio} type="textarea" label="Bio" placeholder="Tell us about yourself" />
<Sfield field={fields.notes} type="textarea" label="Notes" prefix="📝" suffix="(max 500 chars)" />
```

| Prop           | Type                | Default     | Description                 |
| -------------- | ------------------- | ----------- | --------------------------- |
| `prefix`       | `string \| Snippet` | `undefined` | Content before input        |
| `suffix`       | `string \| Snippet` | `undefined` | Content after input         |
| `autocomplete` | `string`            | `undefined` | HTML autocomplete attribute |

#### Select

```svelte
<Sfield
	field={fields.country}
	type="select"
	label="Country"
	options={[
		{ value: 'us', label: 'United States' },
		{ value: 'uk', label: 'United Kingdom' },
		{ value: 'ca', label: 'Canada' }
	]}
/>
```

| Prop      | Type                         | Default  | Description    |
| --------- | ---------------------------- | -------- | -------------- |
| `options` | `SelectOption[] \| string[]` | required | Select options |

#### Checkbox

```svelte
<Sfield field={fields.subscribe} type="checkbox" label="Subscribe to newsletter" />
```

#### Radio

```svelte
<Sfield
	field={fields.plan}
	type="radio"
	label="Plan"
	options={[
		{ value: 'free', label: 'Free' },
		{ value: 'pro', label: 'Pro' },
		{ value: 'enterprise', label: 'Enterprise' }
	]}
/>
```

| Prop      | Type                         | Default     | Description              |
| --------- | ---------------------------- | ----------- | ------------------------ |
| `options` | `SelectOption[] \| string[]` | `undefined` | Radio options for groups |

#### Range

```svelte
<Sfield field={fields.volume} type="range" label="Volume" min={0} max={100} step={5} showValue />
<Sfield
	field={fields.brightness}
	type="range"
	label="Brightness"
	min={0}
	max={100}
	formatValue={(v) => `${v}%`}
	showValue
/>
```

| Prop          | Type                        | Default     | Description            |
| ------------- | --------------------------- | ----------- | ---------------------- |
| `min`         | `number \| string`          | `0`         | Minimum value          |
| `max`         | `number \| string`          | `100`       | Maximum value          |
| `step`        | `number \| string`          | `1`         | Step increment         |
| `showValue`   | `boolean`                   | `false`     | Show current value     |
| `formatValue` | `(value: number) => string` | `undefined` | Format displayed value |

#### Toggle

```svelte
<Sfield field={fields.notifications} type="toggle" label="Enable Notifications" />
<Sfield field={fields.darkMode} type="toggle" label="Theme" onLabel="Dark" offLabel="Light" />
```

| Prop             | Type     | Default     | Description          |
| ---------------- | -------- | ----------- | -------------------- |
| `onLabel`        | `string` | `undefined` | Label when on        |
| `offLabel`       | `string` | `undefined` | Label when off       |
| `checkedValue`   | `string` | `'true'`    | Value when checked   |
| `uncheckedValue` | `string` | `'false'`   | Value when unchecked |

#### Toggle Options

```svelte
<Sfield
	field={fields.theme}
	type="toggle-options"
	label="Theme"
	options={[
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
		{ value: 'auto', label: 'Auto' }
	]}
/>
<!-- Multiple selection -->
<Sfield
	field={fields.features}
	type="toggle-options"
	label="Features"
	multiple={true}
	options={[
		{ value: 'push', label: 'Push Notifications' },
		{ value: 'email', label: 'Email' },
		{ value: 'sms', label: 'SMS' }
	]}
/>
```

| Prop       | Type                         | Default  | Description               |
| ---------- | ---------------------------- | -------- | ------------------------- |
| `options`  | `ToggleOption[] \| string[]` | required | Toggle options            |
| `multiple` | `boolean`                    | `false`  | Allow multiple selections |

#### Masked Input

```svelte
<Sfield field={fields.phone} type="masked" label="Phone" mask="(###) ###-####" />
<Sfield field={fields.creditCard} type="masked" label="Credit Card" mask="#### #### #### ####" />
<Sfield field={fields.ssn} type="masked" label="SSN" mask="###-##-####" />
<!-- Custom tokens -->
<Sfield
	field={fields.code}
	type="masked"
	label="Code"
	mask="AAAA-99-LL"
	tokens={{ A: /[A-Z]/, L: /[a-z]/ }}
/>
```

| Prop                  | Type                     | Default     | Description                      |
| --------------------- | ------------------------ | ----------- | -------------------------------- |
| `mask`                | `string`                 | required    | Mask pattern                     |
| `tokens`              | `Record<string, RegExp>` | `undefined` | Custom token definitions         |
| `maskPlaceholder`     | `string`                 | `'_'`       | Placeholder character            |
| `showMaskPlaceholder` | `boolean`                | `false`     | Show full mask with placeholders |
| `unmaskValue`         | `boolean`                | `true`      | Store unmasked value             |
| `prefix`              | `string \| Snippet`      | `undefined` | Content before input             |
| `suffix`              | `string \| Snippet`      | `undefined` | Content after input              |

**Mask Tokens:**

- `#` or `9` - Numeric (0-9)
- `a` - Alphabetic (a-z, A-Z)
- `A` - Alphabetic uppercase
- `*` - Alphanumeric

#### Hidden Input

```svelte
<Sfield field={fields.token} type="hidden" value={authToken} />
<Sfield field={fields.userId} type="hidden" value="12345" />
```

| Prop    | Type     | Default | Description                                      |
| ------- | -------- | ------- | ------------------------------------------------ |
| `value` | `string` | `''`    | The value for the hidden field (can be reactive) |

Hidden inputs are useful for including data in form submissions without displaying it to the user. The `value` prop is reactive, so you can update it programmatically:

```svelte
<script lang="ts">
	let token = $state(initialToken);

	async function refreshToken() {
		token = await getNewToken();
	}
</script>

<Sfield field={fields.token} type="hidden" value={token} />
```

### `<Sbutton>`

Stateful submit button that reacts to form state. Pass the `form` prop to enable typed result access.

```svelte
<Sbutton form={myForm} label="Submit" class="my-button" />

<!-- With custom state rendering -->
<Sbutton form={myForm} class="submit-btn">
	{#snippet children(state)}
		{#if state.state === 'pending'}
			Submitting...
		{:else if state.state === 'success'}
			✓ {state.result.message}
		{:else if state.state === 'hasIssues'}
			Fix Errors
		{:else}
			Submit Form
		{/if}
	{/snippet}
</Sbutton>
```

The `state` parameter is a discriminated union of type `ButtonState<T>` where `T` is inferred from the form's result type:

```typescript
type ButtonState<T = unknown> =
	| { state: 'default'; pending: false; success: false; hasIssues: false; result: undefined }
	| { state: 'pending'; pending: true; success: false; hasIssues: false; result: undefined }
	| { state: 'success'; pending: false; success: true; hasIssues: false; result: T }
	| { state: 'hasIssues'; pending: false; success: false; hasIssues: true; result: undefined };
```

#### Typed Result Access

The result type is automatically inferred from the `form` prop. When your remote function returns a typed result, you can access it directly:

```svelte
<script lang="ts">
	import { login } from './auth.remote'; // Returns { success: boolean; message: string }
</script>

<Sbutton form={login} class="submit-btn">
	{#snippet children(state)}
		{#if state.state === 'success'}
			{state.result.message} <!-- TypeScript knows this is string -->
		{:else if state.state === 'pending'}
			Logging in...
		{:else}
			Login
		{/if}
	{/snippet}
</Sbutton>
```

| Prop         | Type                              | Default     | Description                       |
| ------------ | --------------------------------- | ----------- | --------------------------------- |
| `form`       | `RemoteForm`                      | required    | Remote form for type inference    |
| `label`      | `string`                          | `'Submit'`  | Button text (when no children)    |
| `buttonType` | `'submit' \| 'reset' \| 'button'` | `'submit'`  | Button type                       |
| `class`      | `string`                          | `undefined` | CSS class                         |
| `disabled`   | `boolean`                         | `false`     | Disable button                    |
| `children`   | `Snippet<[ButtonState<T>]>`       | `undefined` | Custom content with typed state   |
| `onsubmit`   | `() => void \| Promise<void>`     | `undefined` | Callback before validation/submit |

### `<SIssues>`

Displays form-level issues and issues not shown by any Sfield component (e.g., hidden field issues or programmatic validation via `invalid()`).

```svelte
<SIssues message="There are some issues with your form:" />

<!-- With custom message snippet -->
<SIssues>
	{#snippet message()}
		<strong>⚠️ Please fix the following issues:</strong>
	{/snippet}
</SIssues>
```

| Prop        | Type                | Default               | Description                       |
| ----------- | ------------------- | --------------------- | --------------------------------- |
| `message`   | `string \| Snippet` | `undefined`           | General message shown when issues |
| `class`     | `string`            | `'sform-issues'`      | CSS class for wrapper             |
| `listClass` | `string`            | `'sform-issues-list'` | CSS class for issues list         |

The component filters issues to only show:

- Form-level issues (from `invalid("message")`)
- Field issues for hidden inputs (no Sfield displays them)
- Issues for fields without a corresponding Sfield

### `<SResult>`

Displays form result with typed access. Only renders when the form has a result. Pass the `form` prop to enable typed result access in the children snippet.

```svelte
<SResult form={myLogin} class="sform-result sform-result-success">
	{#snippet children(result)}
		{result.message}
	{/snippet}
</SResult>
```

The `result` parameter is typed based on your remote function's return type:

```svelte
<script lang="ts">
	import { login } from './auth.remote'; // Returns { success: boolean; message: string }
</script>

<SResult form={login} class="success-message">
	{#snippet children(result)}
		<!-- TypeScript knows result is { success: boolean; message: string } -->
		<h2>Welcome!</h2>
		<p>{result.message}</p>
	{/snippet}
</SResult>
```

| Prop       | Type           | Default     | Description                    |
| ---------- | -------------- | ----------- | ------------------------------ |
| `form`     | `RemoteForm`   | required    | Remote form for type inference |
| `children` | `Snippet<[T]>` | required    | Content with typed result      |
| `class`    | `string`       | `undefined` | CSS class for wrapper          |

The component only renders when `form.result !== undefined`, so the `result` parameter in the children snippet is guaranteed to be defined.

## Styling

### CSS Classes

Sfield adds these classes automatically:

- `.sform-field` - Wrapper element
- `.sform-label` - Label element
- `.sform-input` - Input element
- `.sform-messages` - Error messages container
- `.sform-field-error` - Added to wrapper when field has errors

### Custom Classes

```svelte
<!-- String class applies to wrapper -->
<Sfield field={fields.email} type="email" class="my-field" />

<!-- Object for granular control -->
<Sfield
	field={fields.email}
	type="email"
	class={{
		wrapper: 'field-wrapper',
		label: 'field-label',
		input: 'field-input',
		messages: 'field-errors'
	}}
/>
```

## Validation

Sform uses preflight validation with Valibot schemas. Native browser validation (required, minlength, pattern) is disabled to allow showing all errors at once on submit.

### Schema Example

```typescript
import * as v from 'valibot';

const signupSchema = v.object({
	email: v.pipe(v.string(), v.email('Please enter a valid email')),
	_password: v.pipe(
		v.string(),
		v.minLength(8, 'Password must be at least 8 characters'),
		v.regex(/[A-Z]/, 'Password must contain an uppercase letter'),
		v.regex(/[0-9]/, 'Password must contain a number')
	),
	age: v.pipe(v.number(), v.minValue(18, 'Must be at least 18 years old'))
});
```

## Type Safety

Sform uses TypeScript discriminated unions to provide type-safe props for each input type:

```typescript
// ✅ TypeScript knows 'showToggle' is only valid for password type
<Sfield field={fields._password} type="password" showToggle={false} />

// ✅ TypeScript knows 'options' is required for select type
<Sfield field={fields.country} type="select" options={countries} />

// ✅ TypeScript knows 'min', 'max', 'step' are valid for number type
<Sfield field={fields.age} type="number" min={0} max={150} />

// ❌ TypeScript error: 'showToggle' doesn't exist on text type
<Sfield field={fields.username} type="text" showToggle />
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build library
npm run package
```

## License

MIT
