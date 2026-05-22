import { FernIr } from "@fern-fern/ir-sdk";
import { toEnvVarPrefix } from "./identity.js";

/**
 * One auth binding to emit in the generated `main.rs`. The `rustCall`
 * string is the literal method-chain fragment; the rendering layer
 * splices these into the `CliApp::new(...)` builder at either root level
 * (typed builders like `BearerAuth`) or binding level (on `OpenApiBinding`).
 */
export interface DetectedAuthBinding {
    /** Scheme name as declared in `generators.yml`'s `auth-schemes` (the IR's `key`). */
    schemeName: string;
    /** Literal Rust method-chain call, minus the leading whitespace. */
    rustCall: string;
    /** Where this auth binding should be placed in the generated main.rs. */
    placement: "root" | "binding";
    /** Rust type to import from `fern_cli_sdk::auth`, if any. */
    authTypeImport: string | null;
}

/**
 * Visit each scheme in the IR's `auth.schemes` and emit a binding
 * for the variants the SDK supports:
 *
 *   - `bearer` → `.auth(BearerAuth::new("<key>").env("<env>"))`
 *   - `header` → `.auth(ApiKeyAuth::new("<key>").env("<env>"))`
 *   - `basic` (both halves bound) → `.auth_basic_scheme(...)`
 *   - `basic` with `passwordOmit: true` →
 *     `.auth_provider("<key>", BasicAuthProvider::username_only(...))`
 *   - `basic` with `usernameOmit: true` → symmetric
 *     `.auth_provider("<key>", BasicAuthProvider::password_only(...))`
 *   - `basic` with both omitted → skipped (nothing to bind)
 *   - `oauth` / `inferred` / unknown → skipped (the SDK currently has no
 *     runtime provider for these)
 *
 * Env-var names come from the IR first (`usernameEnvVar`,
 * `passwordEnvVar`, `tokenEnvVar`, `headerEnvVar`). When the IR doesn't
 * pin one, we fall back to `<BIN>_<KIND>`.
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
                rustCall: `.auth(BearerAuth::new("${bearer.key}").env("${env}"))`,
                placement: "root",
                authTypeImport: "BearerAuth"
            };
        },
        header: (header) => {
            const env = header.headerEnvVar ?? `${envPrefix}_API_KEY`;
            return {
                schemeName: header.key,
                rustCall: `.auth(ApiKeyAuth::new("${header.key}").env("${env}"))`,
                placement: "root",
                authTypeImport: "ApiKeyAuth"
            };
        },
        basic: (basic) => {
            const usernameEnv = basic.usernameEnvVar ?? `${envPrefix}_USERNAME`;
            const passwordEnv = basic.passwordEnvVar ?? `${envPrefix}_PASSWORD`;

            // Both halves omitted → no credential source to bind.
            if (basic.usernameOmit && basic.passwordOmit) {
                return null;
            }
            // password omitted → API key in the username slot.
            if (basic.passwordOmit) {
                return {
                    schemeName: basic.key,
                    rustCall: `.auth_provider("${basic.key}", BasicAuthProvider::username_only("${basic.key}", AuthCredentialSource::from_env("${usernameEnv}")))`,
                    placement: "binding",
                    authTypeImport: "AuthCredentialSource, BasicAuthProvider"
                };
            }
            if (basic.usernameOmit) {
                return {
                    schemeName: basic.key,
                    rustCall: `.auth_provider("${basic.key}", BasicAuthProvider::password_only("${basic.key}", AuthCredentialSource::from_env("${passwordEnv}")))`,
                    placement: "binding",
                    authTypeImport: "AuthCredentialSource, BasicAuthProvider"
                };
            }
            return {
                schemeName: basic.key,
                rustCall: `.auth_basic_scheme("${basic.key}", AuthCredentialSource::from_env("${usernameEnv}"), AuthCredentialSource::from_env("${passwordEnv}"))`,
                placement: "binding",
                authTypeImport: "AuthCredentialSource"
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
