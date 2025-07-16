import { ReferenceConfigBuilder } from "@fern-api/base-generator";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { HttpEndpoint, HttpService, ServiceId, TypeReference } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { SingleEndpointSnippet } from "./EndpointSnippetsGenerator";

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
            const singleEndpointSnippet = context.snippetGenerator.getSingleEndpointSnippet({
                endpoint,
                example: context.getExampleEndpointCallOrThrow(endpoint)
            });
            if (!singleEndpointSnippet) {
                return undefined;
            }
            return getEndpointReference({
                context,
                serviceId,
                service,
                endpoint,
                singleEndpointSnippet
            });
        })
        .filter((endpoint): endpoint is FernGeneratorCli.EndpointReference => !!endpoint);
}

function getEndpointReference({
    context,
    serviceId,
    service,
    endpoint,
    singleEndpointSnippet
}: {
    context: SdkGeneratorContext;
    serviceId: ServiceId;
    service: HttpService;
    endpoint: HttpEndpoint;
    singleEndpointSnippet: SingleEndpointSnippet;
}): FernGeneratorCli.EndpointReference {
    return {
        title: {
            snippetParts: [
                {
                    text: getAccessFromRootClient({ context, service }) + "."
                },
                {
                    text: getEndpointMethodName({ endpoint })
                },
                {
                    text: getReferenceEndpointInvocationParameters({ context, endpoint })
                }
            ],
            returnValue: getReturnValue({ context, endpoint })
        },
        description: endpoint.docs,
        snippet: singleEndpointSnippet.endpointCall.trim(),
        parameters: getEndpointParameters({ context, endpoint })
    };
}

function getAccessFromRootClient({ context, service }: { context: SdkGeneratorContext; service: HttpService }): string {
    const clientVariableName = "client";
    const servicePath = service.name.fernFilepath.allParts.map((part) => part.camelCase.safeName);
    return servicePath.length > 0 ? `${clientVariableName}.${servicePath.join(".")}` : clientVariableName;
}

function getEndpointMethodName({ endpoint }: { endpoint: HttpEndpoint }): string {
    return endpoint.name.camelCase.safeName;
}

function getReferenceEndpointInvocationParameters({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): string {
    const parameters: string[] = [];

    // Add path parameters
    endpoint.allPathParameters.forEach((pathParam) => {
        parameters.push(pathParam.name.camelCase.safeName);
    });

    // Add request parameter if exists
    if (endpoint.requestBody != null) {
        switch (endpoint.requestBody.type) {
            case "inlinedRequestBody":
                parameters.push("request");
                break;
            case "reference":
                parameters.push("request");
                break;
            case "fileUpload":
                parameters.push("request");
                break;
            case "bytes":
                parameters.push("request");
                break;
        }
    }

    return `(${parameters.join(", ")})`;
}

function getReturnValue({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): { text: string } | undefined {
    const returnType = context.getReturnTypeForEndpoint(endpoint);
    const returnTypeString = getSimpleTypeName(returnType, context);
    if (returnTypeString === "void") {
        return undefined;
    }
    return {
        text: returnTypeString
    };
}

function getSimpleTypeName(returnType: unknown, context: SdkGeneratorContext): string {
    // Get the full type string to check if it's void
    const fullTypeString = (
        returnType as { toString: (args: { packageName: string; customConfig: unknown }) => string }
    ).toString({
        packageName: context.getCorePackageName(),
        customConfig: context.customConfig
    });

    if (fullTypeString === "void") {
        return "void";
    }

    // Extract just the class name without package/imports
    const lines = fullTypeString.split("\n");

    // Find the actual type declaration (skip package and import lines)
    for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip empty lines, package statements, and import statements
        if (!trimmedLine || trimmedLine.startsWith("package ") || trimmedLine.startsWith("import ")) {
            continue;
        }

        // This should be the actual type - return it as is
        return trimmedLine;
    }

    // Fallback: try to extract the last meaningful identifier
    // Look for patterns like "SomeClass" or "Optional<SomeClass>"
    const cleanedString = fullTypeString.replace(/package\s+[^;]+;/g, "").replace(/import\s+[^;]+;/g, "");
    const typeMatch = cleanedString.match(/([A-Z][a-zA-Z0-9_]*(?:<[^>]+>)?)/);
    if (typeMatch && typeMatch[1]) {
        return typeMatch[1];
    }

    // Final fallback: return the full string but log a warning
    context.logger.warn(`Could not extract simple type name from: ${fullTypeString}`);
    return fullTypeString;
}

function getEndpointParameters({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): FernGeneratorCli.ParameterReference[] {
    const parameters: FernGeneratorCli.ParameterReference[] = [];

    // Add path parameters
    endpoint.allPathParameters.forEach((pathParam) => {
        parameters.push({
            name: pathParam.name.camelCase.safeName,
            type: getJavaTypeString({ context, typeReference: pathParam.valueType }),
            description: pathParam.docs,
            required: true
        });
    });

    // Add query parameters
    endpoint.queryParameters.forEach((queryParam) => {
        parameters.push({
            name: queryParam.name.name.camelCase.safeName,
            type: getJavaTypeString({ context, typeReference: queryParam.valueType }),
            description: queryParam.docs,
            required: !queryParam.allowMultiple
        });
    });

    // Add header parameters
    endpoint.headers.forEach((header) => {
        parameters.push({
            name: header.name.name.camelCase.safeName,
            type: getJavaTypeString({ context, typeReference: header.valueType }),
            description: header.docs,
            required: true
        });
    });

    return parameters;
}

function getJavaTypeString({
    context,
    typeReference
}: {
    context: SdkGeneratorContext;
    typeReference: TypeReference;
}): string {
    // This would ideally use the Java type mapper from the context
    // For now, we'll provide basic type mapping
    try {
        const javaType = context.javaTypeMapper.convert({ reference: typeReference });
        return getSimpleTypeName(javaType, context);
    } catch {
        return "Object";
    }
}

function isRootServiceId({ context, serviceId }: { context: SdkGeneratorContext; serviceId: ServiceId }): boolean {
    return context.ir.rootPackage.service === serviceId;
}

function getSectionTitle({ service }: { service: HttpService }): string {
    return service.displayName ?? service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join(" ");
}
