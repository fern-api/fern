import { assertNever } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { HttpEndpoint, HttpMethod } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { ClientGeneratorContext } from "./ClientGeneratorContext";
import { formatEndpointPathForSwift } from "./util/format-endpoint-path-for-swift";
import { getQueryParamCaseName } from "./util/get-query-param-case-name";
import { parseEndpointPath } from "./util/parse-endpoint-path";

export declare namespace EndpointMethodGenerator {
    interface Args {
        clientGeneratorContext: ClientGeneratorContext;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class EndpointMethodGenerator {
    private readonly clientGeneratorContext: ClientGeneratorContext;
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public constructor({ clientGeneratorContext, sdkGeneratorContext }: EndpointMethodGenerator.Args) {
        this.clientGeneratorContext = clientGeneratorContext;
        this.sdkGeneratorContext = sdkGeneratorContext;
    }

    public generateMethod(endpoint: HttpEndpoint): swift.Method {
        const parameters = this.getMethodParametersForEndpoint(endpoint);
        return swift.method({
            unsafeName: endpoint.name.camelCase.unsafeName,
            accessLevel: swift.AccessLevel.Public,
            parameters,
            async: true,
            throws: true,
            returnType: swift.TypeReference.type(this.getMethodReturnTypeForEndpoint(endpoint)),
            body: this.getMethodBodyForEndpoint(endpoint),
            docs: endpoint.docs
                ? swift.docComment({
                      summary: endpoint.docs,
                      parameters: parameters
                          .map((p) => ({
                              name: p.unsafeName,
                              description: p.docsContent ?? ""
                          }))
                          .filter((p) => p.description !== "")
                  })
                : undefined
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
                        type: swift.TypeReference.type(swift.Type.string()),
                        docsContent: pathPart.docs
                    })
                );
            }
        });

        endpoint.headers.forEach((header) => {
            const swiftType = this.sdkGeneratorContext.getSwiftTypeForTypeReference(header.valueType);
            if (swiftType.nonOptionalType !== "string") {
                return;
            }
            params.push(
                swift.functionParameter({
                    argumentLabel: header.name.name.camelCase.unsafeName,
                    unsafeName: header.name.name.camelCase.unsafeName,
                    type: swift.TypeReference.type(swiftType),
                    defaultValue: swiftType.isOptional ? swift.Expression.rawValue("nil") : undefined,
                    docsContent: header.docs
                })
            );
        });

        endpoint.queryParameters.forEach((queryParam) => {
            const swiftType = this.sdkGeneratorContext.getSwiftTypeForTypeReference(queryParam.valueType);
            params.push(
                swift.functionParameter({
                    argumentLabel: queryParam.name.name.camelCase.unsafeName,
                    unsafeName: queryParam.name.name.camelCase.unsafeName,
                    type: swift.TypeReference.type(swiftType),
                    defaultValue: swiftType.isOptional ? swift.Expression.rawValue("nil") : undefined,
                    docsContent: queryParam.docs
                })
            );
        });

        if (endpoint.requestBody) {
            if (endpoint.requestBody.type === "reference") {
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: swift.TypeReference.type(
                            this.sdkGeneratorContext.getSwiftTypeForTypeReference(endpoint.requestBody.requestBodyType)
                        ),
                        docsContent: endpoint.requestBody.docs
                    })
                );
            } else if (endpoint.requestBody.type === "inlinedRequestBody") {
                const fullyQualifiedRequestTypeSymbolName =
                    this.sdkGeneratorContext.project.srcSymbolRegistry.getFullyQualifiedRequestTypeSymbolOrThrow(
                        endpoint.id,
                        endpoint.requestBody.name.pascalCase.unsafeName
                    );
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: swift.TypeReference.type(swift.Type.custom(fullyQualifiedRequestTypeSymbolName)),
                        docsContent: endpoint.requestBody.docs
                    })
                );
            } else if (endpoint.requestBody.type === "bytes") {
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: swift.TypeReference.type(swift.Type.data()),
                        docsContent: endpoint.requestBody.docs
                    })
                );
            } else if (endpoint.requestBody.type === "fileUpload") {
                const fullyQualifiedRequestTypeSymbolName =
                    this.sdkGeneratorContext.project.srcSymbolRegistry.getFullyQualifiedRequestTypeSymbolOrThrow(
                        endpoint.id,
                        endpoint.requestBody.name.pascalCase.unsafeName
                    );
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: swift.TypeReference.type(swift.Type.custom(fullyQualifiedRequestTypeSymbolName)),
                        docsContent: endpoint.requestBody.docs
                    })
                );
            } else {
                assertNever(endpoint.requestBody);
            }
        }

        params.push(
            swift.functionParameter({
                argumentLabel: "requestOptions",
                unsafeName: "requestOptions",
                type: swift.TypeReference.type(swift.Type.optional(swift.Type.custom("RequestOptions"))),
                defaultValue: swift.Expression.rawValue("nil"),
                docsContent:
                    "Additional options for configuring the request, such as custom headers or timeout settings."
            })
        );

        return params;
    }

    private getMethodReturnTypeForEndpoint(endpoint: HttpEndpoint): swift.Type {
        if (!endpoint.response || !endpoint.response.body) {
            return swift.Type.void();
        }
        return endpoint.response.body._visit({
            json: (resp) => this.sdkGeneratorContext.getSwiftTypeForTypeReference(resp.responseBodyType),
            fileDownload: () => swift.Type.data(),
            text: () => swift.Type.jsonValue(), // TODO(kafkas): Handle text responses
            bytes: () => swift.Type.jsonValue(), // TODO(kafkas): Handle bytes responses
            streaming: () => swift.Type.jsonValue(), // TODO(kafkas): Handle streaming responses
            streamParameter: () => swift.Type.jsonValue(), // TODO(kafkas): Handle stream parameter responses
            _other: () => swift.Type.jsonValue()
        });
    }

    private getMethodBodyForEndpoint(endpoint: HttpEndpoint): swift.CodeBlock {
        // TODO(kafkas): Handle name collisions

        const statements: swift.Statement[] = [
            swift.Statement.return(
                swift.Expression.try(
                    swift.Expression.await(
                        swift.Expression.methodCall({
                            target: swift.Expression.reference(
                                this.clientGeneratorContext.httpClient.property.unsafeName
                            ),
                            methodName: "performRequest",
                            arguments_: this.getPerformRequestArgumentsForEndpoint(endpoint),
                            multiline: true
                        })
                    )
                )
            )
        ];

        return swift.CodeBlock.withStatements(statements);
    }

    private getPerformRequestArgumentsForEndpoint(endpoint: HttpEndpoint) {
        const arguments_ = [
            swift.functionArgument({
                label: "method",
                value: swift.Expression.enumCaseShorthand(this.getEnumCaseNameForHttpMethod(endpoint.method))
            }),
            // TODO(kafkas): Handle multi-url environments
            swift.functionArgument({
                label: "path",
                value: swift.Expression.stringLiteral(formatEndpointPathForSwift(endpoint))
            })
        ];

        if (endpoint.requestBody?.type === "bytes") {
            arguments_.push(
                swift.functionArgument({
                    label: "contentType",
                    value: swift.Expression.enumCaseShorthand("applicationOctetStream")
                })
            );
        } else if (endpoint.requestBody?.type === "fileUpload") {
            arguments_.push(
                swift.functionArgument({
                    label: "contentType",
                    value: swift.Expression.enumCaseShorthand("multipartFormData")
                })
            );
        }

        const validHeaders = endpoint.headers.filter(
            (header) =>
                this.sdkGeneratorContext.getSwiftTypeForTypeReference(header.valueType).nonOptionalType === "string"
        );

        if (validHeaders.length > 0) {
            arguments_.push(
                swift.functionArgument({
                    label: "headers",
                    value: swift.Expression.dictionaryLiteral({
                        entries: validHeaders.map((header) => {
                            return [
                                swift.Expression.stringLiteral(header.name.wireValue),
                                swift.Expression.reference(header.name.name.camelCase.unsafeName)
                            ];
                        }),
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
                            const key = swift.Expression.stringLiteral(queryParam.name.name.originalName);
                            const swiftType = this.sdkGeneratorContext.getSwiftTypeForTypeReference(
                                queryParam.valueType
                            );
                            if (swiftType.isOptional) {
                                return [
                                    key,
                                    swift.Expression.methodCallWithTrailingClosure({
                                        target:
                                            swiftType.nonOptionalType === "nullable"
                                                ? swift.Expression.memberAccess({
                                                      target: swift.Expression.reference(
                                                          queryParam.name.name.camelCase.unsafeName
                                                      ),
                                                      optionalChain: true,
                                                      memberName: "wrappedValue"
                                                  })
                                                : swift.Expression.reference(queryParam.name.name.camelCase.unsafeName),
                                        methodName: "map",
                                        closureBody: swift.Expression.contextualMethodCall({
                                            methodName: getQueryParamCaseName(swiftType),
                                            arguments_: [
                                                swift.functionArgument({
                                                    value:
                                                        swiftType.nonOptional().nonNullableType === "custom"
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
                                    swiftType.nonOptionalType === "nullable"
                                        ? swift.Expression.methodCallWithTrailingClosure({
                                              target: swift.Expression.memberAccess({
                                                  target: swift.Expression.reference(
                                                      queryParam.name.name.camelCase.unsafeName
                                                  ),
                                                  memberName: "wrappedValue"
                                              }),
                                              methodName: "map",
                                              closureBody: swift.Expression.contextualMethodCall({
                                                  methodName: getQueryParamCaseName(swiftType),
                                                  arguments_: [
                                                      swift.functionArgument({
                                                          value: swift.Expression.reference("$0")
                                                      })
                                                  ]
                                              })
                                          })
                                        : swift.Expression.contextualMethodCall({
                                              methodName: getQueryParamCaseName(swiftType),
                                              arguments_: [
                                                  swift.functionArgument({
                                                      value:
                                                          swiftType.nonOptionalType === "custom"
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
            if (endpoint.requestBody.type === "fileUpload") {
                arguments_.push(
                    swift.functionArgument({
                        label: "body",
                        value: swift.Expression.methodCall({
                            target: swift.Expression.reference("request"),
                            methodName: "asMultipartFormData"
                        })
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

        return arguments_;
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
}
