import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { readSpecsManifest } from "../copySpecs.js";
import type { DetectedAuthBinding } from "../detectAuth.js";
import { readFullIr } from "../ir.js";
import { renderWireTestHarness } from "./harness.js";
import type { OAuthTokenEndpoint } from "./manifest.js";
import { buildWireTestManifest } from "./manifest.js";

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
}): Promise<GenerateWireTestsResult> {
    const { outputDir, binaryName, irFilepath, specsDir, rootGroup, authBindings } = args;

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
    const manifest = buildWireTestManifest(ir, {
        binaryName,
        rootGroup: rootGroup ?? null,
        specs,
        authEnvVars,
        oauthTokenEndpoint,
        loginFlowSchemes
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
function collectAuthEnvVars(authBindings: DetectedAuthBinding[]): string[] {
    const names = new Set<string>();
    for (const binding of authBindings) {
        for (const envVar of binding.envVars) {
            names.add(envVar);
        }
        for (const envVar of binding.optionalEnvVars ?? []) {
            names.add(envVar);
        }
    }
    return [...names].sort();
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
