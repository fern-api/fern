import { ReferenceConfigBuilder } from "@fern-api/base-generator";
import { go } from "@fern-api/go-ast";

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
            let singleEndpointSnippet;
            const exampleCall = context.maybeGetExampleEndpointCall(endpoint);
            if (exampleCall) {
                singleEndpointSnippet = context.snippetGenerator.getSingleEndpointSnippet({
                    endpoint,
                    example: exampleCall
                });
            }
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
    const servicePath = service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName);
    return servicePath.length > 0 ? `${clientVariableName}.${servicePath.join(".")}` : clientVariableName;
}

function getEndpointMethodName({ endpoint }: { endpoint: HttpEndpoint }): string {
    return endpoint.name.pascalCase.safeName;
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
        parameters.push(pathParam.name.pascalCase.safeName);
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
    return { text: returnTypeString };
}

function getGoTypeString({
    context,
    typeReference
}: {
    context: SdkGeneratorContext;
    typeReference: TypeReference;
}): string {
    const goType = context.goTypeMapper.convert({ reference: typeReference });
    return getSimpleTypeName(goType, context);
}

function getSimpleTypeName(goType: go.Type, context: SdkGeneratorContext): string {
    const simpleWriter = new go.Writer({
        packageName: context.getRootPackageName(),
        importPath: context.getInternalImportPath(),
        rootImportPath: context.getRootImportPath(),
        customConfig: context.customConfig
    });

    goType.write(simpleWriter);

    const typeName = simpleWriter.buffer.trim();

    // TODO: anything else??

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
            name: pathParam.name.camelCase.safeName,
            type: getGoTypeString({ context, typeReference: pathParam.valueType }),
            description: pathParam.docs,
            required: true
        });
    });

    endpoint.queryParameters.forEach((queryParam) => {
        parameters.push({
            name: queryParam.name.name.camelCase.safeName,
            type: getGoTypeString({ context, typeReference: queryParam.valueType }),
            description: queryParam.docs,
            required: !queryParam.allowMultiple
        });
    });

    endpoint.headers.forEach((header) => {
        parameters.push({
            name: header.name.name.camelCase.safeName,
            type: getGoTypeString({ context, typeReference: header.valueType }),
            description: header.docs,
            required: true
        });
    });

    if (endpoint.requestBody != null && endpoint.requestBody.type === "inlinedRequestBody") {
        endpoint.requestBody.properties.forEach((property) => {
            parameters.push({
                name: property.name.name.camelCase.safeName,
                type: getGoTypeString({ context, typeReference: property.valueType }),
                description: property.docs,
                required: true
            });
        });
    } else if (endpoint.requestBody != null && endpoint.requestBody.type === "reference") {
        parameters.push({
            name: "request",
            type: getGoTypeString({ context, typeReference: endpoint.requestBody.requestBodyType }),
            description: endpoint.requestBody.docs,
            required: true
        });
    }

    return parameters;
}

function isRootServiceId({ context, serviceId }: { context: SdkGeneratorContext; serviceId: ServiceId }): boolean {
    return context.ir.rootPackage.service === serviceId;
}

function getSectionTitle({ service }: { service: HttpService }): string {
    return service.displayName ?? service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join(" ");
}
