import { assertNever } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { getSwiftTypeForTypeReference } from "@fern-api/swift-model";

import { HttpEndpoint, HttpMethod } from "@fern-fern/ir-sdk/api";

import { ClientGeneratorContext } from "./ClientGeneratorContext";
import { formatEndpointPathForSwift } from "./util/format-endpoint-path-for-swift";
import { getQueryParamCaseName } from "./util/get-query-param-case-name";
import { parseEndpointPath } from "./util/parse-endpoint-path";

export declare namespace EndpointMethodGenerator {
    interface Args {
        clientGeneratorContext: ClientGeneratorContext;
    }
}

export class EndpointMethodGenerator {
    private readonly clientGeneratorContext: ClientGeneratorContext;

    public constructor({ clientGeneratorContext }: EndpointMethodGenerator.Args) {
        this.clientGeneratorContext = clientGeneratorContext;
    }

    public generateMethod(endpoint: HttpEndpoint): swift.Method {
        return swift.method({
            unsafeName: endpoint.name.camelCase.unsafeName,
            accessLevel: swift.AccessLevel.Public,
            parameters: this.getMethodParametersForEndpoint(endpoint),
            async: true,
            throws: true,
            returnType: this.getMethodReturnTypeForEndpoint(endpoint),
            body: this.getMethodBodyForEndpoint(endpoint)
        });
    }

    private getMethodParametersForEndpoint(endpoint: HttpEndpoint): swift.FunctionParameter[] {
        const params: swift.FunctionParameter[] = [];

        const { pathParts } = parseEndpointPath(endpoint);

        pathParts.forEach((pathPart) => {
            if (pathPart.type === "path-parameter") {
                params.push(
                    swift.functionParameter({
                        argumentLabel: pathPart.unsafeNameCamelCase,
                        unsafeName: pathPart.unsafeNameCamelCase,
                        type: swift.Type.string()
                    })
                );
            }
        });

        endpoint.headers.forEach((header) => {
            const swiftType = getSwiftTypeForTypeReference(header.valueType);
            params.push(
                swift.functionParameter({
                    argumentLabel: header.name.name.camelCase.unsafeName,
                    unsafeName: header.name.name.camelCase.unsafeName,
                    type: swiftType,
                    defaultValue: swiftType.isOptional ? swift.Expression.rawValue("nil") : undefined
                })
            );
        });

        endpoint.queryParameters.forEach((queryParam) => {
            const swiftType = getSwiftTypeForTypeReference(queryParam.valueType);
            params.push(
                swift.functionParameter({
                    argumentLabel: queryParam.name.name.camelCase.unsafeName,
                    unsafeName: queryParam.name.name.camelCase.unsafeName,
                    type: swiftType,
                    defaultValue: swiftType.isOptional ? swift.Expression.rawValue("nil") : undefined
                })
            );
        });

        if (endpoint.requestBody) {
            if (endpoint.requestBody.type === "reference") {
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: getSwiftTypeForTypeReference(endpoint.requestBody.requestBodyType)
                    })
                );
            } else if (endpoint.requestBody.type === "inlinedRequestBody") {
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: swift.Type.custom(endpoint.requestBody.name.pascalCase.unsafeName)
                    })
                );
            } else if (endpoint.requestBody.type === "bytes") {
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: swift.Type.data()
                    })
                );
            } else {
                // TODO(kafkas): Handle other request body types
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: swift.Type.existentialAny(swift.Protocol.Codable)
                    })
                );
            }
        }

        params.push(
            swift.functionParameter({
                argumentLabel: "requestOptions",
                unsafeName: "requestOptions",
                type: swift.Type.optional(swift.Type.custom("RequestOptions")),
                defaultValue: swift.Expression.rawValue("nil")
            })
        );

        return params;
    }

    private getMethodReturnTypeForEndpoint(endpoint: HttpEndpoint): swift.Type {
        if (!endpoint.response || !endpoint.response.body) {
            return swift.Type.void();
        }
        return endpoint.response.body._visit({
            json: (resp) => getSwiftTypeForTypeReference(resp.responseBodyType),
            fileDownload: () => swift.Type.any(),
            text: () => swift.Type.any(),
            bytes: () => swift.Type.any(),
            streaming: () => swift.Type.any(),
            streamParameter: () => swift.Type.any(),
            _other: () => swift.Type.any()
        });
    }

    private getMethodBodyForEndpoint(endpoint: HttpEndpoint): swift.CodeBlock {
        // TODO(kafkas): Handle name collisions

        const arguments_ = [
            swift.functionArgument({
                label: "method",
                value: swift.Expression.enumCaseShorthand(this.getEnumCaseNameForHttpMethod(endpoint.method))
            }),
            // TODO(kafkas): Handle multi-url environments
            swift.functionArgument({
                label: "path",
                value: swift.Expression.rawStringValue(formatEndpointPathForSwift(endpoint))
            })
        ];

        if (endpoint.headers.length > 0) {
            arguments_.push(
                swift.functionArgument({
                    label: "headers",
                    value: swift.Expression.dictionaryLiteral({
                        entries: endpoint.headers.map((header) => [
                            swift.Expression.rawStringValue(header.name.name.originalName),
                            swift.Expression.reference(header.name.name.camelCase.unsafeName)
                        ]),
                        multiline: true
                    })
                })
            );
        }

        if (endpoint.queryParameters.length > 0) {
            arguments_.push(
                swift.functionArgument({
                    label: "queryParams",
                    value: swift.Expression.dictionaryLiteral({
                        entries: endpoint.queryParameters.map((queryParam) => {
                            const key = swift.Expression.rawStringValue(queryParam.name.name.originalName);
                            const swiftType = getSwiftTypeForTypeReference(queryParam.valueType);
                            if (swiftType.isOptional) {
                                return [
                                    key,
                                    swift.Expression.methodCallWithTrailingClosure({
                                        target: swift.Expression.reference(queryParam.name.name.camelCase.unsafeName),
                                        methodName: "map",
                                        closureBody: swift.Expression.contextualMethodCall({
                                            methodName: getQueryParamCaseName(swiftType),
                                            arguments_: [
                                                swift.functionArgument({
                                                    value:
                                                        swiftType.unwrappedType === "custom"
                                                            ? swift.Expression.memberAccess({
                                                                  target: swift.Expression.reference("$0"),
                                                                  memberName: "rawValue"
                                                              })
                                                            : swift.Expression.reference("$0")
                                                })
                                            ]
                                        })
                                    })
                                ];
                            } else {
                                return [
                                    key,
                                    swift.Expression.contextualMethodCall({
                                        methodName: getQueryParamCaseName(swiftType),
                                        arguments_: [
                                            swift.functionArgument({
                                                value:
                                                    swiftType.unwrappedType === "custom"
                                                        ? swift.Expression.memberAccess({
                                                              target: swift.Expression.reference(
                                                                  queryParam.name.name.camelCase.unsafeName
                                                              ),
                                                              memberName: "rawValue"
                                                          })
                                                        : swift.Expression.reference(
                                                              queryParam.name.name.camelCase.unsafeName
                                                          )
                                            })
                                        ]
                                    })
                                ];
                            }
                        }),
                        multiline: true
                    })
                })
            );
        }

        if (endpoint.requestBody) {
            if (endpoint.requestBody.type === "bytes") {
                arguments_.push(
                    swift.functionArgument({
                        label: "fileData",
                        value: swift.Expression.reference("request")
                    })
                );
            } else {
                arguments_.push(
                    swift.functionArgument({
                        label: "body",
                        value: swift.Expression.reference("request")
                    })
                );
            }
        }

        arguments_.push(
            swift.functionArgument({
                label: "requestOptions",
                value: swift.Expression.reference("requestOptions")
            })
        );

        const returnType = this.getMethodReturnTypeForEndpoint(endpoint);

        if (returnType.type !== "void") {
            arguments_.push(
                swift.functionArgument({
                    label: "responseType",
                    value: swift.Expression.memberAccess({
                        target: this.getMethodReturnTypeForEndpoint(endpoint),
                        memberName: "self"
                    })
                })
            );
        }

        return swift.CodeBlock.withStatements([
            swift.Statement.return(
                swift.Expression.try(
                    swift.Expression.await(
                        swift.Expression.methodCall({
                            target: swift.Expression.reference(
                                this.clientGeneratorContext.httpClient.property.unsafeName
                            ),
                            methodName: this.getHttpClientMethodNameForEndpoint(endpoint),
                            arguments_,
                            multiline: true
                        })
                    )
                )
            )
        ]);
    }

    private getEnumCaseNameForHttpMethod(method: HttpMethod): string {
        switch (method) {
            case "GET":
                return "get";
            case "POST":
                return "post";
            case "PUT":
                return "put";
            case "DELETE":
                return "delete";
            case "PATCH":
                return "patch";
            case "HEAD":
                return "head";
            default:
                assertNever(method);
        }
    }

    private getHttpClientMethodNameForEndpoint(endpoint: HttpEndpoint): string {
        if (endpoint.requestBody?.type === "bytes") {
            return "performFileUpload";
        }
        return "performRequest";
    }
}
