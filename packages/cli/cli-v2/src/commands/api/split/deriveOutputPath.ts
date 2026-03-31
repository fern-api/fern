import { type AbsoluteFilePath, dirname, getFilename, join, RelativeFilePath } from "@fern-api/fs-utils";

/** Canonical name for the overlay format (singular). */
export const OVERLAY_NAME = "overlay" as const;

/** Alternative accepted spellings for the overlay format. */
export const OVERLAY_NAME_ALTERNATIVES = ["overlays"] as const;

/** Canonical name for the overrides format (plural). */
export const OVERRIDES_NAME = "overrides" as const;

/** Alternative accepted spellings for the overrides format. */
export const OVERRIDES_NAME_ALTERNATIVES = ["override"] as const;

/** The canonical split format values (public-facing). */
export type SplitFormat = typeof OVERLAY_NAME | typeof OVERRIDES_NAME;

/** All accepted format strings – both singular and plural forms. */
export type SplitFormatInput =
    | SplitFormat
    | (typeof OVERLAY_NAME_ALTERNATIVES)[number]
    | (typeof OVERRIDES_NAME_ALTERNATIVES)[number];

/** Every accepted format string, for input validation. */
export const ALL_FORMAT_NAMES: readonly SplitFormatInput[] = [
    OVERLAY_NAME,
    ...OVERLAY_NAME_ALTERNATIVES,
    OVERRIDES_NAME,
    ...OVERRIDES_NAME_ALTERNATIVES
] as const;

/** Normalizes any accepted format input to its canonical form. */
export function normalizeSplitFormat(input: SplitFormatInput): SplitFormat {
    if (input === OVERRIDES_NAME || (OVERRIDES_NAME_ALTERNATIVES as readonly string[]).includes(input)) {
        return OVERRIDES_NAME;
    }
    return OVERLAY_NAME;
}

/**
 * Derives an output path from a spec file path.
 * E.g., `/path/to/openapi.yml` → `/path/to/openapi-overlay.yml`
 */
export function deriveOutputPath(specPath: AbsoluteFilePath, format: SplitFormat = OVERLAY_NAME): AbsoluteFilePath {
    const specFilename = getFilename(specPath);
    const suffix = format === OVERLAY_NAME ? OVERLAY_NAME : OVERRIDES_NAME;
    let derivedFilename = `openapi-${suffix}.yml`;
    if (specFilename != null) {
        const lastDotIndex = specFilename.lastIndexOf(".");
        if (lastDotIndex > 0) {
            const nameWithoutExt = specFilename.substring(0, lastDotIndex);
            derivedFilename = `${nameWithoutExt}-${suffix}.yml`;
        }
    }
    return join(dirname(specPath), RelativeFilePath.of(derivedFilename));
}
