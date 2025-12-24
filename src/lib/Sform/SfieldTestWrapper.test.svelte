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
		forceShowIssues?: boolean;
		onTouched?: () => void;
		onDirty?: () => void;
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
		forceShowIssues = false,
		onTouched,
		onDirty
	}: Props = $props();

	// Create context
	const ctx = createSformContext(
		() => 'blur',
		() => [],
		() => {},
		() => {}
	);

	// If forceShowIssues, mark field as touched so issues display
	$effect(() => {
		if (forceShowIssues) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const name = (field as any).as('text').name;
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

	// Cast Sfield to allow any props for testing flexibility
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const TestSfield = Sfield as Component<any>;
</script>

<div data-testid="sfield-wrapper">
	<TestSfield {type} {field} {label} {hint} class={className} {options} {min} {max} />
</div>
