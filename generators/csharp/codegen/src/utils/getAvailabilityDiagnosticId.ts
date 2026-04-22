import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { camelCase, upperFirst } from "./text.js";

type AvailabilityStatus = FernIr.AvailabilityStatus;

/**
 * Maximum number of characters taken from the root namespace when deriving a default prefix.
 * Leaves room for the 4-digit suffix (e.g. "0001") within the 8-character cap enforced by
 * {@link DIAGNOSTIC_PREFIX_PATTERN}.
 */
const MAX_DERIVED_PREFIX_LENGTH = 6;

/**
 * Validation pattern for the final diagnostic prefix. Matches the zod regex in
 * `CsharpConfigSchema.availabilityDiagnosticPrefix`: starts with an uppercase letter,
 * then 1–7 additional uppercase-alphanumeric characters (2–8 total).
 */
export const DIAGNOSTIC_PREFIX_PATTERN = /^[A-Z][A-Z0-9]{1,7}$/;

/**
 * Numeric suffix assigned to each availability tier. The two currently-emitted tiers
 * (in-development / pre-release) use stable, compile-time constants — not per-endpoint
 * hashes — so consumers can pin exact IDs in `<NoWarn>` entries or `#pragma` blocks.
 */
const TIER_SUFFIX: Record<"inDevelopment" | "preRelease", string> = {
    inDevelopment: "0001",
    preRelease: "0002"
};

/**
 * Derives a diagnostic prefix candidate from an arbitrary namespace-like string.
 *
 * Strategy:
 * 1. Uppercase and strip all non-alphanumeric characters.
 * 2. Strip any leading digits until the first letter (diagnostic IDs must start with a letter).
 * 3. Truncate to {@link MAX_DERIVED_PREFIX_LENGTH}.
 * 4. If the result is a single letter, duplicate it to satisfy the minimum 2-char pattern.
 *
 * Returns `undefined` when sanitization produces an empty string or the result still fails
 * {@link DIAGNOSTIC_PREFIX_PATTERN}.
 */
function derivePrefixFromNamespace(namespace: string): string | undefined {
    const sanitized = namespace
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .replace(/^[0-9]+/, "");
    if (sanitized.length === 0) {
        return undefined;
    }
    const truncated = sanitized.slice(0, MAX_DERIVED_PREFIX_LENGTH);
    const padded = truncated.length === 1 ? `${truncated}${truncated}` : truncated;
    return DIAGNOSTIC_PREFIX_PATTERN.test(padded) ? padded : undefined;
}

/**
 * Resolves the diagnostic prefix used to build `[Experimental("…")]` IDs.
 *
 * Resolution order:
 * 1. `override` (already validated by zod if sourced from customer config).
 * 2. Derived from the full `rootNamespace` via {@link derivePrefixFromNamespace}.
 * 3. Derived from `organization` + `workspaceName` (the same inputs
 *    {@link deriveRootNamespace} uses to synthesize a default namespace).
 * 4. Throws — the generator refuses to emit a Fern-branded literal. Customers in this
 *    (practically unreachable) state must set `availabilityDiagnosticPrefix` explicitly
 *    in their generator config.
 */
export function resolveDiagnosticPrefix(args: {
    override: string | undefined;
    rootNamespace: string;
    organization: string;
    workspaceName: string;
}): string {
    if (args.override != null && DIAGNOSTIC_PREFIX_PATTERN.test(args.override)) {
        return args.override;
    }
    const fromRootNamespace = derivePrefixFromNamespace(args.rootNamespace);
    if (fromRootNamespace != null) {
        return fromRootNamespace;
    }
    const fallbackNamespace = deriveRootNamespace({
        explicitNamespace: undefined,
        organization: args.organization,
        workspaceName: args.workspaceName
    });
    const fromFallback = derivePrefixFromNamespace(fallbackNamespace);
    if (fromFallback != null) {
        return fromFallback;
    }
    throw new Error(
        `Unable to derive a C# availability diagnostic prefix from rootNamespace "${args.rootNamespace}", ` +
            `organization "${args.organization}", or workspaceName "${args.workspaceName}". ` +
            "Set `availabilityDiagnosticPrefix` explicitly in your generators.yml custom config " +
            "(must match /^[A-Z][A-Z0-9]{1,7}$/)."
    );
}

/**
 * Mirrors the root-namespace derivation used by {@link Generation.settings.namespace} in
 * `generation-info.ts`: if the customer supplied an explicit namespace, use it verbatim;
 * otherwise combine `organization` + `workspaceName` and normalize to PascalCase.
 *
 * Consumers that only know the generator-exec-config (e.g., the CLI's dynamic-snippets
 * runner) use this helper to compute the same prefix the SDK generator itself emits,
 * keeping `[Experimental]` diagnostic IDs in sync between SDK code and suppressing
 * `<NoWarn>` lists in adjacent projects.
 */
export function deriveRootNamespace(args: {
    explicitNamespace: string | undefined;
    organization: string;
    workspaceName: string;
}): string {
    if (args.explicitNamespace != null && args.explicitNamespace.length > 0) {
        return args.explicitNamespace;
    }
    return upperFirst(camelCase(`${args.organization}_${args.workspaceName}`));
}

/**
 * Returns the `[Experimental("…")]` diagnostic ID for the given availability tier.
 *
 * Returns `undefined` for {@link FernIr.AvailabilityStatus.Deprecated} (handled by
 * `[System.ObsoleteAttribute]`) and {@link FernIr.AvailabilityStatus.GeneralAvailability}
 * (no attribute emitted).
 */
export function getDiagnosticId(args: { status: AvailabilityStatus; prefix: string }): string | undefined {
    switch (args.status) {
        case FernIr.AvailabilityStatus.InDevelopment:
            return `${args.prefix}${TIER_SUFFIX.inDevelopment}`;
        case FernIr.AvailabilityStatus.PreRelease:
            return `${args.prefix}${TIER_SUFFIX.preRelease}`;
        case FernIr.AvailabilityStatus.Deprecated:
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return undefined;
        default:
            assertNever(args.status);
    }
}
