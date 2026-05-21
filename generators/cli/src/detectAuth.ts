import type { RawSpecsManifestEntry } from "./copySpecs.js";
import { toEnvVarPrefix } from "./identity.js";
import { SpecCache } from "./specCache.js";

/**
 * One auth binding to emit in the generated `main.rs`. The `rustCall`
 * string is the literal method-chain fragment (e.g.
 * `.auth_scheme_env("bearerAuth", "ACME_TOKEN")`); the rendering layer
 * just splices these into the `CliApp::new(...)` builder.
 */
export interface DetectedAuthBinding {
    /** Scheme name as declared in the spec's `components.securitySchemes`. */
    schemeName: string;
    /** Literal Rust method-chain call, minus the leading whitespace. */
    rustCall: string;
    /** Whether this binding needs `use fern_cli_sdk::auth::AuthCredentialSource;` at the top of main.rs. */
    needsCredentialSourceImport: boolean;
}

/**
 * Walk every mounted OpenAPI spec's `components.securitySchemes` and
 * emit a binding for each scheme the SDK's `auth_scheme*` API supports:
 *
 *   - `http: bearer`        → `.auth_scheme_env("<name>", "<ENV>_TOKEN")`
 *   - `oauth2`              → `.auth_scheme_env("<name>", "<ENV>_TOKEN")`
 *   - `apiKey, in: header`  → `.auth_scheme_env("<name>", "<ENV>_API_KEY")`
 *   - `http: basic`         → `.auth_basic_scheme("<name>", AuthCredentialSource::from_env("<ENV>_USERNAME"),
 *                                                          AuthCredentialSource::from_env("<ENV>_PASSWORD"))`
 *
 * Everything else (apiKey in query/cookie, openIdConnect, mTLS, request
 * signing) is skipped — the SDK's `provider_for_binding` would refuse
 * those today, and the generator should match its supported surface.
 *
 * Multi-spec workspaces: the SDK merges `securitySchemes` across all
 * mounted specs (first-wins on a name collision). This function mirrors
 * that behavior so the emitted main.rs binds every reachable scheme.
 *
 * Returns an empty list when no spec declares any scheme — in which
 * case `renderMainRs` will omit the `.auth_scheme*(...)` calls entirely
 * and the resulting CLI ships without an auth provider (the SDK's
 * `passthrough` mode).
 */
export async function detectAuthBindings(args: {
    openapiSpecs: RawSpecsManifestEntry[];
    binaryName: string;
    /** Optional parsed-spec cache; one-off when omitted. */
    specCache?: SpecCache;
}): Promise<DetectedAuthBinding[]> {
    const { openapiSpecs, binaryName } = args;
    const cache = args.specCache ?? new SpecCache();
    const merged = new Map<string, SecuritySchemeJson>();
    for (const entry of openapiSpecs) {
        const schemes = await readSecuritySchemes(entry.specPath, cache);
        for (const [name, scheme] of schemes) {
            if (!merged.has(name)) {
                merged.set(name, scheme);
            }
        }
    }

    // Always include the scheme name in the env-var prefix, even when
    // there's only one scheme. Counter-intuitively this is the *stable*
    // choice: if users later add a second spec/scheme, single-scheme
    // workspaces would otherwise silently rename `<BIN>_TOKEN` to
    // `<BIN>_<SCHEME>_TOKEN`, and their existing env-var setups would
    // break with no warning. Keeping `<SCHEME>_` in the name from day
    // one makes the contract additive.
    const bindings: DetectedAuthBinding[] = [];
    const envPrefix = toEnvVarPrefix(binaryName);

    for (const [schemeName, scheme] of merged) {
        const envBase = `${envPrefix}_${toEnvVarPrefix(schemeName)}`;
        const binding = bindingFor(schemeName, scheme, envBase);
        if (binding != null) {
            bindings.push(binding);
        }
    }
    return bindings;
}

interface SecuritySchemeJson {
    type?: string;
    scheme?: string;
    in?: string;
    name?: string;
}

async function readSecuritySchemes(specPath: string, cache: SpecCache): Promise<Array<[string, SecuritySchemeJson]>> {
    const parsed = await cache.read(specPath);
    const schemes = parsed?.components?.securitySchemes;
    if (schemes == null) {
        return [];
    }
    return Object.entries(schemes) as Array<[string, SecuritySchemeJson]>;
}

function bindingFor(schemeName: string, scheme: SecuritySchemeJson, envBase: string): DetectedAuthBinding | null {
    if (scheme.type === "http" && scheme.scheme === "bearer") {
        return {
            schemeName,
            rustCall: `.auth_scheme_env("${schemeName}", "${envBase}_TOKEN")`,
            needsCredentialSourceImport: false
        };
    }
    if (scheme.type === "oauth2") {
        return {
            schemeName,
            rustCall: `.auth_scheme_env("${schemeName}", "${envBase}_TOKEN")`,
            needsCredentialSourceImport: false
        };
    }
    if (scheme.type === "apiKey" && scheme.in === "header") {
        return {
            schemeName,
            rustCall: `.auth_scheme_env("${schemeName}", "${envBase}_API_KEY")`,
            needsCredentialSourceImport: false
        };
    }
    if (scheme.type === "http" && scheme.scheme === "basic") {
        return {
            schemeName,
            rustCall:
                `.auth_basic_scheme("${schemeName}", ` +
                `AuthCredentialSource::from_env("${envBase}_USERNAME"), ` +
                `AuthCredentialSource::from_env("${envBase}_PASSWORD"))`,
            needsCredentialSourceImport: true
        };
    }

    // apiKey in query/cookie, openIdConnect, mTLS, and anything else —
    // unsupported by the SDK's auth_scheme* API. Skip silently; the
    // CLI's `passthrough` mode handles unbound schemes at runtime.
    return null;
}
