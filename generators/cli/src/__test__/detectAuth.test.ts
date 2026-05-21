import { mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RawSpecsManifestEntry } from "../copySpecs.js";
import { detectAuthBindings } from "../detectAuth.js";

/**
 * Coverage for the spec → `auth_scheme*` mapping. Only the schemes the
 * SDK's `provider_for_binding` supports today should produce calls;
 * everything else (apiKey-in-query, openIdConnect, mTLS, signing) is
 * dropped without warning.
 */
describe("detectAuthBindings", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "detectAuth-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    async function writeSpec(
        filename: string,
        securitySchemes: Record<string, unknown> | undefined
    ): Promise<RawSpecsManifestEntry> {
        const specPath = path.join(tmpDir, filename);
        const body =
            securitySchemes == null ? { openapi: "3.0.0" } : { openapi: "3.0.0", components: { securitySchemes } };
        await writeFile(specPath, JSON.stringify(body));
        return { type: "openapi", specPath };
    }

    it("no securitySchemes block → no bindings", async () => {
        const spec = await writeSpec("openapi0.json", undefined);
        const bindings = await detectAuthBindings({ openapiSpecs: [spec], binaryName: "acme" });
        expect(bindings).toEqual([]);
    });

    it("http bearer → .auth_scheme_env with <BIN>_<SCHEME>_TOKEN", async () => {
        const spec = await writeSpec("openapi0.json", {
            bearerAuth: { type: "http", scheme: "bearer" }
        });
        const bindings = await detectAuthBindings({ openapiSpecs: [spec], binaryName: "acme" });
        expect(bindings).toHaveLength(1);
        expect(bindings[0]?.rustCall).toBe('.auth_scheme_env("bearerAuth", "ACME_BEARER_AUTH_TOKEN")');
        expect(bindings[0]?.needsCredentialSourceImport).toBe(false);
    });

    it("oauth2 → .auth_scheme_env (treated like bearer)", async () => {
        const spec = await writeSpec("openapi0.json", {
            oauth: { type: "oauth2", flows: {} }
        });
        const bindings = await detectAuthBindings({ openapiSpecs: [spec], binaryName: "acme" });
        expect(bindings).toHaveLength(1);
        expect(bindings[0]?.rustCall).toBe('.auth_scheme_env("oauth", "ACME_OAUTH_TOKEN")');
    });

    it("apiKey in header → .auth_scheme_env with _API_KEY suffix", async () => {
        const spec = await writeSpec("openapi0.json", {
            apiKey: { type: "apiKey", in: "header", name: "X-Api-Key" }
        });
        const bindings = await detectAuthBindings({ openapiSpecs: [spec], binaryName: "acme" });
        expect(bindings).toHaveLength(1);
        expect(bindings[0]?.rustCall).toBe('.auth_scheme_env("apiKey", "ACME_API_KEY_API_KEY")');
    });

    it("http basic → .auth_basic_scheme with two AuthCredentialSource::from_env calls", async () => {
        const spec = await writeSpec("openapi0.json", {
            basicAuth: { type: "http", scheme: "basic" }
        });
        const bindings = await detectAuthBindings({ openapiSpecs: [spec], binaryName: "acme" });
        expect(bindings).toHaveLength(1);
        expect(bindings[0]?.rustCall).toBe(
            '.auth_basic_scheme("basicAuth", ' +
                'AuthCredentialSource::from_env("ACME_BASIC_AUTH_USERNAME"), ' +
                'AuthCredentialSource::from_env("ACME_BASIC_AUTH_PASSWORD"))'
        );
        expect(bindings[0]?.needsCredentialSourceImport).toBe(true);
    });

    it("unsupported schemes (apiKey in query/cookie, openIdConnect, mTLS) are dropped silently", async () => {
        const spec = await writeSpec("openapi0.json", {
            queryKey: { type: "apiKey", in: "query", name: "api_key" },
            cookieKey: { type: "apiKey", in: "cookie", name: "session" },
            openId: { type: "openIdConnect", openIdConnectUrl: "https://example.com" },
            mtls: { type: "mutualTLS" }
        });
        const bindings = await detectAuthBindings({ openapiSpecs: [spec], binaryName: "acme" });
        expect(bindings).toEqual([]);
    });

    it("multi-spec workspace: schemes from every spec are merged into a single binding list", async () => {
        const a = await writeSpec("openapi0.json", {
            bearerAuth: { type: "http", scheme: "bearer" }
        });
        const b = await writeSpec("openapi1.json", {
            apiKey: { type: "apiKey", in: "header", name: "X-Api-Key" }
        });
        const bindings = await detectAuthBindings({ openapiSpecs: [a, b], binaryName: "acme" });
        expect(bindings).toHaveLength(2);
        expect(bindings[0]?.rustCall).toBe('.auth_scheme_env("bearerAuth", "ACME_BEARER_AUTH_TOKEN")');
        expect(bindings[1]?.rustCall).toBe('.auth_scheme_env("apiKey", "ACME_API_KEY_API_KEY")');
    });

    it("multi-spec name collision: first-wins (matches the SDK's union behavior — verified in src/openapi/app.rs#merge_security_schemes)", async () => {
        const a = await writeSpec("openapi0.json", {
            auth: { type: "http", scheme: "bearer" }
        });
        const b = await writeSpec("openapi1.json", {
            auth: { type: "apiKey", in: "header", name: "X-Api-Key" }
        });
        const bindings = await detectAuthBindings({ openapiSpecs: [a, b], binaryName: "acme" });
        expect(bindings).toHaveLength(1);
        // First-wins: spec A's bearer scheme is kept; spec B's apiKey is dropped.
        expect(bindings[0]?.rustCall).toBe('.auth_scheme_env("auth", "ACME_AUTH_TOKEN")');
    });

    it("env-var prefix is always <BIN>_<SCHEME>_<KIND>, even for a single scheme — adding a 2nd spec later doesn't silently rename existing vars", async () => {
        const single = await writeSpec("single.json", {
            myToken: { type: "http", scheme: "bearer" }
        });
        const multi1 = await writeSpec("multi1.json", {
            myToken: { type: "http", scheme: "bearer" }
        });
        const multi2 = await writeSpec("multi2.json", {
            myKey: { type: "apiKey", in: "header", name: "X-Api-Key" }
        });

        const singleBindings = await detectAuthBindings({ openapiSpecs: [single], binaryName: "x" });
        expect(singleBindings[0]?.rustCall).toBe('.auth_scheme_env("myToken", "X_MY_TOKEN_TOKEN")');

        const multiBindings = await detectAuthBindings({ openapiSpecs: [multi1, multi2], binaryName: "x" });
        // myToken's env var is unchanged when a second spec/scheme is added.
        expect(multiBindings[0]?.rustCall).toBe('.auth_scheme_env("myToken", "X_MY_TOKEN_TOKEN")');
        expect(multiBindings[1]?.rustCall).toBe('.auth_scheme_env("myKey", "X_MY_KEY_API_KEY")');
    });
});
