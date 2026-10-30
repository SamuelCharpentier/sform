# Sform Local Mode — schema-driven forms without remote functions

## Goal

Let Sform render and validate a form using **only a Valibot/StandardSchema**, with no `.remote.ts` file, no `/_/remote/*` endpoints, and a real native `<form action="https://provider/...">` that works with JavaScript disabled. Ships as a new subpath entry point (`@samuel-charpentier/sform/local`) exposing `<SformLocal>` + `createForm()`, reusing the existing `Sfield`/`Sbutton`/`SIssues` components.

## Findings that shape the design

1. **Runtime coupling to remote functions is one prop.** Only `Sform.svelte:8` and `types.ts:19` import `@sveltejs/kit`, both type-only. Every runtime call goes through the `form` prop:
   - `form.validate({ includeUntouched, preflightOnly })` — `Sform.svelte:75`
   - `form.preflight(schema)` — `Sform.svelte:110`
   - `form.enhance(cb)` — `Sform.svelte:125`
   - `Object.keys(form.fields)` minus `value|set|allIssues` — `Sform.svelte:64`
   - `form.pending`, `form.result`, `form.fields.allIssues()` — `context.svelte.ts:133-189`
   - per field: `field.as(type, value?, checked?)`, `field.value()`, `field.set(v)`, `field.issues()` — all `inputs/*.svelte`
   - `fields.groups[index].as('hidden', v)` (array-of-hidden pattern used in `src/routes/async/+page.svelte:47`)
2. **Field names are not plain HTML names.** Kit's `create_field_proxy` emits `name = <prefix><path><[]>/<formId>` where `formId` is a hash of the `.remote` file, plus `n:`/`b:` type prefixes (`packages/kit/src/runtime/form-utils.js`). A provider endpoint expecting `EMAIL`/`FNAME` will not receive them unless we control naming.
3. **Remote functions need a server at request time.** `form.action` is `?/remote=<id>`; on `adapter-static` there is no handler → SSR/no-JS submit 404s. Also `adapter-static` strict mode fails the build if any route is not prerenderable. So "no remote function" is not just an API preference — it is required for the cPanel target.
4. **Kit already has an open request for exactly this** ([sveltejs/kit#15136](https://github.com/sveltejs/kit/issues/15136)): client-only preflight without a remote function. Today the only emulation is a dummy `.remote.ts` + `form.preflight(schema).enhance(cb)`, which still requires a Node server. Do **not** plan on Kit solving it in the timeframe of the static site.
5. **`preflightOnly` does not remove the server dependency.** It only skips the server leg inside `validate()`; the form object still comes from `$app/server`.
6. **SSR validation is impossible for local mode.** Validation reads live `FormData` from the attached element (`form.validate()` returns early when `!element`). So first-render issues can never appear without JS. This matches the requirement (JS = validation; no-JS = plain POST) but must be documented.

## Decisions (agreed)

- Capability lives in **this library**, as optional local mode.
- Exposed via a **new entry point / `<SformLocal>` wrapper** exporting the shared input components, so the remote peer dep stays genuinely optional and tree-shakeable.
- no-JS behavior = **real native POST to the provider URL**.
- Naming/mapping is **part of what `createForm()` takes in**, hand-in-hand with the schema and field types — same ergonomics as a remote form.

## Architecture

Three pieces, none of which reimplement rendering or validation UX:

### A. `local-field-proxy` — port of Kit's `create_field_proxy` with controlled names

Pure function over a `FieldContext` (`get`, `set`, `get_issues`, `get_touched`, `get_dirty`) mirroring `form-utils.js`, so `field.as(...)`, `field.value()`, `field.set(...)`, `field.issues()`, `field.touched()`, `field.dirty()` behave identically. Differences from Kit, deliberate:

- `name` = `prefix + mappedName(path) + arraySuffix` with **no `/<formId>` suffix**.
- Name mapping resolved from schema metadata first, explicit map second:
  - `v.title(...)` → display label (already used this way in `src/routes/async/+page.svelte:28`)
  - new metadata transform (see D) or `createForm` option → wire name (`EMAIL`, `FNAME`, …)
  - fallback → schema key
- Type prefixes (`n:`, `b:`) are **opt-out** via `encodeTypes: false` (default `false` for local mode) so raw HTML names stay clean; coercion then happens by reading the DOM value, not the name prefix.
- Prototype-pollution guards, nested paths, and `[index]` array access copied from Kit.

### B. `createForm(schema, options)` — factory returning a `LocalForm`

Reactive (`$state.raw` input/issues, `$derived` flatten), self-subscribing (mirrors Kit's `instance[createAttachmentKey()]` attach protocol so `{...form}` spread onto `<form>` wires `submit`/`input`/`focusout`/`reset` listeners). Surface consumed by the components:

```ts
interface LocalForm<Input, Output> {
  method: 'GET' | 'POST';            // POST default
  action: string;                     // provider URL; REQUIRED for no-JS submit
  enctype?: string;                   // 'application/x-www-form-urlencoded' default
  element: HTMLFormElement | null;
  fields: LocalFields<Input>;         // proxy incl. allIssues()
  pending: number;                    // 0 during native submit (browser owns it)
  result: Output | undefined;         // set by onSuccess/onError
  submitted: boolean;
  preflight(schema): this;            // no-op, parity with RemoteForm
  validate(opts?): Promise<void>;     // preflight schema only; never network
  enhance(cb): this;                  // sets internal intercept callback
  submit(): Promise<boolean>;         // programmatic
}
```

Submit semantics (the crux):

- `validate()` runs the StandardSchema against converted data and writes client issues; **no server branch exists**.
- On native `submit`: run `validate()`. If invalid → always `preventDefault()` (this is how "preflight prevents submission" is reproduced). If valid →
  - `enhance`/`onSubmit` provided → `preventDefault()` and hand over control (`{ form: element, data, submit }`), matching `EnhanceCallbackOptions` shape minus `updates()`.
  - otherwise → **do nothing**: let the browser perform the real native POST to `action`. This is what makes no-JS and JS identical in outcome, with JS additionally having caught bad input first.
- Data conversion: reuse the same FormData→POJO logic as Kit, but coerce by declared schema key type instead of name prefix. Booleans from unchecked checkboxes stay absent → require `v.optional(v.boolean(), false)` in schemas (same constraint Kit documents).

### C. `SformLocal.svelte` — thin sibling of `Sform.svelte`

Same props minus remote-only ones (`schema` becomes required; `preflightOnly` dropped because there is no other leg). Provides the **existing** context (`createSformContext`) unchanged, so `Sfield`, `Sbutton`, `SIssues`, `SResult` work verbatim. Renders `<form {...form}>` **without** `novalidate` (see E).

The current `Sform.svelte` body should be extracted into a shared internal (`SformCore.svelte` or a `useSformEngine()` helper in `context.svelte.ts`) taking `{ getInstance, getSchema, preflightOnly }` so the two entry points do not drift. Keep `Sform.svelte`'s public API byte-identical.

### D. Wire-name declaration

Add to `types.ts` a `LocalFormOptions` accepting either:

```ts
createForm(submitSchema, {
  action: 'https://provider/subscribe',
  method: 'POST',
  names: { email: 'EMAIL', first_name: 'FNAME', groups: 'GROUPS' },
  hidden: { source: 'site-footer', double_opt_in: 'yes' } // extra non-schema inputs
})
```

plus a `wireName(name)` valibot metadata transform for colocated definitions (`v.pipe(v.string(), v.wireName('EMAIL'), v.email())`) read via `v.getMetadata`. Precedence: explicit `names` > `v.wireName` > schema key. `hidden` renders provider fields that are in the POST but not validated by the user — needed for real mailing-list endpoints.

### E. Native browser validation conflict (must resolve explicitly)

`Sform.svelte:173` hardcodes `novalidate`, disabling built-in `type=email`/`required` checks. For the no-JS path that is a regression versus a plain HTML form: with JS off, `novalidate` means the provider gets whatever was typed. Options:

- **Chosen:** `SformLocal` defaults `novalidate` **off** (native constraints active as the no-JS safety net) and exposes `novalidate?: boolean` to opt out. Schema remains the JS-side authority and shows all errors at once; native UI feedback stays suppressed while JS is running by keeping `aria-invalid` handling as-is.
- Document that consumers who want strictly schema-only messages pass `novalidate`.

This is the only place where local mode intentionally diverges from remote-mode behavior, and it is required by the no-JS requirement.

## Tasks

1. `src/lib/Sform/local/field-proxy.ts` — port Kit `create_field_proxy`/`normalize_issue`/`flatten_issues`/`build_path_string` semantics with the naming rules above. Pure, unit-testable in the `server` vitest project.
2. `src/lib/Sform/local/create-form.svelte.ts` — `createForm()` factory: reactive state, attach protocol, `validate`, `enhance`, `submit`, native-submit passthrough, FormData conversion + type coercion.
3. Extract the shared engine out of `Sform.svelte` (context wiring, lifecycle hooks, `handleInput`/`handleSubmit`, `resetOnSuccess` effect, `disabled` guards) into an internal module used by both entry points. Verify `Sform.svelte.spec.ts` and `exports.svelte.spec.ts` still pass unmodified.
4. `src/lib/Sform/local/SformLocal.svelte` — props per C, `novalidate` default flipped, provides existing context, renders children snippet with typed `fields`.
5. Wire-name support: `v.wireName()` metadata transform + `names`/`hidden` options resolution in `createForm`; hidden provider inputs rendered via existing `HiddenInput`.
6. Types: `LocalForm`, `LocalFields`, `LocalFormOptions`, `AllowedSfieldType` parity. Local mode must type `fields.<key>` off `StandardSchemaV1.InferInput<Schema>` — reuse the same discriminated-union machinery in `types.ts` so `TypedSfieldProps` keeps enforcing `type` vs value type. Note Kit's rule that all booleans in a form schema must be optional; mirror it in the local type.
7. Subpath exports in `package.json` (`./local` → `./dist/local/index.js` + `.d.ts`) and `src/lib/Sform/local/index.ts`. Keep `@sveltejs/kit` as a **devDependency + optional peer** (`peerDependenciesMeta: { "@sveltejs/kit": { optional: true } }`) — currently it is only a devDep, which already works, but declaring it optional makes the local-only install honest. `@standard-schema/spec` must move to `dependencies` (it is imported by `types.ts`/`Sform.svelte` today but is not a declared dep).
8. Demo route in this repo proving the no-JS path: `src/routes/local/+page.svelte` posting to a throwaway endpoint (e.g. `https://httpbin.org/post`) with `prerender = true` kept off-dev-dependency by using the existing adapter. Add a README section "Local mode (no remote functions)" with the cPanel/`adapter-static` recipe.
9. Tests: field-proxy naming/coercion (server project); `SformLocal` validation-on-blur, block-on-invalid, passthrough-on-valid (assert `submit` event NOT prevented when valid), `SIssues`, `Sbutton` states, `disabled` form freeze parity; a test asserting `@sveltejs/kit` is never imported at runtime by the `local` entry (import-graph or mock check).
10. Docs: update `README.md` — Requirements section must stop saying "SvelteKit with remoteFunctions: true" as unconditional; add the two-mode table and the no-JS contract.

## Risks / edge cases

- **Hydration**: local mode has no server-restored `result`/`issues`. On a prerendered page the form always starts clean. Expected, but state it.
- **`pending` during native submit**: the browser navigates away; `Sbutton` pending state is effectively unusable for the passthrough path. Only `enhance`/`onSubmit` flows get real pending/result. Consumers wanting an inline success message without navigation must use `onSubmit` + `fetch` — which then requires CORS acceptance at the provider (many mailing-list endpoints are form-POST-only and redirect instead of returning JSON). Flag this per-provider before choosing.
- **Duplicate-name error parity**: Kit throws on >1 value for a non-array field in DEV. Port the check so misuse surfaces the same way.
- **File inputs**: `uncheck`/`DELETE_KEY` semantics and `multipart/form-data` are easy to get wrong. Out of scope for the mailing-list case; keep `type="file"` supported for values but do not implement binary serialization (no server anyway).
- **`adapter-static` + `prerender`**: the consuming site must prerender every route, and `trailingSlash`/`fallback` need setting for cPanel/Apache. Not part of this library change but part of the deliverable recipe.
- **Drift from Kit**: the field proxy is a vendored reimplementation. Keep a header comment naming the Kit source file and version so future Kit changes are traceable.
- Upstreaming: worth opening a small PR/comment on Kit #15136 later; do not block on it.

## Validation

- `npm test` (both vitest projects) green, including untouched `Sform.svelte.spec.ts`.
- `npm run check` clean.
- `npm run lint` and `npm run prepack` (publint) clean — publint specifically validates the new subpath exports.
- Manual no-JS proof on the demo route: disable JS in the browser, submit, confirm a real POST arrives at the endpoint with exactly the provider's expected field names and no `/<hash>` suffix. Then with JS enabled: confirm invalid submit is blocked with all issues shown, valid submit passes through natively.
- Bundle proof: build the demo importing only `/local` and assert no `/_/remote` manifest entries and no `$app/server` in the client chunk.

## Open questions

1. Does the actual mailing-list provider accept a plain cross-origin form POST (redirect response), or does it require an AJAX/JSON API? This decides whether the no-navigation `onSubmit` path is even available, and therefore whether `Sbutton` pending/success states are meaningful in local mode. Need the provider name/snippet.
2. Should `SformLocal` also support `method="GET"` query-param submits (some providers use GET with query strings)? Cheap to add now, annoying later. Recommend yes.
3. Confirm you want the shared-engine extraction (Task 3) rather than a duplicated `SformLocal.svelte`. Extraction costs more up front, prevents divergence; duplication ships faster.
