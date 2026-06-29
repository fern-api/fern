import { FernIr } from "@fern-fern/ir-sdk";
import { toEnvVarPrefix } from "./identity.js";

/**
 * A generation-time warning about the IR's auth configuration.
 * Emitted by `validateAuthSchemes` so the orchestrator can surface
 * them to the user.
 */
export interface AuthWarning {
    message: string;
}

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
    /** Resolved environment variable names the user must set for this binding. */
    envVars: string[];
    /** Auth kind for documentation purposes. */
    kind: "bearer" | "header" | "basic";
}

/**
 * Visit each scheme in the IR's `auth.schemes` and emit a binding
 * for the variants the SDK supports:
 *
 *   - `bearer` → `.auth(BearerAuth::new("<key>").env("<env>"))`
 *   - `header` → `.auth(ApiKeyAuth::new("<key>").source(...))` with a
 *     `--api-key` flag tried first, falling back to the env var
 *   - `basic` (both halves bound) → `.auth(BasicAuth::new("<key>").username_env(...).password_env(...))`
 *     at root, so `auth status` enumerates the scheme [FER-11474]. The
 *     root `BasicAuth` builder lowers to the same `SchemeBinding::Basic`
 *     as the binding-level `.auth_basic_scheme(...)` and still propagates
 *     to the binding via `set_root_auth`, so request-time auth is unchanged.
 *   - `basic` with `passwordOmit: true` →
 *     `.auth_provider("<key>", BasicAuthProvider::username_only(...))` —
 *     stays binding-level; no root path exists for `BasicAuthProvider`.
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

    // When the spec declares more than one `header` API-key scheme, a shared
    // `--api-key` flag would collide (clap dedupes the arg, so both schemes
    // would resolve from the same value). Disambiguate by deriving the flag
    // from each scheme's key in that case; keep the conventional `--api-key`
    // for the overwhelmingly common single-scheme case.
    const multipleHeaderSchemes = auth.schemes.filter((scheme) => scheme.type === "header").length > 1;

    const bindings: DetectedAuthBinding[] = [];
    for (const scheme of auth.schemes) {
        const binding = bindingForScheme(scheme, envPrefix, multipleHeaderSchemes);
        if (binding != null) {
            bindings.push(binding);
        }
    }
    return bindings;
}

function bindingForScheme(
    scheme: FernIr.AuthScheme,
    envPrefix: string,
    multipleHeaderSchemes: boolean
): DetectedAuthBinding | null {
    return scheme._visit<DetectedAuthBinding | null>({
        bearer: (bearer) => {
            const env = bearer.tokenEnvVar ?? `${envPrefix}_TOKEN`;
            return {
                schemeName: bearer.key,
                rustCall: `.auth(BearerAuth::new("${bearer.key}").env("${env}"))`,
                placement: "root",
                authTypeImport: "BearerAuth",
                envVars: [env],
                kind: "bearer"
            };
        },
        header: (header) => {
            const env = header.headerEnvVar ?? `${envPrefix}_API_KEY`;
            // `toEnvVarPrefix` is camelCase/Pascal/acronym-aware (unlike
            // `toKebabCase`, which lowercases before splitting), so "ApiKey"
            // becomes "api-key" rather than "apikey".
            const flag = multipleHeaderSchemes
                ? toEnvVarPrefix(header.key).toLowerCase().replace(/_/g, "-")
                : "api-key";
            // Flag-then-env fallback: the flag is tried first, falling back to
            // the env var. `.cli()` and `.env()` on the builder overwrite each
            // other, so the chain has to go through `.source(Chain([...]))`
            // rather than `.cli().env()`.
            return {
                schemeName: header.key,
                rustCall: `.auth(ApiKeyAuth::new("${header.key}").source(AuthCredentialSource::any(vec![AuthCredentialSource::cli("${flag}"), AuthCredentialSource::from_env("${env}")])))`,
                placement: "root",
                authTypeImport: "ApiKeyAuth, AuthCredentialSource",
                envVars: [env],
                kind: "header"
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
                    authTypeImport: "AuthCredentialSource, BasicAuthProvider",
                    envVars: [usernameEnv],
                    kind: "basic"
                };
            }
            if (basic.usernameOmit) {
                return {
                    schemeName: basic.key,
                    rustCall: `.auth_provider("${basic.key}", BasicAuthProvider::password_only("${basic.key}", AuthCredentialSource::from_env("${passwordEnv}")))`,
                    placement: "binding",
                    authTypeImport: "AuthCredentialSource, BasicAuthProvider",
                    envVars: [passwordEnv],
                    kind: "basic"
                };
            }
            // Both halves bound → root-level typed builder. Placed at root
            // (like bearer/header) so the framework `auth` subcommand can
            // enumerate it; `set_root_auth` still propagates it down to the
            // binding for request-time credential resolution [FER-11474].
            return {
                schemeName: basic.key,
                rustCall: `.auth(BasicAuth::new("${basic.key}").username_env("${usernameEnv}").password_env("${passwordEnv}"))`,
                placement: "root",
                authTypeImport: "BasicAuth",
                envVars: [usernameEnv, passwordEnv],
                kind: "basic"
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

/**
 * Validate the IR's auth configuration and return warnings for
 * patterns the spec author should address:
 *
 *   1. AND-ed HTTP auth schemes — bearer and basic both ride the
 *      `Authorization` header, so requiring both simultaneously is
 *      unsatisfiable and almost always a spec authoring error.
 *
 *   2. Partially-wired requirements — when `requirement === "ALL"`
 *      and some declared schemes can't be wired (oauth, inferred,
 *      etc.), the generated CLI can only partially authenticate.
 *
 * The function compares the full set of declared schemes against the
 * bindings `detectAuthBindings` actually produced, so it naturally
 * picks up any scheme the binding stage had to skip.
 */
export function validateAuthSchemes(args: {
    auth: { requirement: FernIr.AuthSchemesRequirement; schemes: FernIr.AuthScheme[] };
    bindings: DetectedAuthBinding[];
}): AuthWarning[] {
    const { auth, bindings } = args;
    const warnings: AuthWarning[] = [];

    // Collect the distinct HTTP auth types (bearer / basic). Both use
    // the Authorization header, so AND-ing them on a single request is
    // physically impossible.
    const httpAuthTypes: string[] = [];
    for (const scheme of auth.schemes) {
        if (scheme.type === "bearer" || scheme.type === "basic") {
            if (!httpAuthTypes.includes(scheme.type)) {
                httpAuthTypes.push(scheme.type);
            }
        }
    }

    if (auth.requirement === "ALL" && httpAuthTypes.length > 1) {
        warnings.push({
            message:
                `Security configuration AND-s multiple HTTP auth schemes (${httpAuthTypes.sort().join(" + ")}). ` +
                "These share the Authorization header and cannot be satisfied simultaneously — " +
                "this is almost always a spec authoring error. Consider separating them into " +
                "distinct security requirements (OR)."
        });
    }

    // Detect schemes that detectAuthBindings could not wire.
    const wiredKeys = new Set(bindings.map((b) => b.schemeName));
    const unwired = auth.schemes.filter((s) => !wiredKeys.has(s.key));

    if (unwired.length > 0 && auth.requirement === "ALL") {
        const names = unwired.map((s) => `'${s.key}' (${s.type})`).join(", ");
        warnings.push({
            message:
                `Security configuration requires all auth schemes, but the CLI cannot wire: ${names}. ` +
                "Requests needing these schemes will be partially authenticated."
        });
    }

    return warnings;
}
