import urlJoin from "url-join";

import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { assertNever } from "@fern-api/core-utils";
import { RawSchemas, isVariablePathParameter } from "@fern-api/fern-definition-schema";
import {
    Encoding,
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpService,
    PathParameter,
    PathParameterLocation,
    ResponseErrors,
    Transport,
    TypeReference
} from "@fern-api/ir-sdk";
import { SourceResolver } from "@fern-api/source-resolver";

import { FernFileContext } from "../../FernFileContext";
import { IdGenerator } from "../../IdGenerator";
import { ErrorResolver } from "../../resolvers/ErrorResolver";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { PropertyResolver } from "../../resolvers/PropertyResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { VariableResolver } from "../../resolvers/VariableResolver";
import { getEndpointPathParameters } from "../../utils/getEndpointPathParameters";
import { convertAvailability, convertDeclaration } from "../convertDeclaration";
import { constructHttpPath } from "./constructHttpPath";
import { convertCodeSample } from "./convertCodeSamples";
import { convertExampleEndpointCall } from "./convertExampleEndpointCall";
import { convertHttpRequestBody } from "./convertHttpRequestBody";
import { convertHttpResponse } from "./convertHttpResponse";
import { convertHttpSdkRequest } from "./convertHttpSdkRequest";
import { convertPagination } from "./convertPagination";
import { convertQueryParameter } from "./convertQueryParameter";
import { convertResponseErrors } from "./convertResponseErrors";
import { getTransportForEndpoint, getTransportForService } from "./convertTransport";

export function convertHttpService({
    rootDefaultUrl,
    rootPathParameters,
    serviceDefinition,
    file,
    errorResolver,
    typeResolver,
    propertyResolver,
    exampleResolver,
    variableResolver,
    sourceResolver,
    globalErrors,
    workspace
}: {
    rootDefaultUrl: string | undefined;
    rootPathParameters: PathParameter[];
    serviceDefinition: RawSchemas.HttpServiceSchema;
    file: FernFileContext;
    errorResolver: ErrorResolver;
    typeResolver: TypeResolver;
    propertyResolver: PropertyResolver;
    exampleResolver: ExampleResolver;
    variableResolver: VariableResolver;
    sourceResolver: SourceResolver;
    globalErrors: ResponseErrors;
    workspace: FernWorkspace;
}): HttpService {
    const servicePathParameters = convertPathParameters({
        pathParameters: serviceDefinition["path-parameters"],
        location: PathParameterLocation.Service,
        file,
        variableResolver
    });

    const transport = getTransportForService({
        file,
        serviceDeclaration: serviceDefinition,
        sourceResolver
    });

    const serviceName = { fernFilepath: file.fernFilepath };
    const service: HttpService = {
        availability: convertAvailability(serviceDefinition.availability),
        name: serviceName,
        displayName: serviceDefinition["display-name"] ?? undefined,
        basePath: constructHttpPath(serviceDefinition["base-path"]),
        headers:
            serviceDefinition.headers != null
                ? Object.entries(serviceDefinition.headers).map(([headerKey, header]) =>
                      convertHttpHeader({ headerKey, header, file })
                  )
                : [],
        pathParameters: servicePathParameters,
        encoding: convertTransportToEncoding(transport, serviceDefinition),
        transport,
        endpoints: Object.entries(serviceDefinition.endpoints).map(([endpointKey, endpoint]): HttpEndpoint => {
            const endpointPathParameters = convertPathParameters({
                pathParameters: getEndpointPathParameters(endpoint),
                location: PathParameterLocation.Endpoint,
                file,
                variableResolver
            });
            const httpEndpoint: HttpEndpoint = {
                ...convertDeclaration(endpoint),
                id: "",
                name: file.casingsGenerator.generateName(endpointKey),
                displayName: endpoint["display-name"],
                auth: endpoint.auth ?? serviceDefinition.auth,
                idempotent: endpoint.idempotent ?? serviceDefinition.idempotent ?? false,
                baseUrl: endpoint.url ?? serviceDefinition.url ?? rootDefaultUrl,
                method: endpoint.method != null ? convertHttpMethod(endpoint.method) : HttpMethod.Post,
                basePath: endpoint["base-path"] != null ? constructHttpPath(endpoint["base-path"]) : undefined,
                path: constructHttpPath(endpoint.path),
                fullPath: constructHttpPath(
                    endpoint["base-path"] != null
                        ? urlJoin(endpoint["base-path"], endpoint.path)
                        : file.rootApiFile["base-path"] != null
                          ? urlJoin(file.rootApiFile["base-path"], serviceDefinition["base-path"], endpoint.path)
                          : urlJoin(serviceDefinition["base-path"], endpoint.path)
                ),
                pathParameters: endpointPathParameters,
                allPathParameters:
                    endpoint["base-path"] != null
                        ? endpointPathParameters
                        : [...rootPathParameters, ...servicePathParameters, ...endpointPathParameters],
                queryParameters:
                    typeof endpoint.request !== "string" && endpoint.request?.["query-parameters"] != null
                        ? Object.entries(endpoint.request["query-parameters"]).map(
                              ([queryParameterKey, queryParameter]) => {
                                  return convertQueryParameter({
                                      file,
                                      queryParameterKey,
                                      queryParameter
                                  });
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
                sdkRequest: convertHttpSdkRequest({
                    service: serviceDefinition,
                    request: endpoint.request,
                    endpoint,
                    endpointKey,
                    file,
                    typeResolver,
                    propertyResolver
                }),
                response: convertHttpResponse({ endpoint, file, typeResolver }),
                errors: [...convertResponseErrors({ errors: endpoint.errors, file }), ...globalErrors],
                userSpecifiedExamples:
                    endpoint.examples != null
                        ? endpoint.examples.map((example) => {
                              return {
                                  example: convertExampleEndpointCall({
                                      service: serviceDefinition,
                                      endpoint,
                                      example,
                                      typeResolver,
                                      errorResolver,
                                      exampleResolver,
                                      variableResolver,
                                      file,
                                      workspace
                                  }),
                                  codeSamples: example["code-samples"]?.map((codeSample) =>
                                      convertCodeSample({ codeSample, file })
                                  )
                              };
                          })
                        : [],
                autogeneratedExamples: [], // gets filled in later on
                pagination: convertPagination({
                    propertyResolver,
                    file,
                    endpointName: endpointKey,
                    endpointSchema: endpoint
                }),
                transport: getTransportForEndpoint({
                    file,
                    serviceTransport: transport,
                    endpointDeclaration: endpoint,
                    sourceResolver
                })
            };
            httpEndpoint.id = IdGenerator.generateEndpointId(serviceName, httpEndpoint);
            return httpEndpoint;
        })
    };
    return service;
}

export function convertPathParameters({
    pathParameters,
    location,
    file,
    variableResolver
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
            variableResolver
        })
    );
}

function convertPathParameter({
    parameterName,
    parameter,
    location,
    file,
    variableResolver
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
        variable: isVariablePathParameter(parameter)
            ? variableResolver.getVariableIdOrThrow(typeof parameter === "string" ? parameter : parameter.variable)
            : undefined
    };
}

function getPathParameterType({
    parameter,
    variableResolver,
    file
}: {
    parameter: RawSchemas.HttpPathParameterSchema;
    variableResolver: VariableResolver;
    file: FernFileContext;
}): TypeReference {
    const parsed = resolvePathParameterOrThrow({
        parameter,
        variableResolver,
        file
    });
    return parsed.file.parseTypeReference(parsed.rawType);
}

export function resolvePathParameterOrThrow({
    parameter,
    variableResolver,
    file
}: {
    parameter: RawSchemas.HttpPathParameterSchema;
    variableResolver: VariableResolver;
    file: FernFileContext;
}): { rawType: string; file: FernFileContext } {
    const resolved = resolvePathParameter({
        parameter,
        variableResolver,
        file
    });
    if (resolved == null) {
        throw new Error("Cannot resolve path parameter");
    }
    return resolved;
}

export function resolvePathParameter({
    parameter,
    variableResolver,
    file
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
            file: resolvedVariable.file
        };
    } else {
        return {
            file,
            rawType: typeof parameter === "string" ? parameter : parameter.type
        };
    }
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
    file
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
            name
        }),
        valueType: file.parseTypeReference(header),
        env: typeof header === "string" ? undefined : header.env
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
                wasExplicitlySet: true
            };
        }
    }
    return {
        name: headerKey,
        wasExplicitlySet: false
    };
}

function convertTransportToEncoding(transport: Transport, service: RawSchemas.HttpServiceSchema): Encoding {
    switch (transport.type) {
        case "http":
            return {
                json: {},
                proto: undefined
            };
        case "grpc":
            return {
                json: undefined,
                proto: {}
            };
        default:
            assertNever(transport);
    }
}
