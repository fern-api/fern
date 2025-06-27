import { writeFile } from "fs/promises";

import { File, GeneratorNotificationService, ReferenceConfigBuilder } from "@fern-api/base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractJavaGeneratorCli } from "@fern-api/java-base";
import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import * as FernGeneratorExecSerializers from "@fern-fern/generator-exec-sdk/serialization";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "./utils/convertEndpointSnippetRequest";
import { convertIr } from "./utils/convertIr";

export class SdkGeneratorCLI extends AbstractJavaGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: SdkCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): SdkCustomConfigSchema {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return parsed;
        }
        return {};
    }

    protected async publishPackage(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
        if (context.isSelfHosted()) {
            await this.generateGitHub({ context });
        }
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        const referenceConfigBuilder = new ReferenceConfigBuilder();

        if (context.config.output.snippetFilepath != null) {
            const snippetFilepath = context.config.output.snippetFilepath;
            let endpointSnippets: Endpoint[] = [];
            try {
                endpointSnippets = await this.generateSnippets({ context });
                // Populate reference config with endpoint information
                await this.populateReferenceConfig({ context, endpointSnippets, referenceConfigBuilder });
            } catch (e) {
                context.logger.warn("Failed to generate snippets, this is OK.");
            }

            try {
                await this.generateReadme({
                    context,
                    endpointSnippets
                });
            } catch (e) {
                context.logger.warn("Failed to generate README.md, this is OK.");
            }

            try {
                await this.generateReference({
                    context,
                    referenceConfigBuilder
                });
            } catch (e) {
                context.logger.warn("Failed to generate reference.md, this is OK.");
            }

            try {
                await this.generateSnippetsJson({
                    context,
                    endpointSnippets,
                    snippetFilepath
                });
            } catch (e) {
                context.logger.warn("Failed to generate snippets.json, this is OK");
            }
        }

        await context.project.persist();
    }

    private async generateSnippets({ context }: { context: SdkGeneratorContext }): Promise<Endpoint[]> {
        const endpointSnippets: Endpoint[] = [];
        const dynamicIr = context.ir.dynamic;

        if (!dynamicIr) {
            throw new Error("Cannot generate dynamic snippets without dynamic IR");
        }

        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            // NOTE: This will eventually become a shared library. See the generators/go-v2/sdk/src/SdkGeneratorCli.ts
            ir: convertIr(dynamicIr),
            config: context.config
        });

        for (const [endpointId, endpoint] of Object.entries(dynamicIr.endpoints)) {
            const method = endpoint.location.method;
            const path = FernGeneratorExec.EndpointPath(endpoint.location.path);

            for (const endpointExample of endpoint.examples ?? []) {
                const generatedSnippet = await dynamicSnippetsGenerator.generate(
                    convertDynamicEndpointSnippetRequest(endpointExample)
                );

                const syncClient = generatedSnippet.snippet + "\n";
                // TODO: Properly generate async client; this is a placeholder for now.
                const asyncClient = generatedSnippet.snippet + "\n";

                endpointSnippets.push({
                    exampleIdentifier: endpointExample.id,
                    id: {
                        method,
                        path,
                        identifierOverride: endpointId
                    },
                    snippet: FernGeneratorExec.EndpointSnippet.java({
                        syncClient,
                        asyncClient
                    })
                });
            }
        }

        return endpointSnippets;
    }

    private async generateReadme({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: Endpoint[];
    }): Promise<void> {
        const content = await context.generatorAgent.generateReadme({ context, endpointSnippets });
        context.project.addRawFiles(
            new File(context.generatorAgent.README_FILENAME, RelativeFilePath.of("."), content)
        );
    }

    private async generateSnippetsJson({
        context,
        endpointSnippets,
        snippetFilepath
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: Endpoint[];
        snippetFilepath: string;
    }): Promise<void> {
        if (endpointSnippets.length === 0) {
            context.logger.debug("No snippets were produced; skipping snippets.json generation.");
            return;
        }

        const snippets: FernGeneratorExec.Snippets = {
            endpoints: endpointSnippets,
            // TODO: Add types
            types: {}
        };

        await writeFile(
            snippetFilepath,
            JSON.stringify(await FernGeneratorExecSerializers.Snippets.jsonOrThrow(snippets), undefined, 4)
        );
    }

    private async populateReferenceConfig({
        context,
        endpointSnippets,
        referenceConfigBuilder
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: Endpoint[];
        referenceConfigBuilder: ReferenceConfigBuilder;
    }): Promise<void> {
        const dynamicIr = context.ir.dynamic;
        if (!dynamicIr) {
            context.logger.debug("No dynamic IR available for reference generation");
            return;
        }

        // Group endpoints by service
        const endpointsByService: Record<string, { endpoint: any; snippets: Endpoint[] }> = {};

        for (const endpointSnippet of endpointSnippets) {
            const endpointId = endpointSnippet.id.identifierOverride;
            if (!endpointId) {continue;}

            const dynamicEndpoint = dynamicIr.endpoints[endpointId];
            if (!dynamicEndpoint) {continue;}

            const serviceName = dynamicEndpoint.location.path.split("/")[1] || "root";

            if (!endpointsByService[serviceName]) {
                endpointsByService[serviceName] = {
                    endpoint: dynamicEndpoint,
                    snippets: []
                };
            }
            endpointsByService[serviceName].snippets.push(endpointSnippet);
        }

        // Create reference sections for each service
        for (const [serviceName, serviceData] of Object.entries(endpointsByService)) {
            const section = referenceConfigBuilder.addSection(
                serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
                `${serviceName} service endpoints`
            );

            for (const snippet of serviceData.snippets) {
                if (snippet.snippet.type === "java") {
                    const javaSnippet = snippet.snippet;
                    const endpointId = snippet.id.identifierOverride;
                    const dynamicEndpoint = endpointId ? dynamicIr.endpoints[endpointId] : undefined;

                    section.addEndpoint({
                        title: this.getEndpointTitle(dynamicEndpoint, snippet),
                        description: dynamicEndpoint?.docs,
                        snippet: javaSnippet.syncClient,
                        parameters: dynamicEndpoint ? this.extractParameters(dynamicEndpoint) : []
                    });
                }
            }
        }
    }

    private async generateReference({
        context,
        referenceConfigBuilder
    }: {
        context: SdkGeneratorContext;
        referenceConfigBuilder: ReferenceConfigBuilder;
    }): Promise<void> {
        if (referenceConfigBuilder.isEmpty()) {
            context.logger.debug("No reference content to generate");
            return;
        }

        const content = await context.generatorAgent.generateReference(referenceConfigBuilder);
        context.project.addRawFiles(
            new File(context.generatorAgent.getExportedReferenceFilePath(), RelativeFilePath.of("."), content)
        );
    }

    private getEndpointTitle(endpoint: FernIr.dynamic.Endpoint | undefined, snippet: Endpoint): string {
        if (!endpoint) {
            return `${snippet.id.method.toUpperCase()} ${snippet.id.path}`;
        }

        // Use display name if available, otherwise fallback to method + path
        const displayName = endpoint.displayName;
        if (displayName) {
            return displayName;
        }

        // Create a readable title from the endpoint name
        const endpointName = endpoint.name?.original || endpoint.name?.camelCase;
        if (endpointName) {
            // Convert camelCase to Title Case
            const titleCase = endpointName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
            return titleCase.trim();
        }

        return `${snippet.id.method.toUpperCase()} ${snippet.id.path}`;
    }

    private extractParameters(
        endpoint: FernIr.dynamic.Endpoint
    ): Array<{ name: string; type: string; description?: string }> {
        const parameters: Array<{ name: string; type: string; description?: string }> = [];

        // Extract path parameters
        const allPathParameters = [
            ...(endpoint.request.type === "inlined" ? endpoint.request.pathParameters || [] : []),
            ...(endpoint.request.type === "body" ? endpoint.request.pathParameters || [] : [])
        ];

        for (const pathParam of allPathParameters) {
            parameters.push({
                name: pathParam.name.camelCase || pathParam.name.original,
                type: this.getJavaTypeForDynamicType(pathParam.typeReference),
                description: pathParam.docs
            });
        }

        // Extract query parameters (for inlined requests)
        if (endpoint.request.type === "inlined" && endpoint.request.queryParameters) {
            for (const queryParam of endpoint.request.queryParameters) {
                parameters.push({
                    name: queryParam.name.camelCase || queryParam.name.original,
                    type: this.getJavaTypeForDynamicType(queryParam.typeReference),
                    description: queryParam.docs
                });
            }
        }

        // Extract headers (for inlined requests)
        if (endpoint.request.type === "inlined" && endpoint.request.headers) {
            for (const header of endpoint.request.headers) {
                parameters.push({
                    name: header.name.camelCase || header.name.original,
                    type: this.getJavaTypeForDynamicType(header.typeReference),
                    description: header.docs
                });
            }
        }

        // Extract request body (for body requests)
        if (endpoint.request.type === "body" && endpoint.request.body) {
            const bodyType = endpoint.request.body;
            let javaType = "Object";
            if (bodyType.type === "typeReference") {
                javaType = this.getJavaTypeForDynamicType(bodyType.value);
            } else if (bodyType.type === "bytes") {
                javaType = "byte[]";
            }

            parameters.push({
                name: "request",
                type: javaType,
                description: "Request body"
            });
        }

        // Extract request body properties (for inlined requests)
        if (endpoint.request.type === "inlined" && endpoint.request.body) {
            for (const bodyProperty of endpoint.request.body) {
                parameters.push({
                    name: bodyProperty.name.camelCase || bodyProperty.name.original,
                    type: this.getJavaTypeForDynamicType(bodyProperty.typeReference),
                    description: bodyProperty.docs
                });
            }
        }

        return parameters;
    }

    private getJavaTypeForDynamicType(typeRef: FernIr.dynamic.TypeReference): string {
        switch (typeRef.type) {
            case "primitive":
                switch (typeRef.value) {
                    case "STRING":
                        return "String";
                    case "INTEGER":
                        return "Integer";
                    case "DOUBLE":
                        return "Double";
                    case "BOOLEAN":
                        return "Boolean";
                    case "LONG":
                        return "Long";
                    case "DATE_TIME":
                        return "OffsetDateTime";
                    case "DATE":
                        return "LocalDate";
                    case "UUID":
                        return "UUID";
                    case "BASE_64":
                        return "String";
                    case "BIG_INTEGER":
                        return "BigInteger";
                    default:
                        return "Object";
                }
            case "optional":
                return `Optional<${this.getJavaTypeForDynamicType(typeRef.value)}>`;
            case "list":
                return `List<${this.getJavaTypeForDynamicType(typeRef.value)}>`;
            case "set":
                return `Set<${this.getJavaTypeForDynamicType(typeRef.value)}>`;
            case "map":
                return `Map<${this.getJavaTypeForDynamicType(typeRef.keyType)}, ${this.getJavaTypeForDynamicType(typeRef.valueType)}>`;
            case "named":
                // Use the type name for custom types
                return typeRef.name.pascalCase || typeRef.name.original || "Object";
            case "union":
                // For unions, use the base type name or generic Object
                return typeRef.name?.pascalCase || typeRef.name?.original || "Object";
            case "literal":
                // literal types
                if (typeRef.value.type === "string") {
                    return "String";
                } else if (typeRef.value.type === "boolean") {
                    return "Boolean";
                }
                return "Object";
            default:
                return "Object";
        }
    }

    private async generateGitHub({ context }: { context: SdkGeneratorContext }): Promise<void> {
        await context.generatorAgent.pushToGitHub({ context });
    }
}
