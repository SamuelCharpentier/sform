import { metadata } from 'valibot';
import type { MetadataAction } from 'valibot';

/**
 * Helpers for declaring provider-facing HTML field names on local form schemas.
 *
 * `wireName()` produces a Valibot metadata action, so it can be passed to
 * `v.pipe(...)` alongside validations and read back without a remote function.
 */

export interface WireNameMetadata {
	wireName?: string;
	[key: string]: unknown;
}

/**
 * Attach a provider-facing name to a schema. The name is used verbatim as the
 * HTML `name` attribute for that field.
 *
 * @example
 * ```ts
 * const schema = v.object({
 * 	email: v.pipe(v.string(), wireName('EMAIL'), v.email())
 * });
 * ```
 */
export function wireName(name: string): MetadataAction<never, WireNameMetadata> {
	return metadata({ wireName: name }) as unknown as MetadataAction<never, WireNameMetadata>;
}

interface TraversableSchema {
	pipe?: unknown;
	wrapped?: unknown;
	schema?: unknown;
}

/**
 * Read metadata attached to a schema, mirroring `v.getMetadata()` without
 * requiring the schema to expose its internals.
 */
export function readMetadata(schema: unknown): WireNameMetadata {
	const result: WireNameMetadata = {};

	function visit(candidate: unknown): void {
		if (!candidate || typeof candidate !== 'object') return;

		const traversable = candidate as TraversableSchema;

		if (Array.isArray(traversable.pipe)) {
			for (const item of traversable.pipe) {
				if (!item || typeof item !== 'object') continue;

				const entry = item as {
					kind?: string;
					type?: string;
					metadata?: WireNameMetadata;
				};

				if (entry.kind === 'metadata' && entry.type === 'metadata' && entry.metadata) {
					Object.assign(result, entry.metadata);
				} else {
					visit(entry);
				}
			}
		}

		visit(traversable.wrapped);
	}

	visit(schema);
	return result;
}

export function getWireName(schema: unknown): string | undefined {
	return readMetadata(schema).wireName;
}
