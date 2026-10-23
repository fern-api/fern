import type { APIV1Write } from "@fern-api/fdr-sdk";
import { describe, expect, it, vi } from "vitest";

import { attachSdkGenSnippets, getSdkRequests } from "../attachSdkGenSnippets.js";

const example = {
    path: "/pet/1",
    pathParameters: {},
    queryParameters: {},
    headers: {},
    requestBody: undefined,
    responseStatusCode: 200,
    responseBody: undefined
} satisfies APIV1Write.ExampleEndpointCall;

function endpoint({
    method = "GET",
    examples = [example]
}: {
    method?: APIV1Write.EndpointDefinition["method"];
    examples?: APIV1Write.ExampleEndpointCall[];
} = {}): APIV1Write.EndpointDefinition {
    return {
        method,
        id: "getPet",
        path: {
            parts: [
                { type: "literal", value: "/pet/" },
                { type: "pathParameter", value: "petId" }
            ],
            pathParameters: []
        },
        queryParameters: [],
        headers: [],
        examples
    };
}

function definition({
    root = [endpoint()],
    sub = []
}: {
    root?: APIV1Write.EndpointDefinition[];
    sub?: APIV1Write.EndpointDefinition[];
} = {}): APIV1Write.ApiDefinition {
    return {
        rootPackage: { endpoints: root, types: [], subpackages: ["pets"] },
        types: {},
        subpackages: { pets: { subpackageId: "pets", name: "pets", endpoints: sub, types: [], subpackages: [] } }
    };
}

describe("getSdkRequests", () => {
    it("reads each docs.yml entry that names a package and a version", () => {
        expect(
            getSdkRequests({
                typescriptSdk: { package: "@acme/sdk", version: "1.2.3" },
                pythonSdk: { package: "acme", version: "2.0.0" },
                javaSdk: { coordinate: "com.acme:sdk", version: "3.0.0" },
                goSdk: { githubRepo: "https://github.com/acme/sdk-go", version: "4.0.0" },
                rubySdk: { gem: "acme", version: "5.0.0" },
                csharpSdk: { package: "Acme.Sdk", version: "6.0.0" }
            })
        ).toEqual([
            { type: "typescript", package: "@acme/sdk", version: "1.2.3" },
            { type: "python", package: "acme", version: "2.0.0" },
            { type: "java", group: "com.acme", artifact: "sdk", version: "3.0.0" },
            { type: "go", githubRepo: "github.com/acme/sdk-go", version: "4.0.0" },
            { type: "ruby", gem: "acme", version: "5.0.0" },
            { type: "csharp", package: "Acme.Sdk", version: "6.0.0" }
        ]);
    });

    it("skips entries without a version and languages the store lacks", () => {
        expect(
            getSdkRequests({
                typescriptSdk: { package: "@acme/sdk" },
                pythonSdk: { package: "acme", version: "  " },
                phpSdk: { package: "acme/sdk", version: "1.0.0" }
            })
        ).toEqual([]);
    });
});

describe("attachSdkGenSnippets", () => {
    const snippetsConfig = {
        typescriptSdk: { package: "@acme/sdk", version: "1.0.0" },
        pythonSdk: { package: "acme", version: "1.0.0" }
    };
    const typescriptSnippets = { "/pet/{petId}": { GET: [{ type: "typescript", client: "client.pet.get()" }] } };
    const pythonSnippets = {
        "/pet/{petId}": { GET: [{ type: "python", sync_client: "SYNC", async_client: "ASYNC" }] }
    };

    function setup({
        enabled = true,
        load = vi.fn(async ({ sdks }: { sdks: Array<{ type: string }> }) => ({
            next: undefined,
            snippets: sdks[0]?.type === "python" ? pythonSnippets : typescriptSnippets
        }))
    }: {
        enabled?: boolean;
        load?: ReturnType<typeof vi.fn>;
    } = {}) {
        const logger = { info: vi.fn(), warn: vi.fn() };
        // The real client has many more members; the step only uses `snippets.load`.
        const createFdr = vi.fn(() => ({ snippets: { load } })) as never;
        const run = (
            apiDefinition: APIV1Write.ApiDefinition = definition(),
            config: APIV1Write.SnippetsConfig = snippetsConfig
        ) =>
            attachSdkGenSnippets(
                { token: "token", organization: "acme", apiDefinition, snippetsConfig: config, logger },
                { createFdr, isEnabled: () => enabled }
            );
        return { logger, load, run };
    }

    it("does nothing while the flag is off", async () => {
        const { logger, load, run } = setup({ enabled: false });
        const input = definition();

        expect(await run(input)).toBe(input);
        expect(load).not.toHaveBeenCalled();
        expect(logger.info).not.toHaveBeenCalled();
    });

    it("does nothing when no docs.yml entry names an SDK", async () => {
        const { load, run } = setup();
        const input = definition();

        expect(await run(input, {})).toBe(input);
        expect(load).not.toHaveBeenCalled();
    });

    it("asks FDR for the package and version each docs.yml entry names", async () => {
        const { load, run } = setup();

        await run();

        expect(load).toHaveBeenCalledWith({
            orgId: "acme",
            sdks: [{ type: "typescript", package: "@acme/sdk", version: "1.0.0" }]
        });
        expect(load).toHaveBeenCalledWith({
            orgId: "acme",
            sdks: [{ type: "python", package: "acme", version: "1.0.0" }]
        });
    });

    it("adds each language's code to the example of the endpoint with the same path and method", async () => {
        const { logger, run } = setup();

        const result = await run(definition({ root: [endpoint(), endpoint({ method: "DELETE" })] }));

        expect(result.rootPackage.endpoints[0]?.examples[0]?.codeSamples).toEqual([
            { language: "typescript", code: "client.pet.get()" },
            { language: "python", code: "SYNC" }
        ]);
        expect(result.rootPackage.endpoints[1]?.examples[0]?.codeSamples).toBeUndefined();
        expect(logger.info).toHaveBeenCalledWith("Loaded SDK snippets from FDR (typescript: 1, python: 1)");
    });

    it("also covers endpoints in subpackages", async () => {
        const { run } = setup();

        const result = await run(definition({ root: [], sub: [endpoint()] }));

        expect(result.subpackages.pets?.endpoints[0]?.examples[0]?.codeSamples).toHaveLength(2);
    });

    it("does not change the definition it was given", async () => {
        const { run } = setup();
        const input = definition();
        const before = JSON.stringify(input);

        await run(input);

        expect(JSON.stringify(input)).toBe(before);
    });

    it("keeps a sample the customer already wrote for that language", async () => {
        const { run } = setup();
        const customer = { language: "typescript", code: "customer()" };

        const result = await run(
            definition({ root: [endpoint({ examples: [{ ...example, codeSamples: [customer] }] })] })
        );

        expect(result.rootPackage.endpoints[0]?.examples[0]?.codeSamples).toEqual([
            customer,
            { language: "python", code: "SYNC" }
        ]);
    });

    it("leaves an endpoint with no example as it is", async () => {
        const { run } = setup();

        const result = await run(definition({ root: [endpoint({ examples: [] })] }));

        expect(result.rootPackage.endpoints[0]?.examples).toEqual([]);
    });

    it("warns, and still adds the languages it could read, when FDR fails for one of them", async () => {
        const { logger, run } = setup({
            load: vi.fn(async ({ sdks }: { sdks: Array<{ type: string }> }) => {
                if (sdks[0]?.type === "python") {
                    throw new Error("401 unauthorized");
                }
                return { next: undefined, snippets: typescriptSnippets };
            })
        });

        const result = await run();

        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("401 unauthorized"));
        expect(result.rootPackage.endpoints[0]?.examples[0]?.codeSamples).toEqual([
            { language: "typescript", code: "client.pet.get()" }
        ]);
    });

    it("warns when FDR has more than one page of snippets", async () => {
        const { logger, run } = setup({ load: vi.fn(async () => ({ next: 2, snippets: {} })) });

        await run();

        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("more typescript snippets"));
    });
});
