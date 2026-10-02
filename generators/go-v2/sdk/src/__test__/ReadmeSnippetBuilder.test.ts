import { CaseConverter } from "@fern-api/base-generator";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { ReadmeConfigBuilder } from "../readme/ReadmeConfigBuilder.js";
import { ENVIRONMENTS_FEATURE_ID, ReadmeSnippetBuilder } from "../readme/ReadmeSnippetBuilder.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

const caseConverter = new CaseConverter({ generationLanguage: "go", keywords: undefined, smartCasing: true });

function createName(originalName: string): FernIr.Name {
    const lower = originalName.toLowerCase();
    const upper = originalName.toUpperCase();
    return {
        originalName,
        camelCase: { unsafeName: lower, safeName: lower },
        snakeCase: { unsafeName: lower, safeName: lower },
        screamingSnakeCase: { unsafeName: upper, safeName: upper },
        pascalCase: { unsafeName: originalName, safeName: originalName }
    };
}

const ENDPOINT_ID = "endpoint_users.list";

function createEndpointSnippets(): FernGeneratorExec.Endpoint[] {
    return [
        {
            id: { path: "/users", method: "GET", identifierOverride: ENDPOINT_ID },
            snippet: { type: "go", client: "// usage" }
        } as unknown as FernGeneratorExec.Endpoint
    ];
}

function createMultipleBaseUrlsEnvironments(): FernIr.EnvironmentsConfig {
    return {
        defaultEnvironment: "ProductionId",
        environments: {
            type: "multipleBaseUrls",
            baseUrls: [
                { id: "api", name: createName("api") },
                { id: "auth", name: createName("auth") }
            ],
            environments: [
                {
                    id: "ProductionId",
                    name: createName("Production"),
                    urls: { api: "https://api.acme.com", auth: "https://auth.acme.com" }
                },
                {
                    id: "SandboxId",
                    name: createName("Sandbox"),
                    urls: { api: "https://sandbox-api.acme.com", auth: "https://sandbox-auth.acme.com" }
                }
            ]
        }
    } as unknown as FernIr.EnvironmentsConfig;
}

function createSingleBaseUrlEnvironments(): FernIr.EnvironmentsConfig {
    return {
        defaultEnvironment: "ProductionId",
        environments: {
            type: "singleBaseUrl",
            environments: [{ id: "ProductionId", name: createName("Production"), url: "https://api.acme.com" }]
        }
    } as unknown as FernIr.EnvironmentsConfig;
}

function createContext({
    environments,
    clientConstructorName
}: {
    environments: FernIr.EnvironmentsConfig | undefined;
    clientConstructorName: string;
}): SdkGeneratorContext {
    return {
        ir: {
            services: {
                users: {
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    endpoints: [{ id: ENDPOINT_ID, name: createName("list"), pagination: undefined }]
                }
            },
            auth: { schemes: [], requirement: "ALL" },
            sdkConfig: { hasPaginatedEndpoints: false },
            readmeConfig: undefined,
            environments
        },
        config: { generatePaginatedClients: false, organization: "acme", customConfig: undefined },
        logger: { debug: () => undefined, info: () => undefined, warn: () => undefined, error: () => undefined },
        caseConverter,
        getRootPackageName: () => "acme",
        getRootClientPackageName: () => "client",
        getClientConstructorName: () => clientConstructorName,
        isMultipleBaseUrlsEnvironment: () => environments?.environments.type === "multipleBaseUrls"
    } as unknown as SdkGeneratorContext;
}

function environmentsSnippets(context: SdkGeneratorContext): string[] {
    const builder = new ReadmeSnippetBuilder({ context, endpointSnippets: createEndpointSnippets() });
    return builder.buildReadmeSnippetsByFeatureId()[ENVIRONMENTS_FEATURE_ID] ?? [];
}

const FEATURES_YML_DESCRIPTION =
    "You can choose between different environments by using the `option.WithBaseURL` option. You can configure any arbitrary base\nURL, which is particularly useful in test environments.\n";

function environmentsFeature(context: SdkGeneratorContext): FernGeneratorCli.ReadmeFeature | undefined {
    const readme = new ReadmeConfigBuilder().build({
        context,
        remote: undefined,
        featureConfig: {
            features: [{ id: ENVIRONMENTS_FEATURE_ID, description: FEATURES_YML_DESCRIPTION }]
        } as unknown as FernGeneratorCli.FeatureConfig,
        endpointSnippets: createEndpointSnippets()
    });
    return readme.features?.find((feature) => feature.id === ENVIRONMENTS_FEATURE_ID);
}

describe("ReadmeSnippetBuilder environments", () => {
    it("passes a multi-URL environment through option.WithEnvironment and uses the configured constructor", () => {
        const context = createContext({
            environments: createMultipleBaseUrlsEnvironments(),
            clientConstructorName: "NewAcme"
        });

        const snippets = environmentsSnippets(context);

        expect(snippets).toHaveLength(1);
        const snippet = snippets[0];
        expect(snippet).toContain("client := client.NewAcme(");
        expect(snippet).toContain("option.WithEnvironment(acme.Environments.Production),");
        expect(snippet).not.toContain("WithBaseURL");
    });

    it("passes a single-URL environment constant through option.WithBaseURL", () => {
        const context = createContext({
            environments: createSingleBaseUrlEnvironments(),
            clientConstructorName: "NewClient"
        });

        const snippet = environmentsSnippets(context)[0];

        expect(snippet).toContain("client := client.NewClient(");
        expect(snippet).toContain("option.WithBaseURL(acme.Environments.Production),");
    });

    it("falls back to an example URL when the API declares no environments", () => {
        const context = createContext({ environments: undefined, clientConstructorName: "NewClient" });

        expect(environmentsSnippets(context)[0]).toContain('option.WithBaseURL("https://example.com"),');
    });

    it("describes multi-URL environments in terms of option.WithEnvironment and keeps the features.yml text otherwise", () => {
        const multi = environmentsFeature(
            createContext({ environments: createMultipleBaseUrlsEnvironments(), clientConstructorName: "NewClient" })
        );
        const single = environmentsFeature(
            createContext({ environments: createSingleBaseUrlEnvironments(), clientConstructorName: "NewClient" })
        );

        expect(multi?.description).toContain("`option.WithEnvironment` option");
        expect(multi?.description).toContain("`option.WithBaseURL` points every request");
        expect(multi?.snippets?.[0]).toContain("option.WithEnvironment(acme.Environments.Production),");
        expect(single?.description).toBe(FEATURES_YML_DESCRIPTION);
    });
});
