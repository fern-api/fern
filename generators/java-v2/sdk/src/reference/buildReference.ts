import { ReferenceConfigBuilder } from "@fern-api/base-generator";
import { java } from "@fern-api/java-ast";

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
    const returnValue = getReturnValue({ context, endpoint });
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
            returnValue
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

    endpoint.allPathParameters.forEach((pathParam) => {
        parameters.push(pathParam.name.camelCase.safeName);
    });

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
    const javaType = returnType as java.Type;

    const simpleWriter = new java.Writer({
        packageName: context.getCorePackageName(),
        customConfig: context.customConfig
    });

    javaType.write(simpleWriter);

    const typeName = simpleWriter.buffer.trim();

    // Handle void case
    if (typeName === "Void") {
        return "void";
    }

    const escapedTypeName = typeName.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return escapedTypeName;
}

function getEndpointParameters({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): FernGeneratorCli.ParameterReference[] {
    const parameters: FernGeneratorCli.ParameterReference[] = [];

    endpoint.allPathParameters.forEach((pathParam) => {
        parameters.push({
            name: pathParam.name.camelCase.safeName,
            type: getJavaTypeString({ context, typeReference: pathParam.valueType }),
            description: pathParam.docs,
            required: true
        });
    });

    endpoint.queryParameters.forEach((queryParam) => {
        parameters.push({
            name: queryParam.name.name.camelCase.safeName,
            type: getJavaTypeString({ context, typeReference: queryParam.valueType }),
            description: queryParam.docs,
            required: !queryParam.allowMultiple
        });
    });

    endpoint.headers.forEach((header) => {
        parameters.push({
            name: header.name.name.camelCase.safeName,
            type: getJavaTypeString({ context, typeReference: header.valueType }),
            description: header.docs,
            required: true
        });
    });

    if (endpoint.requestBody != null && endpoint.requestBody.type === "inlinedRequestBody") {
        endpoint.requestBody.properties.forEach((property) => {
            parameters.push({
                name: property.name.name.camelCase.safeName,
                type: getJavaTypeString({ context, typeReference: property.valueType }),
                description: property.docs,
                required: true
            });
        });
    } else if (endpoint.requestBody != null && endpoint.requestBody.type === "reference") {
        parameters.push({
            name: "request",
            type: getJavaTypeString({ context, typeReference: endpoint.requestBody.requestBodyType }),
            description: endpoint.requestBody.docs,
            required: true
        });
    }

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
        return getJavaTypeStringForParameter(javaType, context);
    } catch {
        return "Object";
    }
}

function getJavaTypeStringForParameter(returnType: unknown, context: SdkGeneratorContext): string {
    const javaType = returnType as java.Type;

    const simpleWriter = new java.Writer({
        packageName: context.getCorePackageName(),
        customConfig: context.customConfig
    });

    javaType.write(simpleWriter);

    const typeName = simpleWriter.buffer.trim();

    // Handle void case
    if (typeName === "Void") {
        return "void";
    }

    return typeName;
}

function isRootServiceId({ context, serviceId }: { context: SdkGeneratorContext; serviceId: ServiceId }): boolean {
    return context.ir.rootPackage.service === serviceId;
}

function getSectionTitle({ service }: { service: HttpService }): string {
    return service.displayName ?? service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join(" ");
}
