import { ReferenceConfigBuilder } from "@fern-api/base-generator";
import { join, RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { SingleEndpointSnippet } from "./EndpointSnippetsGenerator.js";

export function buildReference({ context }: { context: SdkGeneratorContext }): ReferenceConfigBuilder {
    const builder = new ReferenceConfigBuilder();
    const serviceEntries = Object.entries(context.ir.services);

    serviceEntries.forEach(([serviceId, service]) => {
        const section = isRootServiceId({ context, serviceId })
            ? builder.addRootSection()
            : builder.addSection({ title: getSectionTitle({ context, service }) });
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
    serviceId: FernIr.ServiceId;
    service: FernIr.HttpService;
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
    serviceId: FernIr.ServiceId;
    service: FernIr.HttpService;
    endpoint: FernIr.HttpEndpoint;
    singleEndpointSnippet: SingleEndpointSnippet;
}): FernGeneratorCli.EndpointReference {
    const returnValue = getReturnValue({ context, endpoint });
    const serviceFilepath = getServiceFilepath({ context, serviceId, service });
    return {
        title: {
            snippetParts: [
                {
                    text: getAccessFromRootClient({ context, service }) + "."
                },
                {
                    text: getEndpointMethodName({ context, endpoint }),
                    location: serviceFilepath != null ? { path: serviceFilepath } : undefined
                },
                {
                    text: getReferenceEndpointInvocationParameters({ context, endpoint })
                }
            ],
            returnValue
        },
        description: endpoint.docs,
        snippet: singleEndpointSnippet.endpointCall.trim(),
        parameters: getEndpointParameters({ context, serviceId, endpoint })
    };
}

function getServiceFilepath({
    context,
    serviceId,
    service
}: {
    context: SdkGeneratorContext;
    serviceId: FernIr.ServiceId;
    service: FernIr.HttpService;
}): string | undefined {
    // For root service, the client file is at lib/<gem_name>/client.rb
    if (isRootServiceId({ context, serviceId })) {
        return "/" + join(context.getRootFolderPath(), RelativeFilePath.of("client.rb"));
    }

    // For subpackage services, the client file is at lib/<gem_name>/<subpackage_path>/client.rb
    const servicePath = service.name.fernFilepath.allParts.map((part) => context.caseConverter.snakeSafe(part));
    if (servicePath.length > 0) {
        return (
            "/" +
            join(
                context.getRootFolderPath(),
                ...servicePath.map((p) => RelativeFilePath.of(p)),
                RelativeFilePath.of("client.rb")
            )
        );
    }

    return undefined;
}

function getAccessFromRootClient({
    context,
    service
}: {
    context: SdkGeneratorContext;
    service: FernIr.HttpService;
}): string {
    const clientVariableName = "client";
    const servicePath = service.name.fernFilepath.allParts.map((part) => context.caseConverter.snakeSafe(part));
    return servicePath.length > 0 ? `${clientVariableName}.${servicePath.join(".")}` : clientVariableName;
}

function getEndpointMethodName({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
}): string {
    return context.caseConverter.snakeSafe(endpoint.name);
}

function getReferenceEndpointInvocationParameters({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
}): string {
    const parameters: string[] = [];

    endpoint.allPathParameters.forEach((pathParam) => {
        parameters.push(context.caseConverter.snakeSafe(pathParam.name));
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
    endpoint: FernIr.HttpEndpoint;
}): { text: string } | undefined {
    const returnType = context.getReturnTypeForEndpoint(endpoint);
    const returnTypeString = getSimpleTypeName(returnType, context);
    return { text: returnTypeString };
}

function getRubyTypeString({
    context,
    typeReference
}: {
    context: SdkGeneratorContext;
    typeReference: FernIr.TypeReference;
}): string {
    const rubyType = context.typeMapper.convert({ reference: typeReference });
    return getSimpleTypeName(rubyType, context);
}

function getSimpleTypeName(rubyType: ruby.Type, context: SdkGeneratorContext): string {
    const simpleWriter = new ruby.Writer({
        customConfig: context.customConfig
    });

    rubyType.write(simpleWriter);

    const typeName = simpleWriter.buffer.trim();

    // TODO: anything else??

    return typeName;
}

function getEndpointParameters({
    context,
    serviceId,
    endpoint
}: {
    context: SdkGeneratorContext;
    serviceId: FernIr.ServiceId;
    endpoint: FernIr.HttpEndpoint;
}): FernGeneratorCli.ParameterReference[] {
    const parameters: FernGeneratorCli.ParameterReference[] = [];

    endpoint.allPathParameters.forEach((pathParam) => {
        parameters.push({
            name: context.caseConverter.snakeSafe(pathParam.name),
            type: getRubyTypeString({ context, typeReference: pathParam.valueType }),
            description: pathParam.docs,
            required: true
        });
    });

    endpoint.queryParameters.forEach((queryParam) => {
        parameters.push({
            name: context.caseConverter.snakeSafe(queryParam.name),
            type: getRubyTypeString({ context, typeReference: queryParam.valueType }),
            description: queryParam.docs,
            required: !queryParam.allowMultiple
        });
    });

    endpoint.headers.forEach((header) => {
        parameters.push({
            name: context.caseConverter.snakeSafe(header.name),
            type: getRubyTypeString({ context, typeReference: header.valueType }),
            description: header.docs,
            required: true
        });
    });

    if (endpoint.requestBody != null && endpoint.requestBody.type === "inlinedRequestBody") {
        endpoint.requestBody.properties.forEach((property) => {
            parameters.push({
                name: context.caseConverter.snakeSafe(property.name),
                type: getRubyTypeString({ context, typeReference: property.valueType }),
                description: property.docs,
                required: true
            });
        });
    } else if (endpoint.requestBody != null && endpoint.requestBody.type === "reference") {
        parameters.push({
            name: "request",
            type: getRubyTypeString({ context, typeReference: endpoint.requestBody.requestBodyType }),
            description: endpoint.requestBody.docs,
            required: true
        });
    }

    // Add request_options parameter for all endpoints (parity with TypeScript)
    const requestOptionsType = getRequestOptionsType({ context, serviceId });
    parameters.push({
        name: "request_options",
        type: requestOptionsType,
        description: undefined,
        required: false
    });

    return parameters;
}

function getRequestOptionsType({
    context,
    serviceId
}: {
    context: SdkGeneratorContext;
    serviceId: FernIr.ServiceId;
}): string {
    // For root service, use the root module's RequestOptions
    if (isRootServiceId({ context, serviceId })) {
        return `${context.getRootModuleName()}::RequestOptions`;
    }

    // For subpackage services, use the subpackage's RequestOptions
    try {
        const subpackage = context.getSubpackageForServiceId(serviceId);
        const modulePath = [
            context.getRootModuleName(),
            ...subpackage.fernFilepath.allParts.map((part) => context.caseConverter.pascalSafe(part))
        ].join("::");
        return `${modulePath}::RequestOptions`;
    } catch {
        // Fallback to root module's RequestOptions if subpackage not found
        return `${context.getRootModuleName()}::RequestOptions`;
    }
}

function isRootServiceId({
    context,
    serviceId
}: {
    context: SdkGeneratorContext;
    serviceId: FernIr.ServiceId;
}): boolean {
    return context.ir.rootPackage.service === serviceId;
}

function getSectionTitle({ context, service }: { context: SdkGeneratorContext; service: FernIr.HttpService }): string {
    return (
        service.displayName ??
        service.name.fernFilepath.allParts.map((part) => context.caseConverter.pascalSafe(part)).join(" ")
    );
}
