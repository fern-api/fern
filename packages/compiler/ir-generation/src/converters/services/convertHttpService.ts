import { assertNever } from "@fern-api/commons";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { CustomWireMessageEncoding } from "@fern-fern/ir-model/services/commons";
import { EndpointId, HttpAuth, HttpEndpoint, HttpMethod, HttpService } from "@fern-fern/ir-model/services/http";
import { ContainerType, FernFilepath, TypeReference } from "@fern-fern/ir-model/types";
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
        basePath: serviceDefinition["base-path"],
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
                method: convertHttpMethod(endpoint.method),
                path: constructHttpPath(endpoint.path),
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
                                  // query parameters are always optional, so wrap the valueType in an optional
                                  // container if it's not already optional
                                  valueType:
                                      valueType._type === "container" && valueType.container._type === "optional"
                                          ? valueType
                                          : TypeReference.container(ContainerType.optional(valueType)),
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

function convertHttpMethod(method: RawSchemas.HttpEndpointSchema["method"]): HttpMethod {
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
