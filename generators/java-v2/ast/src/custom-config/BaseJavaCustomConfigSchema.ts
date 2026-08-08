import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema.js";

export const BaseJavaCustomConfigSchema = z.object({
    // Influences dynamic snippets.
    "base-api-exception-class-name": z.string().optional(),
    "base-exception-class-name": z.string().optional(),
    "client-class-name": z.string().optional(),
    "exported-client-class-name": z.string().optional(),
    "inline-file-properties": z.boolean().optional(),
    "inline-path-parameters": z.boolean().optional(),
    "package-layout": z.enum(["flat", "nested"]).optional(),
    "package-prefix": z.string().optional(),
    "use-local-date-for-dates": z.boolean().optional(),

    // General options.
    "custom-dependencies": z.array(z.string()).optional(),
    "custom-plugins": z.array(z.string()).optional(),
    "disable-required-property-builder-checks": z.boolean().optional(),
    "enable-forward-compatible-enums": z.boolean().optional(),
    "enable-inline-types": z.boolean().optional(),
    "enable-public-constructors": z.boolean().optional(),
    "generate-unknown-as-json-node": z.boolean().optional(),
    "json-include": z.enum(["non-absent", "non-empty"]).optional(),
    "enable-extensible-builders": z.boolean().optional(),
    "use-default-request-parameter-values": z.boolean().optional(),
    "enable-wire-tests": z.boolean().default(false),

    // Nullable/optional representation options (mutually exclusive):
    //   collapse-optional-nullable: optional<nullable<T>> (and standalone nullable<T>) collapses to
    //     a single OptionalNullable<T> wrapper.
    //   use-nullable-annotation: nullable<T> is emitted as the raw type T annotated with @Nullable
    //     (no Optional wrapper). Mirrors v1 behaviour when the Java @Nullable annotation is preferred.
    "collapse-optional-nullable": z.boolean().optional(),
    "use-nullable-annotation": z.boolean().optional(),
    "custom-readme-sections": z.array(CustomReadmeSectionSchema).optional(),
    "custom-pager-name": z.string().optional(),
    "offset-semantics": z.enum(["item-index", "page-index"]).optional(),
    // The default network timeout, expressed as a java.time.Duration. The unit is intentionally
    // omitted from the key name because Duration is the idiomatic Java representation. Accepts a
    // number of seconds, an ISO-8601 duration string (e.g. "PT30S"), or the literal "infinity" to
    // disable the timeout.
    "default-timeout": z.union([z.number(), z.string()]).optional(),
    "gradle-distribution-url": z.string().optional(),
    "gradle-plugin-management": z.string().optional(),
    "gradle-central-dependency-management": z.boolean().optional(),
    "output-directory": z.enum(["source-root", "project-root"]).optional(),
    "custom-interceptors": z.boolean().optional(),
    "omit-fern-headers": z.boolean().optional(),
    includePlatformHeaders: z.boolean().optional(),
    "retry-status-codes": z.optional(z.enum(["legacy", "recommended"])),

    // Hidden options (for debugging).
    "enable-gradle-profiling": z.boolean().optional(),

    // Deprecated.
    "wrapped-aliases": z.boolean().optional(),
    maxRetries: z.number().int().min(0).optional(),
    // Deprecated: use "default-timeout" instead. Retained for backwards compatibility; when set (and
    // "default-timeout" is not) its value is interpreted as a number of seconds.
    "default-timeout-in-seconds": z.number().optional()
});

export type BaseJavaCustomConfigSchema = z.infer<typeof BaseJavaCustomConfigSchema>;

const DEFAULT_TIMEOUT_IN_SECONDS = 60;
const INFINITY = "infinity";

/**
 * The resolved `default-timeout`: either a finite number of whole seconds or `"infinity"` (which
 * disables the timeout). This mirrors the v1 (Java) `DefaultTimeout` value type so both generators
 * stay aligned.
 */
export type ResolvedDefaultTimeout = { type: "infinity" } | { type: "seconds"; seconds: number };

/**
 * Parses a `default-timeout` value into whole seconds or `"infinity"`. Accepts a plain number of
 * seconds, a numeric string, an ISO-8601 duration string (e.g. `"PT30S"`, `"PT1M30S"`, `"P1DT2H"`), or
 * the literal `"infinity"` to disable the timeout. Sub-second precision is truncated toward zero to
 * mirror `java.time.Duration#getSeconds`, which the v1 generator uses. Returns `undefined` when the
 * value cannot be parsed.
 */
export function parseDefaultTimeout(value: number | string): ResolvedDefaultTimeout | undefined {
    if (typeof value === "number") {
        return Number.isFinite(value) ? { type: "seconds", seconds: Math.trunc(value) } : undefined;
    }
    const trimmed = value.trim();
    if (trimmed.toLowerCase() === INFINITY) {
        return { type: "infinity" };
    }
    if (/^[+-]?\d+(\.\d+)?$/.test(trimmed)) {
        return { type: "seconds", seconds: Math.trunc(Number(trimmed)) };
    }
    const match = /^([+-])?P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i.exec(trimmed);
    if (match == null || (match[2] == null && match[3] == null && match[4] == null && match[5] == null)) {
        return undefined;
    }
    const sign = match[1] === "-" ? -1 : 1;
    const days = match[2] != null ? Number(match[2]) : 0;
    const hours = match[3] != null ? Number(match[3]) : 0;
    const minutes = match[4] != null ? Number(match[4]) : 0;
    const seconds = match[5] != null ? Number(match[5]) : 0;
    return { type: "seconds", seconds: Math.trunc(sign * (days * 86400 + hours * 3600 + minutes * 60 + seconds)) };
}

/**
 * Resolves the effective default timeout, preferring the idiomatic `default-timeout` key and falling
 * back to the deprecated `default-timeout-in-seconds` (interpreted as seconds) when only the latter is
 * set. Defaults to 60 seconds when neither key is configured. This mirrors the v1 (Java) resolver,
 * keeping the two generators aligned.
 */
export function resolveDefaultTimeout(
    config: Pick<BaseJavaCustomConfigSchema, "default-timeout" | "default-timeout-in-seconds"> | undefined
): ResolvedDefaultTimeout {
    const defaultTimeout = config?.["default-timeout"];
    if (defaultTimeout != null) {
        const resolved = parseDefaultTimeout(defaultTimeout);
        if (resolved != null) {
            return resolved;
        }
    }
    return { type: "seconds", seconds: config?.["default-timeout-in-seconds"] ?? DEFAULT_TIMEOUT_IN_SECONDS };
}

/**
 * Returns the whole-second value used for OkHttp's `callTimeout`, where `0` disables the timeout.
 * `"infinity"` therefore maps to `0`.
 */
export function defaultTimeoutToCallTimeoutSeconds(resolved: ResolvedDefaultTimeout): number {
    return resolved.type === "infinity" ? 0 : resolved.seconds;
}
