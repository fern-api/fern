import { ReferenceConfigBuilder } from "@fern-api/base-generator";
import { php } from "@fern-api/php-codegen";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { HttpEndpoint, HttpService, ServiceId, TypeReference } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

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
            return getEndpointReference({
                context,
                serviceId,
                service,
                endpoint
            });
        })
        .filter((endpoint): endpoint is FernGeneratorCli.EndpointReference => !!endpoint);
}

function getEndpointReference({
    context,
    serviceId,
    service,
    endpoint
}: {
    context: SdkGeneratorContext;
    serviceId: ServiceId;
    service: HttpService;
    endpoint: HttpEndpoint;
}): FernGeneratorCli.EndpointReference {
    const endpointSignatureInfo = context.endpointGenerator.getEndpointSignatureInfo({
        serviceId,
        service,
        endpoint
    });
    const returnValue = getReturnValue({ context, endpoint });
    const snippet = getEndpointSnippet({ context, serviceId, service, endpoint, endpointSignatureInfo });

    return {
        title: {
            snippetParts: [
                {
                    text: getAccessFromRootClient({ context, service }) + "->"
                },
                {
                    text: getEndpointMethodName({ context, endpoint })
                },
                {
                    text: getReferenceEndpointInvocationParameters({ context, endpoint, endpointSignatureInfo })
                }
            ],
            returnValue
        },
        description: endpoint.docs,
        snippet: snippet.trim(),
        parameters: getEndpointParameters({ context, endpoint })
    };
}

function getAccessFromRootClient({ context, service }: { context: SdkGeneratorContext; service: HttpService }): string {
    const clientVariableName = context.getClientVariableName();
    const servicePath = service.name.fernFilepath.allParts.map((part) => part.camelCase.safeName);
    return servicePath.length > 0 ? `${clientVariableName}->${servicePath.join("->")}` : clientVariableName;
}

function getEndpointMethodName({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): string {
    return context.getEndpointMethodName(endpoint);
}

function getReferenceEndpointInvocationParameters({
    context,
    endpoint,
    endpointSignatureInfo
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
    endpointSignatureInfo: ReturnType<typeof context.endpointGenerator.getEndpointSignatureInfo>;
}): string {
    const parameters: string[] = [];

    for (const param of endpointSignatureInfo.pathParameters) {
        parameters.push(`$${param.name}`);
    }

    if (endpointSignatureInfo.requestParameter != null) {
        parameters.push(`$${endpointSignatureInfo.requestParameter.name}`);
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
    const endpointSignatureInfo = context.endpointGenerator.getEndpointSignatureInfo({
        serviceId: getServiceIdForEndpoint({ context, endpoint }),
        service: getServiceForEndpoint({ context, endpoint }),
        endpoint
    });
    const returnType = endpointSignatureInfo.returnType;
    if (returnType == null) {
        return undefined;
    }
    const returnTypeString = getPhpTypeString({ type: returnType, context });
    if (returnTypeString === "void") {
        return undefined;
    }
    return {
        text: returnTypeString
    };
}

function getPhpTypeString({ type, context }: { type: php.Type; context: SdkGeneratorContext }): string {
    const writer = new php.Writer({
        namespace: context.getRootNamespace(),
        rootNamespace: context.getRootNamespace(),
        customConfig: context.customConfig
    });

    type.write(writer);

    const typeName = writer.toString().trim();

    if (typeName === "" || typeName === "void") {
        return "void";
    }

    return typeName;
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
            name: `$${pathParam.name.camelCase.safeName}`,
            type: getPhpTypeStringFromTypeReference({ context, typeReference: pathParam.valueType }),
            description: pathParam.docs,
            required: true
        });
    });

    endpoint.queryParameters.forEach((queryParam) => {
        parameters.push({
            name: `$${queryParam.name.name.camelCase.safeName}`,
            type: getPhpTypeStringFromTypeReference({ context, typeReference: queryParam.valueType }),
            description: queryParam.docs,
            required: !queryParam.allowMultiple
        });
    });

    endpoint.headers.forEach((header) => {
        parameters.push({
            name: `$${header.name.name.camelCase.safeName}`,
            type: getPhpTypeStringFromTypeReference({ context, typeReference: header.valueType }),
            description: header.docs,
            required: true
        });
    });

    if (endpoint.requestBody != null && endpoint.requestBody.type === "inlinedRequestBody") {
        endpoint.requestBody.properties.forEach((property) => {
            parameters.push({
                name: `$${property.name.name.camelCase.safeName}`,
                type: getPhpTypeStringFromTypeReference({ context, typeReference: property.valueType }),
                description: property.docs,
                required: true
            });
        });
    } else if (endpoint.requestBody != null && endpoint.requestBody.type === "reference") {
        parameters.push({
            name: "$request",
            type: getPhpTypeStringFromTypeReference({ context, typeReference: endpoint.requestBody.requestBodyType }),
            description: endpoint.requestBody.docs,
            required: true
        });
    }

    return parameters;
}

function getPhpTypeStringFromTypeReference({
    context,
    typeReference
}: {
    context: SdkGeneratorContext;
    typeReference: TypeReference;
}): string {
    try {
        const phpType = context.phpTypeMapper.convert({ reference: typeReference });
        return getPhpTypeString({ type: phpType, context });
    } catch {
        return "mixed";
    }
}

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
    endpointSignatureInfo: ReturnType<typeof context.endpointGenerator.getEndpointSignatureInfo>;
}): string {
    const methodName = context.getEndpointMethodName(endpoint);
    const clientAccess = getAccessFromRootClient({ context, service });

    const params: string[] = [];

    for (const param of endpointSignatureInfo.pathParameters) {
        params.push(`$${param.name}`);
    }

    if (endpointSignatureInfo.requestParameter != null) {
        params.push(`$${endpointSignatureInfo.requestParameter.name}`);
    }

    const returnType = endpointSignatureInfo.returnType;
    let returnTypeStr = "";
    if (returnType != null) {
        const typeStr = getPhpTypeString({ type: returnType, context });
        if (typeStr !== "void") {
            returnTypeStr = `: ${typeStr}`;
        }
    }

    return `${clientAccess}->${methodName}(${params.join(", ")})${returnTypeStr};`;
}

function getServiceIdForEndpoint({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): ServiceId {
    for (const [serviceId, service] of Object.entries(context.ir.services)) {
        if (service.endpoints.some((e) => e.id === endpoint.id)) {
            return serviceId;
        }
    }
    throw new Error(`Could not find service for endpoint ${endpoint.id}`);
}

function getServiceForEndpoint({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): HttpService {
    const serviceId = getServiceIdForEndpoint({ context, endpoint });
    return context.getHttpServiceOrThrow(serviceId);
}

function isRootServiceId({ context, serviceId }: { context: SdkGeneratorContext; serviceId: ServiceId }): boolean {
    return context.ir.rootPackage.service === serviceId;
}

function getSectionTitle({ service }: { service: HttpService }): string {
    return service.displayName ?? service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join(" ");
}
