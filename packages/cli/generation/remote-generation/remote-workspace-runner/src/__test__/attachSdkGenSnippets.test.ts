import type { APIV1Write } from "@fern-api/fdr-sdk";
import { describe, expect, it, vi } from "vitest";

import { attachSdkGenSnippets, getSdkRequests } from "../attachSdkGenSnippets.js";
import type { SdkGenSnippetsQuery } from "../findSdkGenSnippets.js";

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

    it("skips entries that name no package, which FDR could not look up", () => {
        expect(
            getSdkRequests({
                javaSdk: { coordinate: "sdk", version: "1.0.0" },
                goSdk: { githubRepo: "  ", version: "1.0.0" }
            })
        ).toEqual([]);
        expect(getSdkRequests({ javaSdk: { coordinate: ":sdk", version: "1.0.0" } })).toEqual([]);
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
    const sdkNames = { typescript: ["acme-sdk"], python: ["acme-sdk"] };
    const snippetsByUrl: Record<string, string> = {
        "https://s3/typescript": JSON.stringify({ endpoints: { "/pet/{petId}": { GET: "client.pet.get()" } } }),
        "https://s3/python": JSON.stringify({ endpoints: { "/pet/{petId}": { GET: "client.pet.get()  # py" } } })
    };

    type FindSnippetsUrls = (query: SdkGenSnippetsQuery) => Promise<Map<string, string>>;
    type ReadSnippets = (snippetsUrl: string) => Promise<string>;

    function setup({
        enabled = true,
        origin = "https://sdk-gen.example",
        findSnippetsUrls = vi.fn<FindSnippetsUrls>(
            async ({ languages }) => new Map(languages.map((language) => [language, `https://s3/${language}`]))
        ),
        readSnippets = vi.fn<ReadSnippets>(async (url) => snippetsByUrl[url] ?? "{}")
    }: {
        enabled?: boolean;
        /** `null` stands for an origin that is not set. */
        origin?: string | null;
        findSnippetsUrls?: ReturnType<typeof vi.fn<FindSnippetsUrls>>;
        readSnippets?: ReturnType<typeof vi.fn<ReadSnippets>>;
    } = {}) {
        const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn() };
        const run = (
            apiDefinition: APIV1Write.ApiDefinition = definition(),
            config: APIV1Write.SnippetsConfig = snippetsConfig,
            names: Record<string, string[]> = sdkNames
        ) =>
            attachSdkGenSnippets(
                {
                    token: "token",
                    organization: "acme",
                    apiDefinition,
                    snippetsConfig: config,
                    sdkNames: names,
                    logger
                },
                { getOrigin: () => origin ?? undefined, findSnippetsUrls, readSnippets, isEnabled: () => enabled }
            );
        return { logger, findSnippetsUrls, readSnippets, run };
    }

    it("does nothing while the flag is off", async () => {
        const { logger, findSnippetsUrls, run } = setup({ enabled: false });
        const input = definition();

        expect(await run(input)).toBe(input);
        expect(findSnippetsUrls).not.toHaveBeenCalled();
        expect(logger.info).not.toHaveBeenCalled();
    });

    it("does nothing when no docs.yml entry names an SDK", async () => {
        const { findSnippetsUrls, run } = setup();
        const input = definition();

        expect(await run(input, {})).toBe(input);
        expect(findSnippetsUrls).not.toHaveBeenCalled();
    });

    it("warns, and leaves the definition as it is, when the sdk-gen-api origin is not set", async () => {
        const { logger, findSnippetsUrls, run } = setup({ origin: null });
        const input = definition();

        expect(await run(input)).toBe(input);
        expect(findSnippetsUrls).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("FERN_SDK_GEN_API_ORIGIN"));
    });

    it("finds the languages of one SDK name and version with a single lookup", async () => {
        const { findSnippetsUrls, run } = setup();

        await run();

        expect(findSnippetsUrls).toHaveBeenCalledTimes(1);
        expect(findSnippetsUrls).toHaveBeenCalledWith({
            origin: "https://sdk-gen.example",
            token: "token",
            organization: "acme",
            sdkName: "acme-sdk",
            version: "1.0.0",
            languages: ["typescript", "python"]
        });
    });

    it("looks up each version, and each SDK name, separately", async () => {
        const { findSnippetsUrls, run } = setup();

        await run(
            definition(),
            {
                typescriptSdk: { package: "@acme/sdk", version: "1.0.0" },
                pythonSdk: { package: "acme", version: "2.0.0" }
            },
            { typescript: ["acme-sdk"], python: ["acme-py"] }
        );

        expect(findSnippetsUrls.mock.calls.map(([query]) => [query.sdkName, query.version, query.languages])).toEqual([
            ["acme-sdk", "1.0.0", ["typescript"]],
            ["acme-py", "2.0.0", ["python"]]
        ]);
    });

    it("adds each language's code to the example of the endpoint with the same path and method", async () => {
        const { logger, run } = setup();

        const result = await run(definition({ root: [endpoint(), endpoint({ method: "DELETE" })] }));

        expect(result.rootPackage.endpoints[0]?.examples[0]?.codeSamples).toEqual([
            { language: "typescript", code: "client.pet.get()" },
            { language: "python", code: "client.pet.get()  # py" }
        ]);
        expect(result.rootPackage.endpoints[1]?.examples[0]?.codeSamples).toBeUndefined();
        expect(logger.info).toHaveBeenCalledWith("Loaded SDK snippets (typescript: 1, python: 1)");
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
            { language: "python", code: "client.pet.get()  # py" }
        ]);
    });

    it("leaves an endpoint with no example as it is", async () => {
        const { run } = setup();

        const result = await run(definition({ root: [endpoint({ examples: [] })] }));

        expect(result.rootPackage.endpoints[0]?.examples).toEqual([]);
    });

    it("tries the next SDK name of a language when the first has no snippets for it", async () => {
        const findSnippetsUrls = vi.fn<FindSnippetsUrls>(async ({ sdkName }) =>
            sdkName === "second" ? new Map([["typescript", "https://s3/typescript"]]) : new Map<string, string>()
        );
        const { run } = setup({ findSnippetsUrls });

        const result = await run(
            definition(),
            { typescriptSdk: snippetsConfig.typescriptSdk },
            { typescript: ["first", "second"] }
        );

        expect(result.rootPackage.endpoints[0]?.examples[0]?.codeSamples).toEqual([
            { language: "typescript", code: "client.pet.get()" }
        ]);
    });

    it("asks nothing, and does not warn, for a language the sdk-config.yml does not name", async () => {
        const { logger, findSnippetsUrls, run } = setup();

        await run(definition(), snippetsConfig, { go: ["other"] });

        expect(findSnippetsUrls).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("warns when no built SDK with snippets is found for a language", async () => {
        const { logger, run } = setup({
            findSnippetsUrls: vi.fn<FindSnippetsUrls>(async () => new Map<string, string>())
        });

        await run();

        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("No built typescript SDK 1.0.0"));
        expect(logger.info).not.toHaveBeenCalled();
    });

    it("warns, and leaves the definition usable, when the lookup fails", async () => {
        const { logger, run } = setup({
            findSnippetsUrls: vi.fn<FindSnippetsUrls>(async () => {
                throw new Error("401 unauthorized");
            })
        });

        const result = await run();

        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("401 unauthorized"));
        expect(result.rootPackage.endpoints[0]?.examples[0]?.codeSamples).toBeUndefined();
    });

    it("warns, and still adds the languages it could read, when one snippets file cannot be read", async () => {
        const { logger, run } = setup({
            readSnippets: vi.fn<ReadSnippets>(async (url) => {
                if (url.endsWith("python")) {
                    throw new Error("403 expired link");
                }
                return snippetsByUrl[url] ?? "{}";
            })
        });

        const result = await run();

        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("403 expired link"));
        expect(result.rootPackage.endpoints[0]?.examples[0]?.codeSamples).toEqual([
            { language: "typescript", code: "client.pet.get()" }
        ]);
    });
});
