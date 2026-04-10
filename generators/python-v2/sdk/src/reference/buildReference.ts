import { getNameFromWireValue, ReferenceConfigBuilder } from "@fern-api/base-generator";
import { PYTHON_CASE_CONVERTER as caseConverter } from "@fern-api/python-base";
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

    const snippetsByEndpointId = buildSnippetsByEndpointId({ context, endpointSnippets: endpointSnippets ?? [] });

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

function buildSnippetsByEndpointId({
    context,
    endpointSnippets
}: {
    context: SdkGeneratorContext;
    endpointSnippets: FernGeneratorExec.Endpoint[];
}): Record<string, string> {
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
        snippets[endpointSnippet.id.identifierOverride] = injectClientSetupIntoSnippet({
            context,
            snippet: endpointSnippet.snippet.syncClient
        });
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
    const methodName = caseConverter.snakeUnsafe(endpoint.name);
    const accessPath = getAccessFromRootClient({ service });
    const parameters = getEndpointParameters({ endpoint });
    const sourceFilePath = getSourceFilePath({ context, service });
    const returnTypeStr = getReturnTypeString({ endpoint });

    // Use prerendered snippet if available, otherwise fallback to abbreviated form
    let snippet = endpointSnippets[endpoint.id] ?? `${accessPath}.${methodName}(${parameters.length > 0 ? "..." : ""})`;

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
    const servicePath = service.name.fernFilepath.allParts.map((part) => caseConverter.snakeSafe(part));
    return servicePath.length > 0 ? `${clientVariableName}.${servicePath.join(".")}` : clientVariableName;
}

function getEndpointParameters({ endpoint }: { endpoint: FernIr.HttpEndpoint }): FernGeneratorCli.ParameterReference[] {
    const parameters: FernGeneratorCli.ParameterReference[] = [];

    endpoint.allPathParameters.forEach((pathParam) => {
        parameters.push({
            name: caseConverter.snakeUnsafe(pathParam.name),
            type: getTypeString(pathParam.valueType),
            description: pathParam.docs,
            required: !isTypeOptional(pathParam.valueType)
        });
    });

    endpoint.queryParameters.forEach((queryParam) => {
        const isOptional = isTypeOptional(queryParam.valueType);
        let type: string;
        if (queryParam.allowMultiple) {
            const baseType = isOptional
                ? unwrapOptionalType(queryParam.valueType)
                : getTypeString(queryParam.valueType);
            const unionType = `typing.Union[${baseType}, typing.Sequence[${baseType}]]`;
            type = isOptional ? wrapOptional(unionType) : unionType;
        } else {
            type = getTypeString(queryParam.valueType);
        }
        parameters.push({
            name: caseConverter.snakeUnsafe(getNameFromWireValue(queryParam.name)),
            type,
            description: queryParam.docs,
            required: !isOptional
        });
    });

    endpoint.headers.forEach((header) => {
        parameters.push({
            name: caseConverter.snakeUnsafe(getNameFromWireValue(header.name)),
            type: getTypeString(header.valueType),
            description: header.docs,
            required: !isTypeOptional(header.valueType)
        });
    });

    if (endpoint.requestBody != null && endpoint.requestBody.type === "inlinedRequestBody") {
        // Include properties from extended types
        if (endpoint.requestBody.extendedProperties != null) {
            endpoint.requestBody.extendedProperties.forEach((property) => {
                parameters.push({
                    name: caseConverter.snakeUnsafe(getNameFromWireValue(property.name)),
                    type: getTypeString(property.valueType),
                    description: property.docs,
                    required: !isTypeOptional(property.valueType)
                });
            });
        }
        endpoint.requestBody.properties.forEach((property) => {
            parameters.push({
                name: caseConverter.snakeUnsafe(getNameFromWireValue(property.name)),
                type: getTypeString(property.valueType),
                description: property.docs,
                required: !isTypeOptional(property.valueType)
            });
        });
    } else if (endpoint.requestBody != null && endpoint.requestBody.type === "reference") {
        parameters.push({
            name: "request",
            type: getTypeString(endpoint.requestBody.requestBodyType),
            description: endpoint.requestBody.docs,
            required: !isTypeOptional(endpoint.requestBody.requestBodyType)
        });
    } else if (endpoint.requestBody != null && endpoint.requestBody.type === "fileUpload") {
        endpoint.requestBody.properties.forEach((property) => {
            if (property.type === "file") {
                const fileProperty = property.value;
                const isOptional = fileProperty.type === "file" ? fileProperty.isOptional : fileProperty.isOptional;
                const fileType = fileProperty.type === "fileArray" ? "typing.List[core.File]" : "core.File";
                const type = isOptional ? `typing.Optional[${fileType}]` : fileType;
                parameters.push({
                    name: caseConverter.snakeUnsafe(getNameFromWireValue(fileProperty.key)),
                    type,
                    description: fileProperty.docs,
                    required: !isOptional
                });
            } else if (property.type === "bodyProperty") {
                parameters.push({
                    name: caseConverter.snakeUnsafe(getNameFromWireValue(property.name)),
                    type: getTypeString(property.valueType),
                    description: property.docs,
                    required: !isTypeOptional(property.valueType)
                });
            }
        });
    } else if (endpoint.requestBody != null && endpoint.requestBody.type === "bytes") {
        parameters.push({
            name: "request",
            type: endpoint.requestBody.isOptional
                ? "typing.Optional[typing.Union[bytes, typing.Iterator[bytes], typing.AsyncIterator[bytes]]]"
                : "typing.Union[bytes, typing.Iterator[bytes], typing.AsyncIterator[bytes]]",
            description: endpoint.requestBody.docs,
            required: !endpoint.requestBody.isOptional
        });
    }

    // Sort parameters: required first, then optional (matching v1 behavior)
    parameters.sort((a, b) => {
        if (a.required && !b.required) {
            return -1;
        }
        if (!a.required && b.required) {
            return 1;
        }
        return 0;
    });

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
                case "DATE_TIME_RFC_2822":
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
                    return wrapOptional(getTypeString(typeReference.container.optional));
                case "nullable":
                    return wrapOptional(getTypeString(typeReference.container.nullable));
                case "literal":
                    return "typing.Literal";
                default:
                    return "typing.Any";
            }
        }
        case "named":
            return caseConverter.pascalUnsafe(typeReference.name);
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
    const pathParts = service.name.fernFilepath.allParts.map((part) => caseConverter.snakeSafe(part));
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
    return (
        service.displayName ??
        service.name.fernFilepath.allParts.map((part) => caseConverter.pascalSafe(part)).join(" ")
    );
}

function isTypeOptional(typeReference: FernIr.TypeReference): boolean {
    if (typeReference.type === "container") {
        return typeReference.container.type === "optional" || typeReference.container.type === "nullable";
    }
    return false;
}

function unwrapOptionalType(typeReference: FernIr.TypeReference): string {
    if (typeReference.type === "container") {
        if (typeReference.container.type === "optional") {
            return getTypeString(typeReference.container.optional);
        }
        if (typeReference.container.type === "nullable") {
            return getTypeString(typeReference.container.nullable);
        }
    }
    return getTypeString(typeReference);
}

function wrapOptional(typeStr: string): string {
    if (typeStr.startsWith("typing.Optional[")) {
        return typeStr;
    }
    return `typing.Optional[${typeStr}]`;
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

/**
 * Post-processes a prerendered snippet to inject base_url or environment setup
 * into the client constructor, matching v1 output.
 */
function injectClientSetupIntoSnippet({ context, snippet }: { context: SdkGeneratorContext; snippet: string }): string {
    const lines = snippet.split("\n");
    const clientLineIdx = lines.findIndex((line) => line.startsWith("client = "));
    if (clientLineIdx === -1) {
        return snippet;
    }

    const clientLine = lines[clientLineIdx] ?? "";

    // Find the closing paren of the constructor
    let closingParenIdx = -1;
    if (clientLine.endsWith("()")) {
        closingParenIdx = clientLineIdx;
    } else if (clientLine.endsWith("(")) {
        for (let i = clientLineIdx + 1; i < lines.length; i++) {
            if (lines[i] === ")") {
                closingParenIdx = i;
                break;
            }
        }
    }

    if (closingParenIdx === -1) {
        return snippet;
    }

    const environmentInfo = getEnvironmentInfo({ context });
    if (environmentInfo != null) {
        const { importLine, constructorArg } = environmentInfo;

        const packageName = context.getModulePath();
        const packageImportIdx = lines.findIndex((line) => line.startsWith(`from ${packageName} import`));
        if (packageImportIdx !== -1) {
            lines.splice(packageImportIdx + 1, 0, importLine);
            const adjustedClientLineIdx = clientLineIdx + 1;
            const adjustedClosingParenIdx = closingParenIdx + 1;
            injectConstructorArg(lines, adjustedClientLineIdx, adjustedClosingParenIdx, constructorArg);
        }
    } else {
        const baseUrlArg = `    base_url="https://yourhost.com/path/to/api",`;
        injectConstructorArg(lines, clientLineIdx, closingParenIdx, baseUrlArg);
    }

    return lines.join("\n");
}

function injectConstructorArg(lines: string[], clientLineIdx: number, closingParenIdx: number, arg: string): void {
    const clientLine = lines[clientLineIdx] ?? "";

    if (clientLine.endsWith("()")) {
        const className = clientLine.slice("client = ".length, -2);
        lines[clientLineIdx] = `client = ${className}(`;
        lines.splice(clientLineIdx + 1, 0, arg, ")");
    } else {
        lines.splice(closingParenIdx, 0, arg);
    }
}

function getEnvironmentInfo({
    context
}: {
    context: SdkGeneratorContext;
}): { importLine: string; constructorArg: string } | undefined {
    const envConfig = context.ir.environments;
    if (envConfig == null) {
        return undefined;
    }

    const clientClassName = getClientClassName({ context });
    const envClassName = `${clientClassName}Environment`;
    const packageName = context.getModulePath();
    const importLine = `from ${packageName}.environment import ${envClassName}`;

    const firstEnvName = resolveDefaultEnvironmentName(envConfig);

    if (firstEnvName == null) {
        return undefined;
    }

    const constructorArg = `    environment=${envClassName}.${firstEnvName},`;
    return { importLine, constructorArg };
}

/**
 * Resolves the default (or first) environment name as SCREAMING_SNAKE_CASE.
 * Works for both singleBaseUrl and multipleBaseUrls environment types.
 */
export function resolveDefaultEnvironmentName(envConfig: FernIr.EnvironmentsConfig): string | undefined {
    const envs =
        envConfig.environments.type === "singleBaseUrl" || envConfig.environments.type === "multipleBaseUrls"
            ? envConfig.environments.environments
            : undefined;
    if (envs == null) {
        return undefined;
    }
    const defaultEnvId = envConfig.defaultEnvironment;
    if (defaultEnvId != null) {
        const defaultEnv = envs.find((e) => e.id === defaultEnvId);
        if (defaultEnv?.name != null) {
            return caseConverter.screamingSnakeUnsafe(defaultEnv.name);
        }
    }
    if (envs.length > 0 && envs[0] != null) {
        return caseConverter.screamingSnakeUnsafe(envs[0].name);
    }
    return undefined;
}

function getClientClassName({ context }: { context: SdkGeneratorContext }): string {
    if (context.customConfig.client?.exported_class_name != null) {
        return context.customConfig.client.exported_class_name;
    }
    if (context.customConfig.client_class_name != null) {
        return context.customConfig.client_class_name;
    }
    if (context.customConfig.client?.class_name != null) {
        return context.customConfig.client.class_name;
    }
    const toPascalCase = (s: string): string =>
        s
            .split(/[-_\s]+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join("");
    return toPascalCase(context.config.organization) + toPascalCase(context.config.workspaceName);
}
