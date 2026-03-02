import { ReferenceConfigBuilder } from "@fern-api/base-generator";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export function buildReference({
    context,
    endpointSnippets
}: {
    context: SdkGeneratorContext;
    endpointSnippets?: FernGeneratorExec.Endpoint[];
}): ReferenceConfigBuilder {
    const builder = new ReferenceConfigBuilder();
    const serviceEntries = Object.entries(context.ir.services);

    const snippetsByEndpointId = buildSnippetsByEndpointId(endpointSnippets ?? []);

    serviceEntries.forEach(([serviceId, service]) => {
        const section = isRootServiceId({ context, serviceId })
            ? builder.addRootSection()
            : builder.addSection({ title: getSectionTitle({ service }) });
        const endpoints = getEndpointReferencesForService({ context, service, endpointSnippets: snippetsByEndpointId });
        for (const endpoint of endpoints) {
            section.addEndpoint(endpoint);
        }
    });

    return builder;
}

function buildSnippetsByEndpointId(endpointSnippets: FernGeneratorExec.Endpoint[]): Record<string, string> {
    const snippets: Record<string, string> = {};
    for (const endpointSnippet of endpointSnippets) {
        if (endpointSnippet.id.identifierOverride == null) {
            continue;
        }
        if (endpointSnippet.snippet.type !== "python") {
            continue;
        }
        if (snippets[endpointSnippet.id.identifierOverride] != null) {
            continue;
        }
        snippets[endpointSnippet.id.identifierOverride] = endpointSnippet.snippet.syncClient;
    }
    return snippets;
}

function getEndpointReferencesForService({
    context,
    service,
    endpointSnippets
}: {
    context: SdkGeneratorContext;
    service: FernIr.HttpService;
    endpointSnippets: Record<string, string>;
}): FernGeneratorCli.EndpointReference[] {
    return service.endpoints
        .map((endpoint) => {
            return getEndpointReference({
                context,
                service,
                endpoint,
                endpointSnippets
            });
        })
        .filter((endpoint): endpoint is FernGeneratorCli.EndpointReference => endpoint != null);
}

function getEndpointReference({
    context,
    service,
    endpoint,
    endpointSnippets
}: {
    context: SdkGeneratorContext;
    service: FernIr.HttpService;
    endpoint: FernIr.HttpEndpoint;
    endpointSnippets: Record<string, string>;
}): FernGeneratorCli.EndpointReference | undefined {
    const methodName = endpoint.name.snakeCase.unsafeName;
    const accessPath = getAccessFromRootClient({ service });
    const parameters = getEndpointParameters({ endpoint });
    const sourceFilePath = getSourceFilePath({ context, service });
    const returnTypeStr = getReturnTypeString({ endpoint });

    // Use prerendered snippet if available, otherwise fallback to abbreviated form
    let snippet =
        endpointSnippets[endpoint.id] ?? `${accessPath}.${methodName}(${parameters.length > 0 ? "..." : ""})`;

    // Fix the snippet's method path if it doesn't match the expected access path
    snippet = fixSnippetMethodPath({ snippet, accessPath, methodName });

    const hasUserParameters = parameters.length > 0;

    // Add request_options parameter
    parameters.push({
        name: "request_options",
        type: "typing.Optional[RequestOptions]",
        description: "Request-specific configuration.",
        required: false
    });

    return {
        title: {
            snippetParts: [
                {
                    text: `${accessPath}.`
                },
                {
                    text: methodName,
                    location: sourceFilePath != null ? { path: sourceFilePath } : undefined
                },
                {
                    text: hasUserParameters ? `(...)` : `()`
                }
            ],
            returnValue: returnTypeStr != null ? { text: returnTypeStr } : undefined
        },
        description: endpoint.docs,
        snippet,
        parameters
    };
}

function getAccessFromRootClient({ service }: { service: FernIr.HttpService }): string {
    const clientVariableName = "client";
    const servicePath = service.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
    return servicePath.length > 0 ? `${clientVariableName}.${servicePath.join(".")}` : clientVariableName;
}

function getEndpointParameters({ endpoint }: { endpoint: FernIr.HttpEndpoint }): FernGeneratorCli.ParameterReference[] {
    const parameters: FernGeneratorCli.ParameterReference[] = [];

    endpoint.allPathParameters.forEach((pathParam) => {
        parameters.push({
            name: pathParam.name.snakeCase.unsafeName,
            type: getTypeString(pathParam.valueType),
            description: pathParam.docs,
            required: true
        });
    });

    endpoint.queryParameters.forEach((queryParam) => {
        parameters.push({
            name: queryParam.name.name.snakeCase.unsafeName,
            type: getTypeString(queryParam.valueType),
            description: queryParam.docs,
            required: !queryParam.allowMultiple
        });
    });

    endpoint.headers.forEach((header) => {
        parameters.push({
            name: header.name.name.snakeCase.unsafeName,
            type: getTypeString(header.valueType),
            description: header.docs,
            required: true
        });
    });

    if (endpoint.requestBody != null && endpoint.requestBody.type === "inlinedRequestBody") {
        endpoint.requestBody.properties.forEach((property) => {
            parameters.push({
                name: property.name.name.snakeCase.unsafeName,
                type: getTypeString(property.valueType),
                description: property.docs,
                required: true
            });
        });
    } else if (endpoint.requestBody != null && endpoint.requestBody.type === "reference") {
        parameters.push({
            name: "request",
            type: getTypeString(endpoint.requestBody.requestBodyType),
            description: endpoint.requestBody.docs,
            required: true
        });
    }

    return parameters;
}

function getTypeString(typeReference: FernIr.TypeReference): string {
    switch (typeReference.type) {
        case "primitive": {
            const primitiveType = typeReference.primitive.v1;
            switch (primitiveType) {
                case "STRING":
                case "BASE_64":
                case "BIG_INTEGER":
                    return "str";
                case "INTEGER":
                    return "int";
                case "LONG":
                    return "int";
                case "FLOAT":
                case "DOUBLE":
                    return "float";
                case "BOOLEAN":
                    return "bool";
                case "DATE":
                    return "datetime.date";
                case "DATE_TIME":
                    return "datetime.datetime";
                case "UUID":
                    return "uuid.UUID";
                case "UINT":
                case "UINT_64":
                    return "int";
                default:
                    return "typing.Any";
            }
        }
        case "container": {
            switch (typeReference.container.type) {
                case "list":
                    return `typing.List[${getTypeString(typeReference.container.list)}]`;
                case "set":
                    return `typing.Set[${getTypeString(typeReference.container.set)}]`;
                case "map":
                    return `typing.Dict[${getTypeString(typeReference.container.keyType)}, ${getTypeString(typeReference.container.valueType)}]`;
                case "optional":
                    return `typing.Optional[${getTypeString(typeReference.container.optional)}]`;
                case "literal":
                    return "typing.Literal";
                default:
                    return "typing.Any";
            }
        }
        case "named":
            return typeReference.name.pascalCase.unsafeName;
        case "unknown":
            return "typing.Any";
        default:
            return "typing.Any";
    }
}

function getSourceFilePath({
    context,
    service
}: {
    context: SdkGeneratorContext;
    service: FernIr.HttpService;
}): string | undefined {
    const modulePath = context.getModulePath().replace(/-/g, "_");
    const pathParts = service.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
    if (pathParts.length === 0) {
        return `src/${modulePath}/client.py`;
    }
    return `src/${modulePath}/${pathParts.join("/")}/client.py`;
}

function getReturnTypeString({ endpoint }: { endpoint: FernIr.HttpEndpoint }): string | undefined {
    const responseBody = endpoint.response?.body;
    if (responseBody == null) {
        return undefined;
    }
    switch (responseBody.type) {
        case "json": {
            const responseBodyType = responseBody.value.responseBodyType;
            return getTypeString(responseBodyType);
        }
        case "streaming":
            return "typing.Iterator[bytes]";
        case "fileDownload":
            return "typing.Iterator[bytes]";
        case "text":
            return "str";
        case "streamParameter":
            return undefined;
        default:
            return undefined;
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

function getSectionTitle({ service }: { service: FernIr.HttpService }): string {
    return service.displayName ?? service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join(" ");
}

function fixSnippetMethodPath({
    snippet,
    accessPath,
    methodName
}: {
    snippet: string;
    accessPath: string;
    methodName: string;
}): string {
    const expectedMethodCall = `${accessPath}.${methodName}(`;
    if (snippet.includes(expectedMethodCall)) {
        return snippet;
    }
    const wrongMethodCall = `client.${methodName}(`;
    if (accessPath !== "client" && snippet.includes(wrongMethodCall)) {
        return snippet.replace(wrongMethodCall, expectedMethodCall);
    }
    return snippet;
}
