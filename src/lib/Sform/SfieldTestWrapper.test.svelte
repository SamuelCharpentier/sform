<script lang="ts">
	import Sfield from './Sfield.svelte';
	import { createSformContext } from './context.svelte.js';
	import type { Snippet, Component } from 'svelte';
	import type {
		InputType,
		RemoteFormField,
		RemoteFormFieldValue,
		SelectOption,
		SfieldClasses
	} from './types.js';
	import type { SformContext, SformLifecycleHooks } from './types.js';

	// For testing purposes, we use a flexible Props interface
	// The actual type safety is enforced by the real Sfield component and TypedSfieldProps
	interface Props {
		type: InputType;
		field: RemoteFormField<RemoteFormFieldValue>;
		label?: string;
		hint?: string | Snippet;
		class?: string | SfieldClasses;
		options?: SelectOption[];
		min?: number;
		max?: number;
		issueDisplay?: 'auto' | 'field' | 'form' | 'none';
		forceShowIssues?: boolean;
		onTouched?: () => void;
		onDirty?: () => void;
		lifecycle?: SformLifecycleHooks;
		onContext?: (ctx: SformContext) => void;
	}

	let {
		type,
		field,
		label,
		hint,
		class: className,
		options,
		min,
		max,
		issueDisplay,
		forceShowIssues = false,
		onTouched,
		onDirty,
		lifecycle,
		onContext
	}: Props = $props();

	// Create context
	const ctx = createSformContext(
		() => 'blur',
		() => [],
		() => {},
		() => {},
		() => ({ fields: { allIssues: () => [] } })
	);

	$effect(() => {
		onContext?.(ctx);
	});

	$effect(() => {
		if (!lifecycle) return;
		return ctx.registerLifecycleHooks(lifecycle);
	});

	// If forceShowIssues, mark field as touched so issues display
	$effect(() => {
		if (forceShowIssues) {
			const name = (field as { as: (type: string) => { name: string } }).as('text').name;
			ctx.markTouched(name);
		}
	});

	// Track touch and dirty for test callbacks
	const originalMarkTouched = ctx.markTouched;
	const originalMarkDirty = ctx.markDirty;

	ctx.markTouched = (name: string) => {
		originalMarkTouched(name);
		onTouched?.();
	};

	ctx.markDirty = (name: string) => {
		originalMarkDirty(name);
		onDirty?.();
	};

	// Cast Sfield to allow test-only prop flexibility.
	const TestSfield = Sfield as Component<Record<string, unknown>>;
</script>

<div data-testid="sfield-wrapper">
	<TestSfield
		{type}
		{field}
		{label}
		{hint}
		class={className}
		{options}
		{min}
		{max}
		{issueDisplay}
	/>
</div>
