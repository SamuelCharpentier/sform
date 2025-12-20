# Sform

A type-safe form library for **Svelte 5** with **SvelteKit remote functions**.

## Features

- ✅ **Type-safe** - Discriminated union types for each input type
- ✅ **Preflight validation** - All errors shown on submit, not one at a time
- ✅ **Visibility modes** - `blur`, `dirty`, `submit`, or `always`
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
npm install
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
	import { Sform, Sfield, Sbutton } from '$lib';
	import { login } from './auth.remote.ts';
</script>

<Sform form={login} visibility="blur">
	<Sfield name="username" type="text" label="Username" />
	<Sfield name="_password" type="password" label="Password" />

	<Sbutton label="Login" />
</Sform>
```

## Components

### `<Sform>`

Wrapper component that provides form context to all child fields.

```svelte
<Sform form={remoteForm} visibility="blur" class="my-form">
	<!-- Sfield components here -->
</Sform>
```

| Prop         | Type                            | Default     | Description                          |
| ------------ | ------------------------------- | ----------- | ------------------------------------ |
| `form`       | `RemoteForm`                    | required    | Remote form object from `form()` API |
| `visibility` | `'blur' \| 'dirty' \| 'submit'` | `'blur'`    | When to show validation errors       |
| `class`      | `string`                        | `undefined` | CSS class for form element           |

**Visibility Modes:**

- `blur` - Show errors after leaving field (default)
- `dirty` - Show errors as soon as value changes
- `submit` - Show all errors only after submit attempt

### `<Sfield>`

Smart field component with type-safe props based on input type.

#### Common Props (all types)

| Prop          | Type                      | Default     | Description                    |
| ------------- | ------------------------- | ----------- | ------------------------------ |
| `name`        | `string`                  | required    | Field name (must match schema) |
| `type`        | `InputType`               | required    | Input type                     |
| `label`       | `string`                  | `undefined` | Field label                    |
| `placeholder` | `string`                  | `undefined` | Placeholder text               |
| `disabled`    | `boolean`                 | `false`     | Disable the field              |
| `readonly`    | `boolean`                 | `false`     | Make field readonly            |
| `visibility`  | `VisibilityMode`          | inherited   | Override form visibility       |
| `class`       | `SfieldClasses \| string` | `undefined` | CSS classes                    |

#### Text Inputs

```svelte
<Sfield name="email" type="email" label="Email" placeholder="you@example.com" />
<Sfield name="search" type="search" label="Search" />
<Sfield name="phone" type="tel" label="Phone" />
<Sfield name="website" type="url" label="Website" />
```

Supported text types: `text`, `email`, `tel`, `url`, `search`, `date`, `datetime-local`, `time`, `month`, `week`, `color`, `file`, `hidden`

#### Password Input

```svelte
<Sfield name="_password" type="password" label="Password" />
<Sfield name="_password" type="password" label="Password" showToggle={false} />
```

| Prop         | Type      | Default | Description                        |
| ------------ | --------- | ------- | ---------------------------------- |
| `showToggle` | `boolean` | `true`  | Show eye icon to toggle visibility |

#### Number Input

```svelte
<Sfield name="age" type="number" label="Age" min={0} max={150} step={1} />
```

| Prop   | Type               | Default     | Description    |
| ------ | ------------------ | ----------- | -------------- |
| `min`  | `number \| string` | `undefined` | Minimum value  |
| `max`  | `number \| string` | `undefined` | Maximum value  |
| `step` | `number \| string` | `undefined` | Step increment |

#### Textarea

```svelte
<Sfield name="bio" type="textarea" label="Bio" placeholder="Tell us about yourself" />
```

#### Select

```svelte
<Sfield
	name="country"
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
<Sfield name="subscribe" type="checkbox" label="Subscribe to newsletter" />
```

#### Radio

```svelte
<Sfield
	name="plan"
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
<Sfield name="volume" type="range" label="Volume" min={0} max={100} step={5} showValue />
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
<Sfield name="notifications" type="toggle" label="Enable Notifications" />
<Sfield name="darkMode" type="toggle" label="Theme" onLabel="Dark" offLabel="Light" />
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
	name="theme"
	type="toggle-options"
	label="Theme"
	options={[
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
		{ value: 'auto', label: 'Auto' }
	]}
/>
```

| Prop       | Type                         | Default  | Description               |
| ---------- | ---------------------------- | -------- | ------------------------- |
| `options`  | `ToggleOption[] \| string[]` | required | Toggle options            |
| `multiple` | `boolean`                    | `false`  | Allow multiple selections |

#### Masked Input

```svelte
<Sfield name="phone" type="masked" label="Phone" mask="(###) ###-####" />
<Sfield name="creditCard" type="masked" label="Credit Card" mask="#### #### #### ####" />
<Sfield name="ssn" type="masked" label="SSN" mask="###-##-####" />
```

| Prop                  | Type      | Default  | Description                      |
| --------------------- | --------- | -------- | -------------------------------- |
| `mask`                | `string`  | required | Mask pattern                     |
| `maskPlaceholder`     | `string`  | `'_'`    | Placeholder character            |
| `showMaskPlaceholder` | `boolean` | `false`  | Show full mask with placeholders |
| `storeRaw`            | `boolean` | `true`   | Store unmasked value             |

**Mask Tokens:**

- `#` or `9` - Numeric (0-9)
- `a` - Alphabetic (a-z, A-Z)
- `A` - Alphabetic uppercase
- `*` - Alphanumeric

### `<Sbutton>`

Stateful submit button that reacts to form state.

```svelte
<Sbutton label="Submit" class="my-button" />

<!-- With custom state snippets -->
<Sbutton class="submit-btn">
	{#snippet defaultState(state)}
		Submit Form
	{/snippet}
	{#snippet pendingState(state)}
		Submitting...
	{/snippet}
	{#snippet successState(state)}
		✓ Success!
	{/snippet}
	{#snippet errorState(state)}
		Fix Errors
	{/snippet}
</Sbutton>
```

| Prop           | Type                              | Default     | Description           |
| -------------- | --------------------------------- | ----------- | --------------------- |
| `label`        | `string`                          | `'Submit'`  | Button text           |
| `buttonType`   | `'submit' \| 'reset' \| 'button'` | `'submit'`  | Button type           |
| `class`        | `string`                          | `undefined` | CSS class             |
| `disabled`     | `boolean`                         | `false`     | Disable button        |
| `defaultState` | `Snippet`                         | `undefined` | Default state snippet |
| `pendingState` | `Snippet`                         | `undefined` | Pending state snippet |
| `successState` | `Snippet`                         | `undefined` | Success state snippet |
| `errorState`   | `Snippet`                         | `undefined` | Error state snippet   |

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
<Sfield name="email" type="email" class="my-field" />

<!-- Object for granular control -->
<Sfield
	name="email"
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
<Sfield name="_password" type="password" showToggle={false} />

// ✅ TypeScript knows 'options' is required for select type
<Sfield name="country" type="select" options={countries} />

// ✅ TypeScript knows 'min', 'max', 'step' are valid for number type
<Sfield name="age" type="number" min={0} max={150} />

// ❌ TypeScript error: 'showToggle' doesn't exist on text type
<Sfield name="username" type="text" showToggle />
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

Go into the `package.json` and give your package the desired name through the `"name"` option. Also consider adding a `"license"` field and point it to a `LICENSE` file which you can create from a template (one popular option is the [MIT license](https://opensource.org/license/mit/)).

To publish your library to [npm](https://www.npmjs.com):

```sh
npm publish
```
