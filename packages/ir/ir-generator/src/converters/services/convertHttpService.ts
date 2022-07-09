import { assertNever } from "@fern-api/commons";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model";
import {
    CustomWireMessageEncoding,
    EndpointId,
    HttpAuth,
    HttpEndpoint,
    HttpMethod,
    HttpService,
} from "@fern-fern/ir-model/services";
import { kebabCase } from "lodash";
import { getDocs } from "../../utils/getDocs";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { constructHttpPath } from "./constructHttpPath";
import { convertHttpRequest } from "./convertHttpRequest";
import { convertHttpResponse } from "./convertHttpResponse";

export function convertHttpService({
    serviceDefinition,
    serviceId,
    fernFilepath,
    imports,
    nonStandardEncodings,
}: {
    serviceDefinition: RawSchemas.HttpServiceSchema;
    serviceId: string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): HttpService {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    return {
        docs: serviceDefinition.docs,
        name: {
            name: serviceId,
            fernFilepath,
        },
        basePath: convertBasePath({ serviceDefinition, serviceId }),
        headers:
            serviceDefinition.headers != null
                ? Object.entries(serviceDefinition.headers).map(([header, headerType]) => ({
                      header,
                      valueType: parseTypeReference(headerType),
                      docs: getDocs(headerType),
                  }))
                : [],
        endpoints: Object.entries(serviceDefinition.endpoints).map(
            ([endpointId, endpoint]): HttpEndpoint => ({
                endpointId: EndpointId.of(endpointId),
                auth:
                    endpoint["auth-override"] != null
                        ? convertHttpAuth(endpoint["auth-override"])
                        : convertHttpAuth(serviceDefinition.auth),
                docs: endpoint.docs,
                method: endpoint.method != null ? convertHttpMethod(endpoint.method) : HttpMethod.Post,
                path: constructHttpPath(endpoint.path ?? kebabCase(endpointId)),
                pathParameters:
                    endpoint["path-parameters"] != null
                        ? Object.entries(endpoint["path-parameters"]).map(([parameterName, parameterType]) => ({
                              docs: typeof parameterType !== "string" ? parameterType.docs : undefined,
                              key: parameterName,
                              valueType: parseTypeReference(parameterType),
                          }))
                        : [],
                queryParameters:
                    endpoint["query-parameters"] != null
                        ? Object.entries(endpoint["query-parameters"]).map(([parameterName, parameterType]) => {
                              const valueType = parseTypeReference(parameterType);
                              return {
                                  docs: typeof parameterType !== "string" ? parameterType.docs : undefined,
                                  key: parameterName,
                                  valueType,
                              };
                          })
                        : [],
                headers:
                    endpoint.headers != null
                        ? Object.entries(endpoint.headers).map(([header, headerType]) => ({
                              header,
                              valueType: parseTypeReference(headerType),
                              docs: getDocs(headerType),
                          }))
                        : [],
                request: convertHttpRequest({
                    request: endpoint.request,
                    fernFilepath,
                    imports,
                    nonStandardEncodings,
                }),
                response: convertHttpResponse({
                    response: endpoint.response,
                    fernFilepath,
                    imports,
                    nonStandardEncodings,
                }),
            })
        ),
    };
}

function convertBasePath({
    serviceDefinition,
    serviceId,
}: {
    serviceDefinition: RawSchemas.HttpServiceSchema;
    serviceId: string;
}): string | undefined {
    const specifiedBasePath = serviceDefinition["base-path"];
    // If base path is unspecified, default to kebab-case of serviceId
    // If base path is "/" or empty, return undefined
    // Otherwise return base path
    if (specifiedBasePath == null) {
        return kebabCase(serviceId);
    } else if (specifiedBasePath === "/") {
        return undefined;
    }
    return specifiedBasePath;
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

function convertHttpAuth(auth: RawSchemas.AuthSchema): HttpAuth {
    switch (auth) {
        case "bearer":
            return HttpAuth.Bearer;
        case "none":
            return HttpAuth.None;
        default:
            assertNever(auth);
    }
}
