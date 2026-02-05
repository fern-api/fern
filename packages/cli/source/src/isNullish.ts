import { SourcedNullish } from "./Sourced";

/**
 * Type guard that checks if a sourced value is nullish (null, undefined, or SourcedNullish).
 *
 * This distinguishes between:
 * - `undefined` - field is missing from YAML
 * - `SourcedNullish` - field is explicitly null in YAML
 * - `SourcedString`/`SourcedNumber`/`SourcedBoolean`/`SourcedObject`/`SourcedArray` - field has actual content
 */
export function isNullish<T>(
    value: T | SourcedNullish<null | undefined> | null | undefined
): value is SourcedNullish<null | undefined> | null | undefined {
    return value == null || value instanceof SourcedNullish;
}
