import dedent from "dedent";

import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { isNonNullish } from "@fern-api/core-utils";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, FernFilepath, HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface EndpointWithFilepath {
    endpoint: HttpEndpoint;
    fernFilepath: FernFilepath;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static CLIENT_VARIABLE_NAME = "client";
    private static ERRORS_FEATURE_ID: FernGeneratorCli.FeatureId = "ERRORS";

    private readonly context: SdkGeneratorContext;
    private readonly endpointsById: Record<EndpointId, EndpointWithFilepath> = {};
    private readonly prerenderedSnippetsByEndpointId: Record<EndpointId, string> = {};
    private readonly defaultEndpointId: EndpointId;
    private readonly packageName: string;

    constructor({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }) {
        super({ endpointSnippets });
        this.context = context;

        this.endpointsById = this.buildEndpointsById();
        this.prerenderedSnippetsByEndpointId = this.buildPrerenderedSnippetsByEndpointId(endpointSnippets);
        this.defaultEndpointId =
            this.context.ir.readmeConfig?.defaultEndpoint != null
                ? this.context.ir.readmeConfig.defaultEndpoint
                : this.getDefaultEndpointId();
        this.packageName = this.context.configManager.get("packageName") || this.context.ir.apiName.snakeCase.safeName;
    }

    public buildReadmeSnippets(): Record<FernGeneratorCli.FeatureId, string[]> {
        const snippets: Record<FernGeneratorCli.FeatureId, string[]> = {};

        // Core usage snippet using prerendered snippets
        snippets[FernGeneratorCli.StructuredFeatureId.Usage] = this.buildUsageSnippets();

        // Error handling
        snippets[ReadmeSnippetBuilder.ERRORS_FEATURE_ID] = this.buildErrorSnippets();

        // Retries
        snippets[FernGeneratorCli.StructuredFeatureId.Retries] = this.buildRetrySnippets();

        // Timeouts
        snippets[FernGeneratorCli.StructuredFeatureId.Timeouts] = this.buildTimeoutSnippets();

        return snippets;
    }

    private buildUsageSnippets(): string[] {
        const endpointIds = this.getConfiguredEndpointIdsForFeature(FernGeneratorCli.StructuredFeatureId.Usage);
        if (endpointIds != null && endpointIds.length > 0) {
            return endpointIds.map((endpointId) => this.getSnippetForEndpointId(endpointId)).filter(isNonNullish);
        }
        const snippet = this.getSnippetForEndpointId(this.defaultEndpointId);
        return snippet != null ? [snippet] : [];
    }

    private buildErrorSnippets(): string[] {
        const errorEndpoints = this.getEndpointsForFeature(ReadmeSnippetBuilder.ERRORS_FEATURE_ID);
        return errorEndpoints.map((endpoint) =>
            this.writeCode(dedent`
                use ${this.packageName}::{ClientError, ApiClientBuilder};

                #[tokio::main]
                async fn main() -> Result<(), ClientError> {
                    let client = ApiClientBuilder::new("https://api.example.com")
                        .api_key("your-api-key")
                        .build()?;

                    match ${this.getMethodCall(endpoint)}().await {
                        Ok(response) => {
                            println!("Success: {:?}", response);
                        }
                        Err(ClientError::ApiError { status_code, body, .. }) => {
                            println!("API Error {}: {:?}", status_code, body);
                        }
                        Err(e) => {
                            println!("Other error: {:?}", e);
                        }
                    }
                    Ok(())
                }
            `)
        );
    }

    private buildRetrySnippets(): string[] {
        const retryEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Retries);
        return retryEndpoints.map((endpoint) =>
            this.writeCode(dedent`
                use ${this.packageName}::ApiClientBuilder;
                
                #[tokio::main]
                async fn main() {
                    let client = ApiClientBuilder::new("https://api.example.com")
                        .api_key("your-api-key")
                        .max_retries(3)
                        .build()
                        .expect("Failed to build client");

                    let response = ${this.getMethodCall(endpoint)}().await.expect("API call failed");
                }
            `)
        );
    }

    private buildTimeoutSnippets(): string[] {
        const timeoutEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Timeouts);
        return timeoutEndpoints.map((endpoint) =>
            this.writeCode(dedent`
                use ${this.packageName}::ApiClientBuilder;
                use std::time::Duration;
                
                #[tokio::main]
                async fn main() {
                    let client = ApiClientBuilder::new("https://api.example.com")
                        .api_key("your-api-key")
                        .timeout(Duration::from_secs(30))
                        .build()
                        .expect("Failed to build client");

                    let response = ${this.getMethodCall(endpoint)}().await.expect("API call failed");
                }
            `)
        );
    }

    private buildEndpointsById(): Record<EndpointId, EndpointWithFilepath> {
        const endpoints: Record<EndpointId, EndpointWithFilepath> = {};
        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                endpoints[endpoint.id] = {
                    endpoint,
                    fernFilepath: service.name.fernFilepath
                };
            }
        }
        return endpoints;
    }

    private buildPrerenderedSnippetsByEndpointId(
        endpointSnippets: FernGeneratorExec.Endpoint[]
    ): Record<EndpointId, string> {
        const snippets: Record<EndpointId, string> = {};
        for (const endpointSnippet of Object.values(endpointSnippets)) {
            if (endpointSnippet.id.identifierOverride == null) {
                throw new Error("Internal error; snippets must define the endpoint id to generate README.md");
            }
            // For now, we'll accept any snippet type and try to extract the client code
            // This is because Rust may not be officially supported in the union type yet
            const snippet = endpointSnippet.snippet as any;
            if (snippet.type === "rust" && snippet.client) {
                snippets[endpointSnippet.id.identifierOverride] = snippet.client;
            } else if (snippet.client) {
                // Fallback: use client property if it exists
                snippets[endpointSnippet.id.identifierOverride] = snippet.client;
            }
        }
        return snippets;
    }

    private getSnippetForEndpointId(endpointId: EndpointId): string | undefined {
        return this.prerenderedSnippetsByEndpointId[endpointId];
    }

    private getEndpointsForFeature(featureId: FeatureId): EndpointWithFilepath[] {
        const endpointIds = this.getConfiguredEndpointIdsForFeature(featureId) ?? [this.defaultEndpointId];
        return endpointIds.map(this.lookupEndpointById.bind(this)).filter(isNonNullish);
    }

    private getConfiguredEndpointIdsForFeature(featureId: FeatureId): EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }

    private lookupEndpointById(endpointId: EndpointId): EndpointWithFilepath | undefined {
        return this.endpointsById[endpointId];
    }

    private getMethodCall(endpoint: EndpointWithFilepath): string {
        const clientAccess = this.getAccessFromRootClient(endpoint.fernFilepath);
        const methodName = endpoint.endpoint.name.snakeCase.safeName;
        return `${clientAccess}.${methodName}`;
    }

    private getAccessFromRootClient(fernFilepath: FernFilepath): string {
        const clientAccessParts = fernFilepath.allParts.map((part) => part.snakeCase.safeName);
        return clientAccessParts.length > 0
            ? `${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME}.${clientAccessParts.join(".")}`
            : ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME;
    }

    private writeCode(code: string): string {
        return code.trim() + "\n";
    }
}
