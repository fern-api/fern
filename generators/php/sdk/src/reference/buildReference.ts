import { ReferenceConfigBuilder } from "@fern-api/base-generator";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { HttpEndpoint, HttpService, ServiceId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { EndpointSignatureInfo } from "../endpoint/EndpointSignatureInfo";

// No unused type definitions or functions

/**
 * Gets a snippet for an endpoint from pregenerated snippets or generates a fallback
 */
function getEndpointSnippet({
    context,
    serviceId,
    service,
    endpoint,
    endpointSignatureInfo
}: {
    context: SdkGeneratorContext;
    serviceId: ServiceId;
    service: HttpService;
    endpoint: HttpEndpoint;
    endpointSignatureInfo: EndpointSignatureInfo;
}): string {
    try {
        // Generate the Method AST node using the endpoint generator
        const generatedMethods = context.endpointGenerator.generate({serviceId, service, endpoint});

        if (!generatedMethods || generatedMethods.length === 0) {
            context.logger.warn("No method AST nodes generated for endpoint", endpoint.name.camelCase.safeName);
            return createFallbackSnippet(context, serviceId, service, endpoint, endpointSignatureInfo);
        }

        // Get the first method (most endpoints will only generate one method)
        const methodAst = generatedMethods[0];
        if (!methodAst) {
            return createFallbackSnippet(context, serviceId, service, endpoint, endpointSignatureInfo);
        }

        // Get the namespace information needed for the toString method
        const location = context.getLocationForServiceId(serviceId);
        const rootNamespace = context.getRootNamespace();

        // Convert the Method AST node to a string representation
        const snippet = methodAst.toString({
            namespace: location.namespace,
            rootNamespace,
            customConfig: context.customConfig,
            skipImports: true // Skip imports to make the snippet cleaner
        });

        // Add a client prefix to show how to call the method
        const servicePath = isRootServiceId({ context, serviceId })
            ? ""
            : service.name.fernFilepath.allParts.map((part) => part.camelCase.safeName).join("->") + "->";

        const clientPrefix = `$client->${servicePath}`;

        // We only want to show the method call, not the entire implementation
        // Extract the method signature including the return type
        const methodSignatureRegex = /(?:public|private|protected)\s+(?:static\s+)?function\s+(\w+\([^)]*\))(?:\s*:\s*([^{\s]+))?/;
        const match = snippet.match(methodSignatureRegex);

        if (match && match[1]) {
            // Replace the method name with the client-prefixed version
            const methodName = context.getEndpointMethodName(endpoint);

            // Clean up default parameter values (e.g., "$request = new Request()" -> "$request")
            let cleanSignature = match[1];

            // Get the return type if available (match[2])
            const returnType = match[2] ? match[2].trim() : null;

            // Extract the parameter list
            const paramListMatch = cleanSignature.match(/\w+\(([^)]*)\)/);
            if (paramListMatch && paramListMatch[1]) {
                const paramList = paramListMatch[1];

                // Split parameters and clean each one
                const params = paramList.split(',').map(param => {
                    // Remove default values (anything after =)
                    const trimmedParam = param.trim();
                    const parts = trimmedParam.split('=');
                    // Make sure parts[0] exists and is not undefined before calling trim()
                    return parts.length > 0 && parts[0] !== undefined ? parts[0].trim() : '';
                }).filter(Boolean); // Remove any empty parameters

                // Reconstruct the clean signature
                const methodNameParts = cleanSignature.split('(');
                if (methodNameParts.length > 0 && methodNameParts[0]) {
                    cleanSignature = `${methodNameParts[0]}(${params.join(', ')})`;
                }
            }

            // Replace the method name with client prefix and add return type and semicolon
            let clientSnippet = cleanSignature.replace(methodName, `${clientPrefix}${methodName}`);

            // Add return type if available
            if (returnType) {
                clientSnippet += `: ${returnType}`;
            }

            // Add semicolon
            clientSnippet += ";";

            return clientSnippet;
        }

        // If we couldn't extract the method signature, fall back to a simple snippet
        return createFallbackSnippet(context, serviceId, service, endpoint, endpointSignatureInfo);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return createFallbackSnippet(context, serviceId, service, endpoint, endpointSignatureInfo);
    }
}

/**
 * Creates a fallback snippet when AST-based generation fails
 */
function createFallbackSnippet(
    context: SdkGeneratorContext,
    serviceId: ServiceId,
    service: HttpService,
    endpoint: HttpEndpoint,
    endpointSignatureInfo: EndpointSignatureInfo
): string {
    const methodName = context.getEndpointMethodName(endpoint);

    // Add a client prefix to show how to call the method
    const servicePath = isRootServiceId({ context, serviceId })
        ? ""
        : service.name.fernFilepath.allParts.map((part) => part.camelCase.safeName).join("->") + "->";

    const clientPrefix = `$client->${servicePath}`;

    // Build a parameter list based on endpoint signature info
    const params: string[] = [];

    // Add path parameters
    if (endpointSignatureInfo.pathParameters) {
        endpointSignatureInfo.pathParameters.forEach(param => {
            if (param && param.name) {
                const paramName = param.name.replace(/^\$/, "");
                params.push(`$${paramName}`);
            }
        });
    }

    // Add request parameter if present
    if (endpointSignatureInfo.requestParameter) {
        const requestType = endpointSignatureInfo.requestParameter.type;
        let requestTypeName = "";

        // Try to extract the type name from the request parameter
        if (typeof requestType === "object" && requestType !== null) {
            const typeObj = requestType as any;
            if (typeObj.internalType?.value?.name) {
                requestTypeName = typeObj.internalType.value.name;
            }
        }

        // Add the request parameter with its type if available
        if (requestTypeName) {
            params.push(`${requestTypeName} $request`);
        } else {
            params.push("$request");
        }
    }

    // Add return type if available
    let returnTypeStr = "";
    if (endpointSignatureInfo.returnType) {
        const returnType = endpointSignatureInfo.returnType;
        // Try to extract the return type name
        if (typeof returnType === "object" && returnType !== null) {
            const typeObj = returnType as any;
            if (typeObj.internalType?.value?.name) {
                returnTypeStr = `: ${typeObj.internalType.value.name}`;
            } else if (typeObj.primitive) {
                returnTypeStr = `: ${typeObj.primitive}`;
            }
        }
    }

    const simpleSnippet = `${clientPrefix}${methodName}(${params.join(", ")})${returnTypeStr};`;
    return simpleSnippet;
}

export function buildReference({ context }: { context: SdkGeneratorContext }): ReferenceConfigBuilder {
    const builder = new ReferenceConfigBuilder();
    const serviceEntries = Object.entries(context.ir.services);

    serviceEntries.forEach(([serviceId, service]) => {
        const section = isRootServiceId({ context, serviceId })
            ? builder.addRootSection()
            : builder.addSection({ title: getSectionTitle({ service }) });
        const endpoints = getEndpointReferencesForService({ context, serviceId, service });
        for (const endpoint of endpoints) {
            section.addEndpoint(endpoint);
        }
    });

    return builder;
}

function getEndpointReferencesForService({
    context,
    serviceId,
    service
}: {
    context: SdkGeneratorContext;
    serviceId: ServiceId;
    service: HttpService;
}): FernGeneratorCli.EndpointReference[] {
    return service.endpoints
        .map((endpoint) => {
            const endpointSignatureInfo = context.endpointGenerator.getEndpointSignatureInfo({
                serviceId,
                service,
                endpoint
            });
            const snippet = getEndpointSnippet({
                context,
                serviceId,
                service,
                endpoint,
                endpointSignatureInfo
            });

            // Create a simpler endpoint reference without the complex title parts
            // Cast to FernGeneratorCli.EndpointReference to satisfy TypeScript
            return {
                title: {
                    snippetParts: [
                        {
                            text: snippet
                        }
                    ]
                },
                description: endpoint.docs,
                snippet: snippet.trim(),
                parameters: []
            } as FernGeneratorCli.EndpointReference;
        })
        .filter((endpoint): endpoint is FernGeneratorCli.EndpointReference => !!endpoint);
}

export function isRootServiceId({
    context,
    serviceId
}: {
    context: SdkGeneratorContext;
    serviceId: ServiceId;
}): boolean {
    return context.ir.rootPackage.service === serviceId;
}

export function getSectionTitle({ service }: { service: HttpService }): string {
    return service.displayName ?? service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join(" ");
}
