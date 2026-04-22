import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { isVariablePathParameter, RawSchemas } from "@fern-api/fern-definition-schema";
import {
    ApiAuth,
    AuthSchemesRequirement,
    Encoding,
    FernIr,
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpService,
    PathParameter,
    ResponseErrors,
    Transport,
    TypeReference
} from "@fern-api/ir-sdk";
import { constructHttpPath, IdGenerator } from "@fern-api/ir-utils";
import { SourceResolver } from "@fern-api/source-resolver";
import { CliError } from "@fern-api/task-context";
import urlJoin from "url-join";
import { FernFileContext } from "../../FernFileContext.js";
import { ErrorResolver } from "../../resolvers/ErrorResolver.js";
import { ExampleResolver } from "../../resolvers/ExampleResolver.js";
import { PropertyResolver } from "../../resolvers/PropertyResolver.js";
import { TypeResolver } from "../../resolvers/TypeResolver.js";
import { VariableResolver } from "../../resolvers/VariableResolver.js";
import { getEndpointPathParameters } from "../../utils/getEndpointPathParameters.js";
import { IRGenerationSettings } from "../../utils/getIrGenerationSettings.js";
import { orderPathParametersByUrl } from "../../utils/orderPathParametersByUrl.js";
import { convertAvailability, convertDeclaration } from "../convertDeclaration.js";
import { convertCodeSample } from "./convertCodeSamples.js";
import { convertDefaultToLiteral } from "./convertDefaultToLiteral.js";
import { convertExampleEndpointCall } from "./convertExampleEndpointCall.js";
import { convertHttpRequestBody } from "./convertHttpRequestBody.js";
import { convertHttpResponse } from "./convertHttpResponse.js";
import { convertHttpSdkRequest } from "./convertHttpSdkRequest.js";
import { convertPagination } from "./convertPagination.js";
import { convertQueryParameter } from "./convertQueryParameter.js";
import { convertResponseErrors } from "./convertResponseErrors.js";
import { convertRetries } from "./convertRetries.js";
import { getTransportForEndpoint, getTransportForService } from "./convertTransport.js";

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
    workspace,
    auth,
    irSettings
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
    auth: ApiAuth;
    irSettings: IRGenerationSettings;
}): HttpService {
    const servicePathParametersRaw = convertPathParameters({
        pathParameters: serviceDefinition["path-parameters"],
        location: FernIr.PathParameterLocation.Service,
        file,
        variableResolver
    });

    const pathParameterOrder = irSettings.pathParameterOrder;

    const servicePathParameters = (() => {
        switch (pathParameterOrder) {
            case generatorsYml.PathParameterOrder.UrlOrder:
                return serviceDefinition["base-path"]
                    ? orderPathParametersByUrl(serviceDefinition["base-path"], servicePathParametersRaw)
                    : servicePathParametersRaw;
            case generatorsYml.PathParameterOrder.SpecOrder:
                return servicePathParametersRaw;
            default:
                assertNever(pathParameterOrder);
        }
    })();

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
            const fullPathString =
                endpoint["base-path"] != null
                    ? urlJoin(endpoint["base-path"], endpoint.path)
                    : file.rootApiFile["base-path"] != null
                      ? urlJoin(file.rootApiFile["base-path"], serviceDefinition["base-path"], endpoint.path)
                      : urlJoin(serviceDefinition["base-path"], endpoint.path);

            const endpointPathParametersRaw = convertPathParameters({
                pathParameters: getEndpointPathParameters(endpoint),
                location: FernIr.PathParameterLocation.Endpoint,
                file,
                variableResolver
            });

            const endpointPathParameters = (() => {
                switch (pathParameterOrder) {
                    case generatorsYml.PathParameterOrder.UrlOrder:
                        return orderPathParametersByUrl(endpoint.path, endpointPathParametersRaw);
                    case generatorsYml.PathParameterOrder.SpecOrder:
                        return endpointPathParametersRaw;
                    default:
                        assertNever(pathParameterOrder);
                }
            })();

            const allPathParametersRaw =
                endpoint["base-path"] != null
                    ? endpointPathParameters
                    : [...rootPathParameters, ...servicePathParameters, ...endpointPathParameters];

            const allPathParameters = (() => {
                switch (pathParameterOrder) {
                    case generatorsYml.PathParameterOrder.UrlOrder:
                        return orderPathParametersByUrl(fullPathString, allPathParametersRaw);
                    case generatorsYml.PathParameterOrder.SpecOrder:
                        return allPathParametersRaw;
                    default:
                        assertNever(pathParameterOrder);
                }
            })();

            const httpEndpoint: HttpEndpoint = {
                ...convertDeclaration(endpoint),
                id: "",
                name: file.casingsGenerator.generateName(endpointKey),
                displayName: endpoint["display-name"],
                auth:
                    typeof endpoint.auth === "boolean"
                        ? endpoint.auth
                        : endpoint.auth != null
                          ? endpoint.auth.length > 0
                          : serviceDefinition.auth,
                security:
                    typeof endpoint.auth === "undefined" || typeof endpoint.auth === "boolean"
                        ? (endpoint.auth ?? serviceDefinition.auth === true)
                            ? AuthSchemesRequirement._visit<Record<string, string[]>[] | undefined>(auth.requirement, {
                                  any: () => auth.schemes.map((scheme) => ({ [scheme.key]: [] })),
                                  all: () => [auth.schemes.reduce((acc, scheme) => ({ ...acc, [scheme.key]: [] }), {})],
                                  // for endpoint security, `typeof endpoint.auth === "object"`, so this case is unreachable
                                  endpointSecurity: () => undefined,
                                  _other: () => undefined
                              })
                            : undefined
                        : endpoint.auth,
                docs: endpoint.docs,
                idempotent: endpoint.idempotent ?? serviceDefinition.idempotent ?? false,
                baseUrl: endpoint.url ?? serviceDefinition.url ?? rootDefaultUrl,
                v2BaseUrls: undefined,
                method: endpoint.method != null ? convertHttpMethod(endpoint.method) : HttpMethod.Post,
                basePath: endpoint["base-path"] != null ? constructHttpPath(endpoint["base-path"]) : undefined,
                path: constructHttpPath(endpoint.path),
                fullPath: constructHttpPath(fullPathString),
                pathParameters: endpointPathParameters,
                allPathParameters,
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
                v2RequestBodies: undefined,
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
                v2Responses: undefined,
                errors: [...convertResponseErrors({ errors: endpoint.errors, file }), ...globalErrors],
                userSpecifiedExamples:
                    endpoint.examples != null
                        ? endpoint.examples
                              .map((example) => {
                                  try {
                                      const convertedExample = convertExampleEndpointCall({
                                          service: serviceDefinition,
                                          endpoint,
                                          example,
                                          typeResolver,
                                          errorResolver,
                                          exampleResolver,
                                          variableResolver,
                                          file,
                                          workspace
                                      });
                                      if (convertedExample === undefined) {
                                          return undefined;
                                      }
                                      return {
                                          example: convertedExample,
                                          codeSamples: example["code-samples"]?.map((codeSample) =>
                                              convertCodeSample({ codeSample, file })
                                          )
                                      };
                                  } catch (e) {
                                      // Optionally log the error here if needed
                                      return undefined;
                                  }
                              })
                              .filter((ex) => ex !== undefined)
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
                }),
                v2Examples: undefined,
                source: undefined,
                audiences: endpoint.audiences,
                retries: convertRetries({
                    endpointSchema: endpoint
                }),
                apiPlayground: undefined,
                responseHeaders: []
            };
            httpEndpoint.id = IdGenerator.generateEndpointId(serviceName, httpEndpoint);
            return httpEndpoint;
        }),
        audiences: serviceDefinition.audiences
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
    location: FernIr.PathParameterLocation;
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
    location: FernIr.PathParameterLocation;
    file: FernFileContext;
    variableResolver: VariableResolver;
}): PathParameter {
    const defaultValue = typeof parameter !== "string" && "type" in parameter ? parameter.default : undefined;
    return {
        ...convertDeclaration(parameter),
        name: file.casingsGenerator.generateName(parameterName),
        valueType: getPathParameterType({ parameter, variableResolver, file }),
        location,
        variable: isVariablePathParameter(parameter)
            ? variableResolver.getVariableIdOrThrow(typeof parameter === "string" ? parameter : parameter.variable)
            : undefined,
        clientDefault: convertDefaultToLiteral(defaultValue),
        v2Examples: {
            userSpecifiedExamples: {},
            autogeneratedExamples: {}
        },
        explode: undefined
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
        throw new CliError({ message: "Cannot resolve path parameter", code: CliError.Code.InternalError });
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
        case "HEAD":
            return HttpMethod.Head;
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
    const defaultValue = typeof header !== "string" ? header.default : undefined;
    return {
        ...convertDeclaration(header),
        name: file.casingsGenerator.generateNameAndWireValue({
            wireValue: headerKey,
            name
        }),
        valueType: file.parseTypeReference(header),
        env: typeof header === "string" ? undefined : header.env,
        clientDefault: convertDefaultToLiteral(defaultValue),
        v2Examples: {
            userSpecifiedExamples: {},
            autogeneratedExamples: {}
        }
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
