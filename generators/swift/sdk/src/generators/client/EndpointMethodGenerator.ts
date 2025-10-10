import { assertNever } from "@fern-api/core-utils";
import { Referencer } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { HttpEndpoint, HttpMethod, TypeReference } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { ClientGeneratorContext } from "./ClientGeneratorContext";
import { formatEndpointPathForSwift } from "./util/format-endpoint-path-for-swift";
import { parseEndpointPath } from "./util/parse-endpoint-path";

export declare namespace EndpointMethodGenerator {
    interface Args {
        parentClassSymbol: swift.Symbol;
        clientGeneratorContext: ClientGeneratorContext;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class EndpointMethodGenerator {
    private readonly parentClassSymbol: swift.Symbol;
    private readonly clientGeneratorContext: ClientGeneratorContext;
    private readonly sdkGeneratorContext: SdkGeneratorContext;
    private readonly referencer: Referencer;

    public constructor({
        parentClassSymbol,
        clientGeneratorContext,
        sdkGeneratorContext
    }: EndpointMethodGenerator.Args) {
        this.parentClassSymbol = parentClassSymbol;
        this.clientGeneratorContext = clientGeneratorContext;
        this.sdkGeneratorContext = sdkGeneratorContext;
        this.referencer = sdkGeneratorContext.createReferencer(parentClassSymbol);
    }

    public generateMethod(endpoint: HttpEndpoint): swift.Method {
        const parameters = this.getMethodParametersForEndpoint(endpoint);
        return swift.method({
            unsafeName: endpoint.name.camelCase.unsafeName,
            accessLevel: swift.AccessLevel.Public,
            parameters,
            async: true,
            throws: true,
            returnType: this.getMethodReturnTypeForEndpoint(endpoint),
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
            const swiftType = this.getSwiftTypeForTypeReference(header.valueType);
            if (!this.referencer.resolvesToTheSwiftType(swiftType, "String")) {
                return;
            }
            params.push(
                swift.functionParameter({
                    argumentLabel: header.name.name.camelCase.unsafeName,
                    unsafeName: header.name.name.camelCase.unsafeName,
                    type: swiftType,
                    defaultValue: swiftType.isOptional ? swift.Expression.rawValue("nil") : undefined,
                    docsContent: header.docs
                })
            );
        });

        endpoint.queryParameters.forEach((queryParam) => {
            const swiftType = this.sdkGeneratorContext.getSwiftTypeReferenceFromScope(
                queryParam.valueType,
                this.parentClassSymbol
            );
            params.push(
                swift.functionParameter({
                    argumentLabel: queryParam.name.name.camelCase.unsafeName,
                    unsafeName: queryParam.name.name.camelCase.unsafeName,
                    type: swiftType,
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
                        type: this.sdkGeneratorContext.getSwiftTypeReferenceFromScope(
                            endpoint.requestBody.requestBodyType,
                            this.parentClassSymbol
                        ),
                        docsContent: endpoint.requestBody.docs
                    })
                );
            } else if (endpoint.requestBody.type === "inlinedRequestBody") {
                const requestTypeSymbol = this.sdkGeneratorContext.project.srcNameRegistry.getRequestTypeSymbolOrThrow(
                    endpoint.id,
                    endpoint.requestBody.name.pascalCase.unsafeName
                );
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: this.referencer.referenceType(requestTypeSymbol),
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
                const requestTypeSymbol = this.sdkGeneratorContext.project.srcNameRegistry.getRequestTypeSymbolOrThrow(
                    endpoint.id,
                    endpoint.requestBody.name.pascalCase.unsafeName
                );
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: this.referencer.referenceType(requestTypeSymbol),
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

    private getMethodReturnTypeForEndpoint(endpoint: HttpEndpoint): swift.TypeReference {
        if (!endpoint.response || !endpoint.response.body) {
            return this.referencer.referenceSwiftType("Void");
        }
        return endpoint.response.body._visit({
            json: (resp) =>
                this.sdkGeneratorContext.getSwiftTypeReferenceFromScope(resp.responseBodyType, this.parentClassSymbol),
            fileDownload: () => this.referencer.referenceFoundationType("Data"),
            text: () => this.referencer.referenceAsIsType("JSONValue"), // TODO(kafkas): Handle text responses
            bytes: () => this.referencer.referenceAsIsType("JSONValue"), // TODO(kafkas): Handle bytes responses
            streaming: () => this.referencer.referenceAsIsType("JSONValue"), // TODO(kafkas): Handle streaming responses
            streamParameter: () => this.referencer.referenceAsIsType("JSONValue"), // TODO(kafkas): Handle stream parameter responses
            _other: () => this.referencer.referenceAsIsType("JSONValue")
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

        const validHeaders = endpoint.headers.filter((header) => {
            const swiftType = this.getSwiftTypeForTypeReference(header.valueType);
            return this.referencer.resolvesToTheSwiftType(swiftType.nonOptional(), "String");
        });

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
                            const swiftType = this.getSwiftTypeForTypeReference(queryParam.valueType);
                            if (swiftType.isOptional) {
                                return [
                                    key,
                                    swift.Expression.methodCallWithTrailingClosure({
                                        target: swiftType.nonOptional().isNullable
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
                                            methodName: this.inferQueryParamCaseName(swiftType),
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
                                    swiftType.nonOptional().isNullable
                                        ? swift.Expression.methodCallWithTrailingClosure({
                                              target: swift.Expression.memberAccess({
                                                  target: swift.Expression.reference(
                                                      queryParam.name.name.camelCase.unsafeName
                                                  ),
                                                  memberName: "wrappedValue"
                                              }),
                                              methodName: "map",
                                              closureBody: swift.Expression.contextualMethodCall({
                                                  methodName: this.inferQueryParamCaseName(swiftType),
                                                  arguments_: [
                                                      swift.functionArgument({
                                                          value: swift.Expression.reference("$0")
                                                      })
                                                  ]
                                              })
                                          })
                                        : swift.Expression.contextualMethodCall({
                                              methodName: this.inferQueryParamCaseName(swiftType),
                                              arguments_: [
                                                  swift.functionArgument({
                                                      value: this.referencer.resolvesToACustomType(
                                                          swiftType.nonOptional()
                                                      )
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

        if (!this.referencer.resolvesToTheSwiftType(returnType, "Void")) {
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

    private getSwiftTypeForTypeReference(typeReference: TypeReference) {
        return this.sdkGeneratorContext.getSwiftTypeReferenceFromScope(typeReference, this.parentClassSymbol);
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

    public inferQueryParamCaseName(typeReference: swift.TypeReference): string {
        // TODO(kafkas): Implement
        throw new Error("Not implemented");
    }
}
