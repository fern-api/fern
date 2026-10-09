import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { readSpecsManifest } from "../copySpecs.js";
import type { DetectedAuthBinding } from "../detectAuth.js";
import type { DetectedGlobalParam } from "../detectGlobalParams.js";
import { readFullIr } from "../ir.js";
import { renderWireTestHarness } from "./harness.js";
import type { OAuthTokenEndpoint } from "./manifest.js";
import { buildWireTestManifest } from "./manifest.js";
import { loadRequiredBodyContracts } from "./specRequiredBody.js";

export interface GenerateWireTestsResult {
    status: "generated" | "skipped";
    /** Number of endpoint examples turned into test cases. */
    caseCount: number;
}

/**
 * Emit the CLI wire-test suite into the generated output:
 *   - `wiremock/wire-test-cases.json` — the declarative manifest (one case
 *     per endpoint example: command inputs + expected request/response).
 *   - `tests/wire_test.rs` — the generic Rust harness that reads the manifest,
 *     stands up an in-process mock server, drives the compiled binary, and
 *     asserts request/response.
 *
 * Both land under the generated crate root so `seed`'s `cargo test
 * --all-features` compiles and runs them automatically — no docker, no
 * `RUN_WIRE_TESTS` gate.
 *
 * No-op (returns `skipped`) when the IR yields no endpoint examples: an empty
 * suite would just be noise.
 */
export async function generateWireTests(args: {
    outputDir: string;
    binaryName: string;
    irFilepath: string;
    specsDir?: string;
    rootGroup?: string;
    authBindings: DetectedAuthBinding[];
    globalParams: DetectedGlobalParam[];
}): Promise<GenerateWireTestsResult> {
    const { outputDir, binaryName, irFilepath, specsDir, rootGroup, authBindings, globalParams } = args;

    const specManifest = await readSpecsManifest(specsDir);
    const openapiSpecs = specManifest?.specs.filter((entry) => entry.type === "openapi") ?? [];
    if (openapiSpecs.length === 0) {
        return { status: "skipped", caseCount: 0 };
    }

    const specs = openapiSpecs.map((entry) => ({
        file: path.posix.join("cli", binaryName, path.basename(entry.specPath)),
        namespace: entry.namespace ?? null
    }));

    const authEnvVars = collectAuthEnvVars(authBindings);
    const oauthTokenEndpoint = collectOAuthTokenEndpoint(authBindings);
    const loginFlowSchemes = collectLoginFlowSchemes(authBindings);

    const ir = await readFullIr(irFilepath);
    // Read the specs themselves, not just their paths: they are the oracle the
    // generated CLI validates request bodies against, so they are also the only
    // thing that can repair an example body the CLI would reject. See
    // `specRequiredBody.ts`.
    const requiredBodyContracts = await loadRequiredBodyContracts(openapiSpecs.map((entry) => entry.specPath));
    const manifest = buildWireTestManifest(ir, {
        binaryName,
        rootGroup: rootGroup ?? null,
        specs,
        authEnvVars,
        globalFlags: collectGlobalFlags(globalParams),
        oauthTokenEndpoint,
        loginFlowSchemes,
        requiredBodyContracts
    });

    if (manifest.cases.length === 0) {
        return { status: "skipped", caseCount: 0 };
    }

    const wiremockDir = path.join(outputDir, "wiremock");
    const testsDir = path.join(outputDir, "tests");
    await mkdir(wiremockDir, { recursive: true });
    await mkdir(testsDir, { recursive: true });

    await writeFile(path.join(wiremockDir, "wire-test-cases.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    await writeFile(path.join(testsDir, "wire_test.rs"), renderWireTestHarness({ binaryName, cases: manifest.cases }));

    return { status: "generated", caseCount: manifest.cases.length };
}

/** Dedupe the required + optional env var names across all auth bindings. */
/**
 * The credential values `mock-utils` bakes into its `Authorization: Basic
 * <base64>` matcher. That matcher is an exact `equalTo`, so the harness has to
 * export these precise strings or a basic-auth CLI sends a correctly-formed
 * header that can never match its own mock.
 */
const MOCK_UTILS_BASIC_USERNAME = "test-username";
const MOCK_UTILS_BASIC_PASSWORD = "test-password";

/** Value the harness exports for any credential whose matcher is presence-only. */
const PRESENCE_ONLY_CREDENTIAL = "test";

/** Value the harness passes for a required global parameter. */
const GLOBAL_PARAM_VALUE = "test";

/**
 * The global-parameter flags the harness must pass on every command, or the
 * CLI rejects the invocation before it ever issues a request ("Required global
 * parameter '<x>' has no value").
 *
 * Only parameters the caller genuinely has to supply are listed: an optional
 * one is omitted from requests that don't resolve it, and a baked-in default
 * resolves on its own. A declared env var does not count — the harness exports
 * only auth credentials, so an env-backed global still has nothing to resolve
 * from.
 *
 * Header and query locations only. Both are invisible to the case's mocks
 * (matchers assert the request's own headers/query params, never the absence
 * of extra ones), whereas a placeholder injected into the path or the body
 * would change the very request the case asserts on.
 */
function collectGlobalFlags(globalParams: DetectedGlobalParam[]): Array<{ name: string; value: string }> {
    return globalParams
        .filter(
            (param) =>
                !param.optional && !param.hasDefaultValue && (param.location === "header" || param.location === "query")
        )
        .map((param) => ({ name: param.flagSource, value: GLOBAL_PARAM_VALUE }));
}

/**
 * Every credential env var the harness must export, paired with the value to
 * export.
 *
 * The value matters only for `basic`: `mock-utils` matches `Authorization` with
 * an exact base64 of `test-username:test-password`, so seeding the generic
 * placeholder would produce a header that is well-formed and still unmatchable.
 * Bearer and apiKey schemes get presence-only matchers (`Bearer .+`, `.+`), so
 * any non-empty value satisfies them.
 */
function collectAuthEnvVars(authBindings: DetectedAuthBinding[]): Array<{ name: string; value: string }> {
    const byName = new Map<string, string>();
    for (const binding of authBindings) {
        binding.envVars.forEach((envVar, index) => {
            byName.set(envVar, basicCredentialValue(binding, index) ?? PRESENCE_ONLY_CREDENTIAL);
        });
        for (const envVar of binding.optionalEnvVars ?? []) {
            if (!byName.has(envVar)) {
                byName.set(envVar, PRESENCE_ONLY_CREDENTIAL);
            }
        }
    }
    return [...byName.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name));
}

/** The basic-auth half `binding.envVars[index]` supplies, if any. */
function basicCredentialValue(binding: DetectedAuthBinding, index: number): string | undefined {
    if (binding.kind !== "basic") {
        return undefined;
    }
    switch (binding.basicHalf) {
        case "username":
            return MOCK_UTILS_BASIC_USERNAME;
        case "password":
            return MOCK_UTILS_BASIC_PASSWORD;
        case "both":
            // `[usernameEnv, passwordEnv]`, in that order.
            return index === 0 ? MOCK_UTILS_BASIC_USERNAME : MOCK_UTILS_BASIC_PASSWORD;
        default:
            return undefined;
    }
}

/**
 * Find the OAuth client-credentials token endpoint, if any. The CLI supports
 * at most one such scheme (multiple would each define their own token exchange
 * on distinct `Authorization`-style headers); we take the first resolved one,
 * since the harness only needs a token exchange to succeed and business mocks
 * don't match on the auth header.
 */
function collectOAuthTokenEndpoint(authBindings: DetectedAuthBinding[]): OAuthTokenEndpoint | null {
    for (const binding of authBindings) {
        if (binding.kind === "oauth-client-credentials" && binding.oauthTokenEndpoint != null) {
            return binding.oauthTokenEndpoint;
        }
    }
    return null;
}

/**
 * Scheme keys of public-client login flows (authorization-code / device-code). Their request-time
 * auth is a keyring-stored bearer token (not a per-request exchange), so the harness seeds one via
 * `auth login --with-token` rather than stubbing a token endpoint.
 */
function collectLoginFlowSchemes(authBindings: DetectedAuthBinding[]): string[] {
    return authBindings
        .filter((binding) => binding.kind === "oauth-authorization-code" || binding.kind === "oauth-device-code")
        .map((binding) => binding.schemeName);
}
