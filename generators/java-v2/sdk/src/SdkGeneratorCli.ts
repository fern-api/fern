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
                // Create a custom dynamic snippets generator with only this specific endpoint
                const convertedIr = convertIr(dynamicIr);
                const specificEndpoint = convertedIr.endpoints[endpointId];
                if (!specificEndpoint) {
                    throw new Error(`Endpoint ${endpointId} not found in converted IR`);
                }
                
                const filteredIr = {
                    ...convertedIr,
                    endpoints: { [endpointId]: specificEndpoint }
                };
                
                const customSnippetsGenerator = new DynamicSnippetsGenerator({
                    ir: filteredIr,
                    config: context.config
                });
                
                const generatedSnippet = await customSnippetsGenerator.generate(
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

    private async generateGitHub({ context }: { context: SdkGeneratorContext }): Promise<void> {
        await context.generatorAgent.pushToGitHub({ context });
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
        const ir = context.ir;

        // Create a map of endpoint snippets by endpoint ID for quick lookup
        const snippetsByEndpointId = new Map<string, Endpoint>();
        for (const snippet of endpointSnippets) {
            if (snippet.id.identifierOverride) {
                snippetsByEndpointId.set(snippet.id.identifierOverride, snippet);
            }
        }

        for (const [serviceId, service] of Object.entries(ir.services)) {
            const serviceEndpoints = service.endpoints.filter((endpoint) => snippetsByEndpointId.has(endpoint.id));

            if (serviceEndpoints.length === 0) {
                continue;
            }

            const isRootService = ir.rootPackage.service === serviceId;

            // Create appropriate section
            const section = isRootService
                ? referenceConfigBuilder.addRootSection()
                : referenceConfigBuilder.addSection({
                      title: this.getServiceSectionTitle(service),
                      description: service.displayName || undefined
                  });

            for (const endpoint of serviceEndpoints) {
                const snippet = snippetsByEndpointId.get(endpoint.id);
                if (snippet && snippet.snippet.type === "java") {
                    section.addEndpoint({
                        title: {
                            snippetParts: [
                                {
                                    text: this.getEndpointMethodCall(endpoint, service, context)
                                }
                            ]
                        },
                        description: endpoint.docs,
                        snippet: snippet.snippet.syncClient,
                        parameters: this.extractEndpointParameters(endpoint, context).map((param) => ({
                            ...param,
                            required: true
                        }))
                    });
                }
            }
        }
    }

    private getServiceSectionTitle(service: IntermediateRepresentation["services"][string]): string {
        if (service.name?.fernFilepath && service.name.fernFilepath.allParts.length > 0) {
            const pathParts = service.name.fernFilepath.allParts.map(
                (part) => part.pascalCase?.safeName || part.camelCase?.safeName || part.originalName || "Unknown"
            );
            return pathParts.join(" ") + " Service";
        }

        // Fallback to service name based on file name
        if (service.name?.fernFilepath?.file) {
            return (
                (service.name.fernFilepath.file.pascalCase?.safeName ||
                    service.name.fernFilepath.file.camelCase?.safeName ||
                    service.name.fernFilepath.file.originalName ||
                    "Service") + " Service"
            );
        }

        return "Service";
    }

    private getEndpointMethodCall(
        endpoint: IntermediateRepresentation["services"][string]["endpoints"][number],
        service: IntermediateRepresentation["services"][string],
        context: SdkGeneratorContext
    ): string {
        let methodCall = "client";

        // Add service path if not root service
        const isRootService = context.ir.rootPackage.service === service.name?.fernFilepath?.file?.originalName;
        if (!isRootService && service.name?.fernFilepath) {
            for (const pathPart of service.name.fernFilepath.packagePath) {
                const partName = pathPart.camelCase?.safeName || pathPart.originalName;
                methodCall += `.${partName}()`;
            }
        }

        // Add endpoint method name
        const endpointName = endpoint.name?.camelCase?.safeName || endpoint.name?.originalName || "unknown";
        methodCall += `.${endpointName}(...)`;

        return methodCall;
    }

    private extractEndpointParameters(
        endpoint: IntermediateRepresentation["services"][string]["endpoints"][number],
        context: SdkGeneratorContext
    ): Array<{ name: string; type: string; description?: string }> {
        const parameters: Array<{ name: string; type: string; description?: string }> = [];

        // Extract path parameters
        if (endpoint.allPathParameters) {
            for (const pathParam of endpoint.allPathParameters) {
                parameters.push({
                    name: pathParam.name?.camelCase?.safeName || pathParam.name?.originalName || "param",
                    type: this.extractSimpleTypeName(this.getJavaTypeForTypeReference(pathParam.valueType, context)),
                    description: pathParam.docs
                });
            }
        }

        // Extract query parameters
        if (endpoint.queryParameters) {
            for (const queryParam of endpoint.queryParameters) {
                parameters.push({
                    name: queryParam.name?.name?.camelCase?.safeName || queryParam.name?.name?.originalName || "param",
                    type: this.extractSimpleTypeName(this.getJavaTypeForTypeReference(queryParam.valueType, context)),
                    description: queryParam.docs
                });
            }
        }

        if (endpoint.headers) {
            for (const header of endpoint.headers) {
                parameters.push({
                    name: header.name?.name?.camelCase?.safeName || header.name?.name?.originalName || "header",
                    type: this.extractSimpleTypeName(this.getJavaTypeForTypeReference(header.valueType, context)),
                    description: header.docs
                });
            }
        }

        if (endpoint.requestBody) {
            const requestBody = endpoint.requestBody;
            let bodyType = "Object";
            let description = "Request body";

            if (requestBody.type === "reference") {
                bodyType = this.getJavaTypeForTypeReference(requestBody.requestBodyType, context);
                description = requestBody.docs || "Request body";
            } else if (requestBody.type === "inlinedRequestBody") {
                // For inlined request bodies, we might want to show the wrapper type
                bodyType = "Request"; // This could be more specific based on the endpoint
                description = requestBody.docs || "Request body";
            } else if (requestBody.type === "bytes") {
                bodyType = "byte[]";
                description = "Request body";
            } else if (requestBody.type === "fileUpload") {
                bodyType = "File";
                description = "File upload";
            }

            parameters.push({
                name: "request",
                type: this.extractSimpleTypeName(bodyType),
                description
            });
        }

        return parameters;
    }

    private getJavaTypeForTypeReference(typeRef: unknown, context: SdkGeneratorContext): string {
        if (!typeRef || typeof typeRef !== "object") {
            return "Object";
        }

        const typedRef = typeRef as { type?: string; [key: string]: unknown };

        switch (typedRef.type) {
            case "primitive":
                return this.mapPrimitiveToJavaType(typedRef.primitive as string);
            case "optional":
                return `Optional<${this.getJavaTypeForTypeReference(typedRef.itemType, context)}>`;
            case "list":
                return `List<${this.getJavaTypeForTypeReference(typedRef.itemType, context)}>`;
            case "set":
                return `Set<${this.getJavaTypeForTypeReference(typedRef.itemType, context)}>`;
            case "map":
                return `Map<${this.getJavaTypeForTypeReference(typedRef.keyType, context)}, ${this.getJavaTypeForTypeReference(typedRef.valueType, context)}>`;
            case "named":
                return (
                    (typedRef.name as { pascalCase?: { safeName?: string }; originalName?: string })?.pascalCase
                        ?.safeName ||
                    (typedRef.name as { pascalCase?: { safeName?: string }; originalName?: string })?.originalName ||
                    "Object"
                );
            case "union":
                return (
                    (typedRef.name as { pascalCase?: { safeName?: string }; originalName?: string })?.pascalCase
                        ?.safeName ||
                    (typedRef.name as { pascalCase?: { safeName?: string }; originalName?: string })?.originalName ||
                    "Object"
                );
            case "literal":
                if ((typedRef.literal as { type?: string })?.type === "string") {
                    return "String";
                } else if ((typedRef.literal as { type?: string })?.type === "boolean") {
                    return "Boolean";
                }
                return "Object";
            default:
                return "Object";
        }
    }

    private mapPrimitiveToJavaType(primitive: string): string {
        switch (primitive) {
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
    }

    private extractSimpleTypeName(fullTypeName: string): string {
        // Remove package declarations and imports to get just the type name
        const lines = fullTypeName.split("\n");
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("package ") && !trimmed.startsWith("import ")) {
                return trimmed;
            }
        }
        return fullTypeName;
    }

    private async generateReference({
        context,
        referenceConfigBuilder
    }: {
        context: SdkGeneratorContext;
        referenceConfigBuilder: ReferenceConfigBuilder;
    }): Promise<void> {
        if (referenceConfigBuilder.isEmpty()) {
            context.logger.debug("No reference config to generate, skipping reference.md generation.");
            return;
        }

        const referenceContent = await context.generatorAgent.generateReference(referenceConfigBuilder);
        context.project.addRawFiles(
            new File(context.generatorAgent.getExportedReferenceFilePath(), RelativeFilePath.of("."), referenceContent)
        );
    }
}
