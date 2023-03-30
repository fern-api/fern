import { assertNever } from "@fern-api/core-utils";
import { isVariablePathParameter, RawSchemas } from "@fern-api/yaml-schema";
import {
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpService,
    PathParameter,
    PathParameterLocation,
    ResponseErrors,
} from "@fern-fern/ir-model/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import urlJoin from "url-join";
import { FernFileContext } from "../../FernFileContext";
import { ErrorResolver } from "../../resolvers/ErrorResolver";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { VariableResolver } from "../../resolvers/VariableResolver";
import { convertAvailability, convertDeclaration } from "../convertDeclaration";
import { constructHttpPath } from "./constructHttpPath";
import { convertExampleEndpointCall } from "./convertExampleEndpointCall";
import { convertHttpRequestBody } from "./convertHttpRequestBody";
import { convertHttpResponse } from "./convertHttpResponse";
import { convertHttpSdkRequest } from "./convertHttpSdkRequest";
import { convertResponseErrors } from "./convertResponseErrors";

export function convertHttpService({
    rootPathParameters,
    serviceDefinition,
    file,
    errorResolver,
    typeResolver,
    exampleResolver,
    variableResolver,
    globalErrors,
}: {
    rootPathParameters: PathParameter[];
    serviceDefinition: RawSchemas.HttpServiceSchema;
    file: FernFileContext;
    errorResolver: ErrorResolver;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    variableResolver: VariableResolver;
    globalErrors: ResponseErrors;
}): HttpService {
    const servicePathParameters = convertPathParameters({
        pathParameters: serviceDefinition["path-parameters"],
        location: PathParameterLocation.Service,
        file,
        variableResolver,
    });

    return {
        availability: convertAvailability(serviceDefinition.availability),
        name: { fernFilepath: file.fernFilepath },
        displayName: serviceDefinition["display-name"] ?? undefined,
        baseUrl: serviceDefinition.url,
        basePath: constructHttpPath(serviceDefinition["base-path"]),
        headers:
            serviceDefinition.headers != null
                ? Object.entries(serviceDefinition.headers).map(([headerKey, header]) =>
                      convertHttpHeader({ headerKey, header, file })
                  )
                : [],
        pathParameters: servicePathParameters,
        endpoints: Object.entries(serviceDefinition.endpoints).map(([endpointKey, endpoint]): HttpEndpoint => {
            const endpointPathParameters = convertPathParameters({
                pathParameters: endpoint["path-parameters"],
                location: PathParameterLocation.Endpoint,
                file,
                variableResolver,
            });

            return {
                ...convertDeclaration(endpoint),
                name: file.casingsGenerator.generateName(endpointKey),
                displayName: endpoint["display-name"],
                auth: endpoint.auth ?? serviceDefinition.auth,
                method: endpoint.method != null ? convertHttpMethod(endpoint.method) : HttpMethod.Post,
                path: constructHttpPath(endpoint.path),
                fullPath: constructHttpPath(
                    file.rootApiFile["base-path"] != null
                        ? urlJoin(file.rootApiFile["base-path"], serviceDefinition["base-path"], endpoint.path)
                        : urlJoin(serviceDefinition["base-path"], endpoint.path)
                ),
                pathParameters: endpointPathParameters,
                allPathParameters: [...rootPathParameters, ...servicePathParameters, ...endpointPathParameters],
                queryParameters:
                    typeof endpoint.request !== "string" && endpoint.request?.["query-parameters"] != null
                        ? Object.entries(endpoint.request["query-parameters"]).map(
                              ([queryParameterKey, queryParameter]) => {
                                  const { name } = getQueryParameterName({ queryParameterKey, queryParameter });
                                  const valueType = file.parseTypeReference(queryParameter);
                                  return {
                                      ...convertDeclaration(queryParameter),
                                      name: file.casingsGenerator.generateNameAndWireValue({
                                          wireValue: queryParameterKey,
                                          name,
                                      }),
                                      valueType,
                                      allowMultiple:
                                          typeof queryParameter !== "string" && queryParameter["allow-multiple"] != null
                                              ? queryParameter["allow-multiple"]
                                              : false,
                                  };
                              }
                          )
                        : [],
                headers:
                    typeof endpoint.request !== "string" && endpoint.request?.headers != null
                        ? Object.entries(endpoint.request.headers).map(([headerKey, header]) =>
                              convertHttpHeader({ headerKey, header, file })
                          )
                        : [],
                requestBody: convertHttpRequestBody({ request: endpoint.request, file }),
                sdkRequest: convertHttpSdkRequest({ request: endpoint.request, file }),
                ...convertHttpResponse({ endpoint, file }),
                errors: [...convertResponseErrors({ errors: endpoint.errors, file }), ...globalErrors],
                examples:
                    endpoint.examples != null
                        ? endpoint.examples.map((example) =>
                              convertExampleEndpointCall({
                                  service: serviceDefinition,
                                  endpoint,
                                  example,
                                  typeResolver,
                                  errorResolver,
                                  exampleResolver,
                                  variableResolver,
                                  file,
                              })
                          )
                        : [],
            };
        }),
    };
}

export function convertPathParameters({
    pathParameters,
    location,
    file,
    variableResolver,
}: {
    pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> | undefined;
    location: PathParameterLocation;
    file: FernFileContext;
    variableResolver: VariableResolver;
}): PathParameter[] {
    if (pathParameters == null) {
        return [];
    }
    return Object.entries(pathParameters).map(([parameterName, parameter]) =>
        convertPathParameter({
            parameterName,
            parameter,
            location,
            file,
            variableResolver,
        })
    );
}

function convertPathParameter({
    parameterName,
    parameter,
    location,
    file,
    variableResolver,
}: {
    parameterName: string;
    parameter: RawSchemas.HttpPathParameterSchema;
    location: PathParameterLocation;
    file: FernFileContext;
    variableResolver: VariableResolver;
}): PathParameter {
    return {
        ...convertDeclaration(parameter),
        name: file.casingsGenerator.generateName(parameterName),
        valueType: getPathParameterType({ parameter, variableResolver, file }),
        location,
    };
}

function getPathParameterType({
    parameter,
    variableResolver,
    file,
}: {
    parameter: RawSchemas.HttpPathParameterSchema;
    variableResolver: VariableResolver;
    file: FernFileContext;
}): TypeReference {
    const parsed = resolvePathParameterOrThrow({
        parameter,
        variableResolver,
        file,
    });
    return parsed.file.parseTypeReference(parsed.rawType);
}

export function resolvePathParameterOrThrow({
    parameter,
    variableResolver,
    file,
}: {
    parameter: RawSchemas.HttpPathParameterSchema;
    variableResolver: VariableResolver;
    file: FernFileContext;
}): { rawType: string; file: FernFileContext } {
    const resolved = resolvePathParameter({
        parameter,
        variableResolver,
        file,
    });
    if (resolved == null) {
        throw new Error("Cannot resolve path parameter");
    }
    return resolved;
}

export function resolvePathParameter({
    parameter,
    variableResolver,
    file,
}: {
    parameter: RawSchemas.HttpPathParameterSchema;
    variableResolver: VariableResolver;
    file: FernFileContext;
}): { rawType: string; file: FernFileContext } | undefined {
    if (isVariablePathParameter(parameter)) {
        const variable = typeof parameter === "string" ? parameter : parameter.variable;

        const resolvedVariable = variableResolver.getDeclaration(variable, file);
        if (resolvedVariable == null) {
            return undefined;
        }

        const rawType =
            typeof resolvedVariable.declaration === "string"
                ? resolvedVariable.declaration
                : resolvedVariable.declaration.type;

        return {
            rawType,
            file: resolvedVariable.file,
        };
    } else {
        return {
            file,
            rawType: typeof parameter === "string" ? parameter : parameter.type,
        };
    }
}

export function getQueryParameterName({
    queryParameterKey,
    queryParameter,
}: {
    queryParameterKey: string;
    queryParameter: RawSchemas.HttpQueryParameterSchema;
}): { name: string; wasExplicitlySet: boolean } {
    if (typeof queryParameter !== "string") {
        if (queryParameter.name != null) {
            return { name: queryParameter.name, wasExplicitlySet: true };
        }
    }
    return { name: queryParameterKey, wasExplicitlySet: false };
}

function convertHttpMethod(method: Exclude<RawSchemas.HttpEndpointSchema["method"], null | undefined>): HttpMethod {
    switch (method) {
        case "GET":
            return HttpMethod.Get;
        case "POST":
            return HttpMethod.Post;
        case "PUT":
            return HttpMethod.Put;
        case "PATCH":
            return HttpMethod.Patch;
        case "DELETE":
            return HttpMethod.Delete;
        default:
            assertNever(method);
    }
}

export function convertHttpHeader({
    headerKey,
    header,
    file,
}: {
    headerKey: string;
    header: RawSchemas.HttpHeaderSchema;
    file: FernFileContext;
}): HttpHeader {
    const { name } = getHeaderName({ headerKey, header });
    return {
        ...convertDeclaration(header),
        name: file.casingsGenerator.generateNameAndWireValue({
            wireValue: headerKey,
            name,
        }),
        valueType: file.parseTypeReference(header),
    };
}

export function getHeaderName({ headerKey, header }: { headerKey: string; header: RawSchemas.HttpHeaderSchema }): {
    name: string;
    wasExplicitlySet: boolean;
} {
    if (typeof header !== "string") {
        if (header.name != null) {
            return {
                name: header.name,
                wasExplicitlySet: true,
            };
        }
    }
    return {
        name: headerKey,
        wasExplicitlySet: false,
    };
}
