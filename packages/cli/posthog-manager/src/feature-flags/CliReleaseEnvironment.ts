/**
 * The published CLI distribution a binary was built for. Injected at build time through
 * `FERN_CLI_RELEASE_ENVIRONMENT` (see `packages/cli/cli/build.*.mjs`) and sent to PostHog as the
 * `environment` property so feature flags can target a distribution.
 */
export const CLI_RELEASE_ENVIRONMENTS = ["prod", "pre-prod", "beta", "dev", "local"] as const;

export type CliReleaseEnvironment = (typeof CLI_RELEASE_ENVIRONMENTS)[number];

export function isCliReleaseEnvironment(value: string): value is CliReleaseEnvironment {
    return CLI_RELEASE_ENVIRONMENTS.some((environment) => environment === value);
}

/** Unbuilt runs (tests, `tsx` from source) have no injected value and count as `local`. */
export function getCliReleaseEnvironment(
    value: string | undefined = process.env.FERN_CLI_RELEASE_ENVIRONMENT
): CliReleaseEnvironment {
    const normalized = value?.trim();
    return normalized != null && isCliReleaseEnvironment(normalized) ? normalized : "local";
}
