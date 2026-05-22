import { FernIr } from "@fern-fern/ir-sdk";
import { toEnvVarPrefix } from "./identity.js";

/**
 * One auth binding to emit in the generated `main.rs`. The `rustCall`
 * string is the literal method-chain fragment (e.g.
 * `.auth_scheme_env("bearerAuth", "ACME_TOKEN")`); the rendering layer
 * just splices these into the `CliApp::new(...)` builder.
 */
export interface DetectedAuthBinding {
    /** Scheme name as declared in `generators.yml`'s `auth-schemes` (the IR's `key`). */
    schemeName: string;
    /** Literal Rust method-chain call, minus the leading whitespace. */
    rustCall: string;
    /** Whether this binding needs `use fern_cli_sdk::auth::AuthCredentialSource;` at the top of main.rs. */
    needsCredentialSourceImport: boolean;
}

/**
 * Visit each scheme in the IR's `auth.schemes` and emit a binding
 * for the variants the SDK's `auth_scheme*` API supports:
 *
 *   - `bearer` → `.auth_scheme_env("<key>", "<env>_TOKEN")`
 *   - `header` → `.auth_scheme_env("<key>", "<env>_API_KEY")`
 *   - `basic` (both halves bound) → `.auth_basic_scheme(...)`
 *   - `basic` with `passwordOmit: true` →
 *     `.auth_basic_scheme_username_only("<key>", from_env(<usernameEnv>))`
 *     — the Close API's "API key in basic-auth username slot" pattern.
 *     Goes through the SDK's dedicated username-only path because the
 *     equivalent `auth_basic_scheme(..., literal(""))` would silently
 *     drop the binding: `Literal("")` resolves to `None`, which trips
 *     `BasicAuthMode::Full`'s "both must resolve" check.
 *   - `basic` with `usernameOmit: true` → symmetric
 *     `.auth_basic_scheme_password_only(...)`
 *   - `basic` with both omitted → skipped (nothing to bind)
 *   - `oauth` / `inferred` / unknown → skipped (the SDK currently has no
 *     runtime provider for these; visiting them via `_other` keeps the
 *     union forward-compatible)
 *
 * Env-var names come from the IR first (`usernameEnvVar`,
 * `passwordEnvVar`, `tokenEnvVar`, `headerEnvVar` — these resolve from
 * `generators.yml`'s `auth-schemes`). When the IR doesn't pin one, we
 * fall back to `<BIN>_<KIND>` so the customer gets a clean, predictable
 * name (`CLOSE_TOKEN`) rather than a noisy `<BIN>_<SCHEME>_<KIND>`.
 */
export function detectAuthBindings(args: {
    auth: { schemes: FernIr.AuthScheme[] };
    binaryName: string;
}): DetectedAuthBinding[] {
    const { auth, binaryName } = args;
    const envPrefix = toEnvVarPrefix(binaryName);

    const bindings: DetectedAuthBinding[] = [];
    for (const scheme of auth.schemes) {
        const binding = bindingForScheme(scheme, envPrefix);
        if (binding != null) {
            bindings.push(binding);
        }
    }
    return bindings;
}

function bindingForScheme(scheme: FernIr.AuthScheme, envPrefix: string): DetectedAuthBinding | null {
    return scheme._visit<DetectedAuthBinding | null>({
        bearer: (bearer) => {
            const env = bearer.tokenEnvVar ?? `${envPrefix}_TOKEN`;
            return {
                schemeName: bearer.key,
                rustCall: `.auth_scheme_env("${bearer.key}", "${env}")`,
                needsCredentialSourceImport: false
            };
        },
        header: (header) => {
            const env = header.headerEnvVar ?? `${envPrefix}_API_KEY`;
            return {
                schemeName: header.key,
                rustCall: `.auth_scheme_env("${header.key}", "${env}")`,
                needsCredentialSourceImport: false
            };
        },
        basic: (basic) => {
            const usernameEnv = basic.usernameEnvVar ?? `${envPrefix}_USERNAME`;
            const passwordEnv = basic.passwordEnvVar ?? `${envPrefix}_PASSWORD`;

            // Both halves omitted → no credential source to bind.
            if (basic.usernameOmit && basic.passwordOmit) {
                return null;
            }
            // password omitted → API key in the username slot. Use the
            // SDK's specialised builder so `has_credentials()` checks
            // only the username; the equivalent
            // `auth_basic_scheme(..., literal(""))` would resolve to
            // `None` and drop the binding silently.
            if (basic.passwordOmit) {
                return {
                    schemeName: basic.key,
                    rustCall: `.auth_basic_scheme_username_only("${basic.key}", AuthCredentialSource::from_env("${usernameEnv}"))`,
                    needsCredentialSourceImport: true
                };
            }
            if (basic.usernameOmit) {
                return {
                    schemeName: basic.key,
                    rustCall: `.auth_basic_scheme_password_only("${basic.key}", AuthCredentialSource::from_env("${passwordEnv}"))`,
                    needsCredentialSourceImport: true
                };
            }
            return {
                schemeName: basic.key,
                rustCall: `.auth_basic_scheme("${basic.key}", AuthCredentialSource::from_env("${usernameEnv}"), AuthCredentialSource::from_env("${passwordEnv}"))`,
                needsCredentialSourceImport: true
            };
        },
        // The SDK doesn't yet have a runtime provider for OAuth client
        // credentials or inferred auth — skip rather than emit a call
        // the user couldn't satisfy.
        oauth: () => null,
        inferred: () => null,
        // Future IR auth variants we don't know about yet.
        _other: () => null
    });
}
