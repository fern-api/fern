/** The production Fern Definition Registry (FDR) origin. Used when no environment variable names another one. */
export const DEFAULT_FDR_ORIGIN_URL = "https://registry.buildwithfern.com";

/**
 * Returns the FDR origin, honoring runtime overrides first:
 * `FERN_FDR_ORIGIN`, then `OVERRIDE_FDR_ORIGIN`, then `DEFAULT_FDR_ORIGIN`, then {@link DEFAULT_FDR_ORIGIN_URL}.
 *
 * `DEFAULT_FDR_ORIGIN` is replaced at build time in release builds, so a build always has its own
 * environment's origin as the fallback. Keep the literal `process.env.X` reads: the build replaces that text.
 *
 * Some call sites intentionally read a shorter chain of variables and are not routed through this function.
 */
export function getFdrOrigin(): string {
    return (
        process.env.FERN_FDR_ORIGIN ??
        process.env.OVERRIDE_FDR_ORIGIN ??
        process.env.DEFAULT_FDR_ORIGIN ??
        DEFAULT_FDR_ORIGIN_URL
    );
}
