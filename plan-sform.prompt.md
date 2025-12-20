# Plan: Sform — Remote-First Svelte Form Library

Build a minimal, remote-functions-first form library with `<Sform>` and `<Sfield>` components that wrap SvelteKit's remote `form()` API, handling field state tracking (dirty/touched) and conditional issue display while leaving validation entirely to the remote form's preflight/server validation.

---

## Code Style

- **No inline comments** — no `// this does X` explanations; code should be self-documenting
- **JSDoc allowed** — `/** */` comments for types and public APIs are encouraged for IDE support
- **Short functions** — each function does one thing
- **Uniform abstraction** — functions stay at a single level of abstraction
- **Clean code** — readable, maintainable by humans
- **Descriptive names** — variables, functions, and types explain themselves

---

## Steps

### 1. Create form context and state system

**File:** `src/lib/Sform/context.svelte.ts`

- Use `$state` objects with `SvelteSet`/`SvelteMap` for per-field tracking (`touched`, `dirty`, `displayIssues`)
- Expose registration/state-update functions via Context API
- Store reference to the remote form object for field lookups

### 2. Build `<Sform>` wrapper

**File:** `src/lib/Sform/Sform.svelte`

- Accepts a remote form object via prop
- Spreads `{...form}` or `{...form.preflight(schema)}` on the `<form>` element
- Provides context to children
- Calls `form.validate()` on input changes
- Configures default validation visibility mode (`blur` | `change` | `submit`)

### 3. Build `<Sfield>` wrapper

**File:** `src/lib/Sform/Sfield.svelte`

- Accepts `type` prop to render internal input components
- Accepts `name` prop to lookup `form.fields[name]` from context
- Tracks `onblur`/`oninput` for touched/dirty state
- Conditionally renders `field.issues()` based on `displayIssues` derived from field state and form-level visibility config
- Supports field-level visibility override via prop

### 4. Create internal input components

**Directory:** `src/lib/Sform/inputs/`

- `TextInput.svelte`, `SelectInput.svelte`, etc.
- Each component receives props from `<Sfield>`
- Uses `{...field.as('type')}` spreading
- Emits events for state tracking
- **Not exported publicly** — implementation detail

### 5. Design class-name pass-through system

- Use a `class` prop on `<Sfield>` with optional sub-props:
  ```svelte
  <Sfield class={{ wrapper: '...', label: '...', input: '...', messages: '...' }} />
  ```
- Alternatively, CSS custom properties for simpler cases
- For complex inputs, limit customization to top-level sections and let users target internals via CSS descendant selectors

### 6. Export public API

**File:** `src/lib/Sform/index.ts`

- Export only `Sform`, `Sfield`, and TypeScript types
- Internal inputs remain private

---

## Open Questions

### Q1: Validation visibility default?

| Option   | Behavior                          | Pros                    | Cons                      |
| -------- | --------------------------------- | ----------------------- | ------------------------- |
| `blur`   | Show issues after leaving field   | Balanced UX, less noise | Slight delay in feedback  |
| `change` | Show issues on every keystroke    | Immediate feedback      | Can be noisy/overwhelming |
| `submit` | Show all issues only after submit | Cleanest initial UX     | Delayed feedback          |

**Recommendation:** Default to `blur`, allow override at form and field level.

### Q2: How should `<Sfield>` reference its field?

| Option | API                                  | Pros                        | Cons                    |
| ------ | ------------------------------------ | --------------------------- | ----------------------- |
| A      | `<Sfield name="email">`              | Cleaner DX, less repetition | Requires context lookup |
| B      | `<Sfield field={form.fields.email}>` | Explicit, flexible          | More verbose            |
| Both   | Support both patterns                | Maximum flexibility         | More code to maintain   |

**Recommendation:** Option A as primary, Option B for edge cases.

### Q3: Support HTML5 native validation attributes?

Should we pass through `required`, `minlength`, `pattern` for instant browser feedback alongside remote validation?

**Recommendation:** Yes, as pass-through props — they complement remote validation with zero JS.

---

## File Structure

```
src/lib/Sform/
├── index.ts              # Public exports (Sform, Sfield, types)
├── Sform.svelte          # Form wrapper component
├── Sfield.svelte         # Field wrapper component
├── context.svelte.ts     # Form context and state management
├── types.ts              # TypeScript types
└── inputs/               # Internal input components (not exported)
    ├── TextInput.svelte
    ├── SelectInput.svelte
    ├── CheckboxInput.svelte
    └── ...
```

---

## Example Usage

```svelte
<script>
	import { Sform, Sfield } from '$lib/Sform';
	import { createPost } from './data.remote';
</script>

<Sform form={createPost} visibility="blur">
	<Sfield name="title" type="text" label="Title" />
	<Sfield name="content" type="textarea" label="Content" />
	<Sfield name="category" type="select" label="Category" options={categories} />

	<button>Submit</button>
</Sform>
```

With class customization:

```svelte
<Sfield
	name="email"
	type="text"
	label="Email"
	class={{
		wrapper: 'field-group',
		label: 'field-label',
		input: 'field-input',
		messages: 'field-errors'
	}}
/>
```
