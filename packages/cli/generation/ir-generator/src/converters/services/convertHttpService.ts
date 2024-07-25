import { assertNever } from "@fern-api/core-utils";
import {
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpService,
    PathParameter,
    PathParameterLocation,
    ResponseErrors,
    TypeReference
} from "@fern-api/ir-sdk";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { isVariablePathParameter, RawSchemas } from "@fern-api/yaml-schema";
import urlJoin from "url-join";
import { FernFileContext } from "../../FernFileContext";
import { IdGenerator } from "../../IdGenerator";
import { ErrorResolver } from "../../resolvers/ErrorResolver";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { PropertyResolver } from "../../resolvers/PropertyResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { VariableResolver } from "../../resolvers/VariableResolver";
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

export async function convertHttpService({
    rootDefaultUrl,
    rootPathParameters,
    serviceDefinition,
    file,
    errorResolver,
    typeResolver,
    propertyResolver,
    exampleResolver,
    variableResolver,
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
    globalErrors: ResponseErrors;
    workspace: FernWorkspace;
}): Promise<HttpService> {
    const servicePathParameters = await convertPathParameters({
        pathParameters: serviceDefinition["path-parameters"],
        location: PathParameterLocation.Service,
        file,
        variableResolver
    });

    const serviceName = { fernFilepath: file.fernFilepath };
    const service: HttpService = {
        availability: convertAvailability(serviceDefinition.availability),
        name: serviceName,
        displayName: serviceDefinition["display-name"] ?? undefined,
        basePath: constructHttpPath(serviceDefinition["base-path"]),
        headers:
            serviceDefinition.headers != null
                ? await Promise.all(
                      Object.entries(serviceDefinition.headers).map(([headerKey, header]) =>
                          convertHttpHeader({ headerKey, header, file })
                      )
                  )
                : [],
        pathParameters: servicePathParameters,
        endpoints: await Promise.all(
            Object.entries(serviceDefinition.endpoints).map(async ([endpointKey, endpoint]): Promise<HttpEndpoint> => {
                const endpointPathParameters = await convertPathParameters({
                    pathParameters: endpoint["path-parameters"],
                    location: PathParameterLocation.Endpoint,
                    file,
                    variableResolver
                });
                const httpEndpoint: HttpEndpoint = {
                    ...(await convertDeclaration(endpoint)),
                    id: "",
                    name: file.casingsGenerator.generateName(endpointKey),
                    displayName: endpoint["display-name"],
                    auth: endpoint.auth ?? serviceDefinition.auth,
                    idempotent: endpoint.idempotent ?? serviceDefinition.idempotent ?? false,
                    baseUrl: endpoint.url ?? serviceDefinition.url ?? rootDefaultUrl,
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
                            ? await Promise.all(
                                  Object.entries(endpoint.request["query-parameters"]).map(
                                      async ([queryParameterKey, queryParameter]) => {
                                          return await convertQueryParameter({
                                              file,
                                              queryParameterKey,
                                              queryParameter
                                          });
                                      }
                                  )
                              )
                            : [],
                    headers:
                        typeof endpoint.request !== "string" && endpoint.request?.headers != null
                            ? await Promise.all(
                                  Object.entries(endpoint.request.headers).map(([headerKey, header]) =>
                                      convertHttpHeader({ headerKey, header, file })
                                  )
                              )
                            : [],
                    requestBody: convertHttpRequestBody({ request: endpoint.request, file }),
                    sdkRequest: await convertHttpSdkRequest({
                        service: serviceDefinition,
                        request: endpoint.request,
                        endpoint,
                        endpointKey,
                        file,
                        typeResolver,
                        propertyResolver
                    }),
                    response: await convertHttpResponse({ endpoint, file, typeResolver }),
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
                    pagination: await convertPagination({
                        propertyResolver,
                        file,
                        endpointName: endpointKey,
                        endpointSchema: endpoint
                    })
                };
                httpEndpoint.id = IdGenerator.generateEndpointId(serviceName, httpEndpoint);
                return httpEndpoint;
            })
        )
    };
    return service;
}

export async function convertPathParameters({
    pathParameters,
    location,
    file,
    variableResolver
}: {
    pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> | undefined;
    location: PathParameterLocation;
    file: FernFileContext;
    variableResolver: VariableResolver;
}): Promise<PathParameter[]> {
    if (pathParameters == null) {
        return [];
    }
    return await Promise.all(
        Object.entries(pathParameters).map(([parameterName, parameter]) =>
            convertPathParameter({
                parameterName,
                parameter,
                location,
                file,
                variableResolver
            })
        )
    );
}

async function convertPathParameter({
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
}): Promise<PathParameter> {
    return {
        ...(await convertDeclaration(parameter)),
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

export async function convertHttpHeader({
    headerKey,
    header,
    file
}: {
    headerKey: string;
    header: RawSchemas.HttpHeaderSchema;
    file: FernFileContext;
}): Promise<HttpHeader> {
    const { name } = getHeaderName({ headerKey, header });
    return {
        ...(await convertDeclaration(header)),
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
