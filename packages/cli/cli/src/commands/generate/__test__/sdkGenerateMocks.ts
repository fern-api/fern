import { vi } from "vitest";

// Module-level state for the two `vi.mock` calls every sdkGenerate command test makes. It lives in its own module with
// no product imports, so a `vi.mock` factory can load it while `generateAPIWorkspaces` is still being imported.

/** The token every test runs with; recognizable, so that a leak into a request or a log is easy to spot. */
export const TEST_TOKEN = "fern-test-token-0123456789";

export interface LoginAnswer {
    type: "organization" | "user";
    value: string;
}

/** What `askToLogin` answers. Tests change it to cover the user-token and the failing-login paths. */
export const askToLogin = vi.fn(
    async (_context: unknown): Promise<LoginAnswer> => ({ type: "organization", value: TEST_TOKEN })
);

/** The `use-sdk-gen-api` PostHog flag. Off by default, like an organization the flag has not been enabled for. */
export const featureFlags = {
    isEnabled: vi.fn(async (_flag: string, _context: { org: string; generator?: string; language?: string }) => false),
    getCachedValue: vi.fn((): boolean | undefined => undefined)
};

export function resetMocks(): void {
    askToLogin.mockReset();
    askToLogin.mockImplementation(async () => ({ type: "organization", value: TEST_TOKEN }));
    featureFlags.isEnabled.mockReset();
    featureFlags.isEnabled.mockImplementation(async () => false);
    featureFlags.getCachedValue.mockReset();
    featureFlags.getCachedValue.mockImplementation(() => undefined);
}

/** The replacement module for `@fern-api/login`. */
export function loginModule(): { askToLogin: typeof askToLogin; getDashboardBaseUrl: () => string } {
    return { askToLogin, getDashboardBaseUrl: () => "https://dashboard.test" };
}

/** The replacement module for `@fern-api/posthog-manager`: everything real, except the feature flag client. */
export function posthogModule<T extends object>(original: T): T & { getFeatureFlagClient: () => typeof featureFlags } {
    return { ...original, getFeatureFlagClient: () => featureFlags };
}
