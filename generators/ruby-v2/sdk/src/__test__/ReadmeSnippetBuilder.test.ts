import { CaseConverter } from "@fern-api/base-generator";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { ReadmeSnippetBuilder } from "../readme/ReadmeSnippetBuilder.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

const caseConverter = new CaseConverter({ generationLanguage: "ruby", keywords: undefined, smartCasing: true });

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
            snippet: { type: "ruby", client: "# usage" }
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

function createContext(environments: FernIr.EnvironmentsConfig | undefined): SdkGeneratorContext {
    return {
        ir: {
            services: {
                users: {
                    name: { fernFilepath: { allParts: [], packagePath: [], file: undefined } },
                    endpoints: [{ id: ENDPOINT_ID, name: createName("list") }]
                }
            },
            readmeConfig: undefined,
            environments
        },
        config: { generatePaginatedClients: false },
        caseConverter,
        getRootFolderName: () => "acme",
        getRootModuleName: () => "Acme",
        getRootClientClassName: () => "Client",
        isMultipleBaseUrlsEnvironment: () => environments?.environments.type === "multipleBaseUrls"
    } as unknown as SdkGeneratorContext;
}

function environmentsAddendum(context: SdkGeneratorContext): string | undefined {
    const builder = new ReadmeSnippetBuilder({ context, endpointSnippets: createEndpointSnippets() });
    return builder.buildReadmeAddendumsByFeatureId()[builder.getEnvironmentFeatureIDName()];
}

describe("ReadmeSnippetBuilder environments addendum", () => {
    it("passes a multi-URL environment constant through the environment keyword", () => {
        const addendum = environmentsAddendum(createContext(createMultipleBaseUrlsEnvironments()));

        expect(addendum).toContain("environment: Acme::Environment::PRODUCTION");
        expect(addendum).not.toContain("base_url: Acme::Environment::PRODUCTION");
        expect(addendum).toContain('base_url: "https://example.com"');
    });

    it("passes a single-URL environment constant through base_url", () => {
        const addendum = environmentsAddendum(createContext(createSingleBaseUrlEnvironments()));

        expect(addendum).toContain("base_url: Acme::Environment::PRODUCTION");
        expect(addendum).not.toContain("environment:");
    });

    it("documents only a custom URL when the API declares no environments", () => {
        const addendum = environmentsAddendum(createContext(undefined));

        expect(addendum).not.toContain("### Environments");
        expect(addendum).toContain('base_url: "https://example.com"');
    });
});
