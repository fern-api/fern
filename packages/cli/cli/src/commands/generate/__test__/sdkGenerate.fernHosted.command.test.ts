import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GenerateWorld, generate, generator, generatorsYml, OPENAPI } from "./sdkGenerateHarness.js";
import { featureFlags } from "./sdkGenerateMocks.js";

vi.mock("@fern-api/login", async () => (await import("./sdkGenerateMocks.js")).loginModule());
vi.mock("@fern-api/posthog-manager", async (importOriginal) =>
    (await import("./sdkGenerateMocks.js")).posthogModule(
        await importOriginal<typeof import("@fern-api/posthog-manager")>()
    )
);

// `output.location: fern-hosted`: the MCP server is generated into a temporary directory, and the bundle in it is
// deployed to Fern's hosted platform through FDR once the group has finished.

const MCP = "fernapi/fern-mcp-server";

const BUNDLE = {
    "metadata.json": JSON.stringify({ tools: [{ name: "getPet", method: "GET", path: "/pet/{petId}" }] }),
    "wrangler.jsonc":
        '{ "main": "engine.mjs", "compatibility_date": "2025-01-01", /* a comment */ "compatibility_flags": ["nodejs_compat"], }',
    "engine.mjs": "export default {};",
    "README.md": "not deployed"
};

const hosted = (slug: string | undefined, extra = ""): string =>
    generator(
        MCP,
        "0.1.0",
        `${extra}        output:\n          location: fern-hosted\n${slug == null ? "" : `          slug: ${slug}\n`}`
    );

describe("fern generate: fern-hosted output", { timeout: 120_000 }, () => {
    let world: GenerateWorld;

    beforeEach(async () => {
        world = new GenerateWorld();
        await world.setup();
        featureFlags.isEnabled.mockImplementation(async (_flag, context) => context.generator === MCP);
        world.sdkGenApi.willBuild("mcp", { files: BUNDLE });
        world.fdr.respond("POST /mcp-hosting/deploy", {
            slug: "acme-mcp",
            activeDeploymentId: "deployment-1",
            latestDeployment: { status: "active" },
            url: "https://acme-mcp.fernmcp.dev/mcp"
        });
    });

    afterEach(() => world.teardown());

    const run = (generators: string, args: Record<string, unknown> = {}) =>
        generate(world, {
            files: {
                "openapi/openapi.yml": OPENAPI,
                "generators.yml": generatorsYml({ groups: { mcp: [generators] }, defaultGroup: "mcp" })
            },
            args: { version: "1.0.0", ...args }
        });

    const deployRequests = () =>
        world.fdr.to("POST /mcp-hosting/deploy").map(({ body }) => body as Record<string, unknown>);

    it("deploys the generated bundle, with its modules and the generator that made it", async () => {
        const result = await run(hosted("acme-mcp", "        config:\n          serverName: acme\n"));

        expect(result.failed).toBe(false);
        expect(deployRequests()).toHaveLength(1);
        expect(deployRequests()[0]).toMatchObject({
            orgId: "acme",
            slug: "acme-mcp",
            mainModule: "engine.mjs",
            compatibilityDate: "2025-01-01",
            compatibilityFlags: ["nodejs_compat"],
            modules: [{ name: "engine.mjs", contentType: "application/javascript+module" }],
            generatorName: MCP,
            generatorVersion: "0.1.0",
            cliVersion: "0.0.0",
            config: { serverName: "acme" },
            metadata: {
                followRedirects: false,
                maxRedirects: 5,
                allowedRedirectHosts: [],
                tools: [{ name: "getPet", method: "GET", path: "/pet/{petId}" }]
            }
        });
        expect(result.logged('Deploying MCP server "acme-mcp" to org "acme"...')).toBe(true);
        expect(result.logged('Deployed MCP server "acme-mcp"')).toBe(true);
        expect(result.logged("https://acme-mcp.fernmcp.dev/mcp")).toBe(true);
        expect(result.logged("Manage it at https://dashboard.test/acme/mcp/acme-mcp")).toBe(true);
        // The README is not a module, and nothing is written into the project: the bundle lives in a temporary directory.
        expect(await result.generated("fern")).toEqual([]);
        expect((deployRequests()[0]?.modules as unknown[]).length).toBe(1);
    });

    it("asks sdk-gen-api for the server with a download, since its bundle is what gets deployed", async () => {
        await run(hosted("acme-mcp"));

        expect(world.sdkGenApi.submitted[0]).toMatchObject({
            language: "mcp",
            payloadKind: "sdk-config-v1",
            requestedOutput: { type: "download" }
        });
    });

    it("uploads each module's content to the registry's content store", async () => {
        await run(hosted("acme-mcp"));

        const uploads = world.fdr.requests.filter(
            (request) => request.method === "PUT" && request.path.startsWith("/v2/registry/content/acme/")
        );
        expect(uploads).toHaveLength(1);
    });

    it("deploys under the slug 'mcp' when generators.yml names none", async () => {
        const result = await run(hosted(undefined));

        expect(result.failed).toBe(false);
        expect(deployRequests()[0]?.slug).toBe("mcp");
    });

    it("reads the slug from the environment", async () => {
        vi.stubEnv("MCP_SLUG", "from-env");
        const result = await run(hosted("${MCP_SLUG}"));

        expect(result.failed).toBe(false);
        expect(deployRequests()[0]?.slug).toBe("from-env");
    });

    it("fails, deploying nothing, when the slug's variable is not set", async () => {
        const result = await run(hosted("${MCP_SLUG_NOT_SET}"));

        expect(result.failed).toBe(true);
        expect(result.errors.join("\n")).toContain("MCP_SLUG_NOT_SET");
        expect(deployRequests()).toEqual([]);
    });

    it("refuses a slug the platform would refuse", async () => {
        const result = await run(hosted("Not_A_Slug"));

        expect(result.failed).toBe(true);
        expect(result.errors.join("\n")).toContain(
            'The slug must be lowercase letters, digits, and single hyphens (got "Not_A_Slug").'
        );
        expect(deployRequests()).toEqual([]);
    });

    it("fails with the server's explanation, and says a running deployment is untouched, when the deploy is rejected", async () => {
        world.fdr.respond("POST /mcp-hosting/deploy", new Error("quota exceeded"));
        const result = await run(hosted("acme-mcp"));

        expect(result.failed).toBe(true);
        expect(result.errors.join("\n")).toContain("quota exceeded");
        expect(result.errors.join("\n")).toContain("that deployment is still serving");
    });

    it("fails when the deployment never became active", async () => {
        world.fdr.respond("POST /mcp-hosting/deploy", {
            slug: "acme-mcp",
            activeDeploymentId: null,
            latestDeployment: { status: "failed", error: "worker did not start" },
            url: "https://acme-mcp.fernmcp.dev/mcp"
        });
        const result = await run(hosted("acme-mcp"));

        expect(result.failed).toBe(true);
        expect(result.errors.join("\n")).toContain("worker did not start");
        expect(result.logged('Deployed MCP server "acme-mcp"')).toBe(false);
    });

    it("fails, naming the file, when the generated bundle is missing a required file", async () => {
        world.sdkGenApi.willBuild("mcp", { files: { "engine.mjs": "export default {};", "metadata.json": "{}" } });
        const result = await run(hosted("acme-mcp"));

        expect(result.failed).toBe(true);
        expect(result.errors.join("\n")).toContain("The server bundle is missing wrangler.jsonc");
        expect(deployRequests()).toEqual([]);
    });

    it("fails when the bundle's entry module is not in the bundle", async () => {
        world.sdkGenApi.willBuild("mcp", {
            files: { ...BUNDLE, "wrangler.jsonc": '{ "main": "missing.mjs", "compatibility_date": "2025-01-01" }' }
        });
        const result = await run(hosted("acme-mcp"));

        expect(result.failed).toBe(true);
        expect(result.errors.join("\n")).toContain(
            'The server bundle\'s entry module ("missing.mjs" per wrangler.jsonc) is not a file in the bundle.'
        );
    });

    it("does not deploy when generation failed", async () => {
        world.sdkGenApi.willBuild("mcp", { failure: "generator crashed" });
        const result = await run(hosted("acme-mcp"));

        expect(result.failed).toBe(true);
        expect(result.errors.join("\n")).toContain("generator crashed");
        expect(deployRequests()).toEqual([]);
        expect(world.fdr.requests.filter((request) => request.path.startsWith("/v2/registry/content"))).toEqual([]);
    });

    it("does not deploy a preview: the bundle is written to the preview directory instead", async () => {
        const result = await run(hosted("acme-mcp"), { preview: true });

        expect(result.failed).toBe(false);
        expect(deployRequests()).toEqual([]);
        expect(await result.list("fern/.preview")).toEqual([
            "fern-mcp-server/README.md",
            "fern-mcp-server/engine.mjs",
            "fern-mcp-server/metadata.json",
            "fern-mcp-server/wrangler.jsonc"
        ]);
    });

    it("refuses --dynamic-ir-only, before generating anything", async () => {
        const result = await run(hosted("acme-mcp"), { dynamicIrOnly: true });

        expect(result.failed).toBe(true);
        expect(result.failureMessage).toBe("--dynamic-ir-only cannot be combined with output.location: fern-hosted");
        expect(world.sdkGenApi.builds).toEqual([]);
        expect(deployRequests()).toEqual([]);
    });

    it("cannot run locally", async () => {
        const result = await run(hosted("acme-mcp"), { useLocalDocker: true });

        expect(result.failed).toBe(true);
        expect(result.errors.join("\n")).toContain(`${MCP} does not support --local.`);
        expect(deployRequests()).toEqual([]);
    });

    it("is not generated at all when the flag is off for the MCP generator", async () => {
        featureFlags.isEnabled.mockImplementation(async () => false);
        const result = await run(hosted("acme-mcp"));

        expect(result.failed).toBe(true);
        expect(result.errors.join("\n")).toContain("requires sdk-gen-api generation, which is not enabled");
        expect(world.sdkGenApi.builds).toEqual([]);
        expect(deployRequests()).toEqual([]);
    });
});
