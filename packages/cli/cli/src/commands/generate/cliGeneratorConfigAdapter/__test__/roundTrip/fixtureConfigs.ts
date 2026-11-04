/** The `config` each round-trip fixture's `cli` generator was seeded with (formerly the first variant in seed/cli/seed.yml). */
export const FIXTURE_CONFIGS: Record<string, Record<string, unknown>> = {
    "cli-multi-spec": { binaryName: "acme-cli" },
    "cli-multi-spec-namespaced": { binaryName: "acme-versioned" },
    "cli-oauth": { binaryName: "oauth-test", customCommands: false },
    "cli-any-auth": { binaryName: "any-auth-cli", customCommands: false },
    "cli-multi-scheme-routing": { binaryName: "multi-scheme-cli", customCommands: false },
    "cli-reserved-keywords": { generateWireTests: true },
    "cli-namespace-stutter": { generateWireTests: true },
    "file-upload-openapi": { generateWireTests: true },
    "cli-oauth-login-flow": { binaryName: "login-flow", generateWireTests: true },
    "cli-header-auth": { binaryName: "header-auth-cli", generateWireTests: true },
    "cli-header-auth-prefix": { binaryName: "header-prefix-cli", generateWireTests: true },
    "cli-basic-auth": { binaryName: "basic-auth-cli", generateWireTests: true },
    "cli-bearer-env-var": { binaryName: "bearer-env-cli", generateWireTests: true },
    "cli-profiles": { binaryName: "profiles-cli", profiles: { enabled: true } },
    "cli-shared-types": { binaryName: "shared-types-cli", splitTypeCrates: true }
};
