import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { getSwiftTypeForTypeReference } from "@fern-api/swift-model";
import { isOptionalType } from "@fern-api/swift-model";

import { HttpEndpoint, HttpMethod, HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { formatEndpointPathForSwift } from "./util/format-endpoint-path-for-swift";
import { parseEndpointPath } from "./util/parse-endpoint-path";

export declare namespace SubClientGenerator {
    interface Args {
        subpackage: Subpackage;
        context: SdkGeneratorContext;
        serviceId?: ServiceId;
        service?: HttpService;
    }
}

export class SubClientGenerator {
    private readonly subpackage: Subpackage;
    private readonly context: SdkGeneratorContext;
    private readonly serviceId?: ServiceId;
    private readonly service?: HttpService;

    public constructor({ subpackage, context, serviceId, service }: SubClientGenerator.Args) {
        this.subpackage = subpackage;
        this.context = context;
        this.serviceId = serviceId;
        this.service = service;
    }

    private get subClientName() {
        return `${this.subpackage.name.pascalCase.unsafeName}Client`;
    }

    public generate(): SwiftFile {
        const swiftClass = swift.class_({
            name: this.subClientName,
            final: true,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: this.generateProperties(),
            initializers: [this.generateInitializer()],
            methods: this.generateMethods()
        });
        const fileContents = swiftClass.toString();
        return new SwiftFile({
            filename: this.subpackage.name.pascalCase.safeName + ".swift",
            directory: RelativeFilePath.of("Resources"),
            fileContents
        });
    }

    private generateProperties(): swift.Property[] {
        return [
            swift.property({
                unsafeName: "httpClient",
                accessLevel: swift.AccessLevel.Private,
                declarationType: swift.DeclarationType.Let,
                type: swift.Type.custom("HTTPClient")
            })
        ];
    }

    private generateInitializer(): swift.Initializer {
        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: [
                swift.functionParameter({
                    argumentLabel: "config",
                    unsafeName: "config",
                    type: swift.Type.custom("ClientConfig")
                })
            ],
            body: swift.CodeBlock.withStatements([
                swift.Statement.propertyAssignment(
                    "httpClient",
                    swift.Expression.classInitialization({
                        unsafeName: "HTTPClient",
                        arguments_: [
                            swift.functionArgument({ label: "config", value: swift.Expression.reference("config") })
                        ]
                    })
                )
            ])
        });
    }

    private generateMethods(): swift.Method[] | undefined {
        return this.service?.endpoints.map((endpoint) => {
            return swift.method({
                unsafeName: endpoint.name.camelCase.unsafeName,
                accessLevel: swift.AccessLevel.Public,
                parameters: this.getMethodParametersForEndpoint(endpoint),
                async: true,
                throws: true,
                returnType: this.getMethodReturnTypeForEndpoint(endpoint),
                body: this.getMethodBodyForEndpoint(endpoint)
            });
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
                        type: swift.Type.custom("String")
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
                // TODO(kafkas): Handle inlined request body types
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: swift.Type.any()
                    })
                );
            } else {
                // TODO(kafkas): Handle other request body types
                params.push(
                    swift.functionParameter({
                        argumentLabel: "request",
                        unsafeName: "request",
                        type: swift.Type.any()
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
        return (
            endpoint.response?.body?._visit({
                json: (resp) => getSwiftTypeForTypeReference(resp.responseBodyType),
                fileDownload: () => swift.Type.custom("Any"),
                text: () => swift.Type.custom("Any"),
                bytes: () => swift.Type.custom("Any"),
                streaming: () => swift.Type.custom("Any"),
                streamParameter: () => swift.Type.custom("Any"),
                _other: () => swift.Type.custom("Any")
            }) ?? swift.Type.custom("Any")
        );
    }

    private getMethodBodyForEndpoint(endpoint: HttpEndpoint): swift.CodeBlock {
        // TODO(kafkas): Handle name collisions

        const arguments_ = [
            swift.functionArgument({
                label: "method",
                value: swift.Expression.enumCaseShorthand(this.getEnumCaseNameForHttpMethod(endpoint.method))
            }),
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
                            // TODO(kafkas): Fix this. It's a buggy implementation.
                            const key = swift.Expression.rawStringValue(queryParam.name.name.originalName);
                            const swiftType = getSwiftTypeForTypeReference(queryParam.valueType);

                            if (swiftType.isOptional) {
                                return [
                                    key,
                                    swift.Expression.methodCallWithTrailingClosure({
                                        target: swift.Expression.reference(queryParam.name.name.camelCase.unsafeName),
                                        methodName: "map",
                                        closureBody: swift.Expression.contextualMethodCall({
                                            methodName: "string", // TODO(kafkas): Make dynamic
                                            arguments_: [
                                                swift.functionArgument({
                                                    value: swiftType.isCustom
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
                                        methodName: "string", // TODO(kafkas): Make dynamic
                                        arguments_: [
                                            swift.functionArgument({
                                                value: swiftType.isCustom
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
            arguments_.push(
                swift.functionArgument({
                    label: "body",
                    value: swift.Expression.reference("request")
                })
            );
        }

        arguments_.push(
            swift.functionArgument({
                label: "requestOptions",
                value: swift.Expression.reference("requestOptions")
            })
        );

        // TODO(kafkas): Add `responseType`

        return swift.CodeBlock.withStatements([
            swift.Statement.return(
                swift.Expression.try(
                    swift.Expression.await(
                        swift.Expression.methodCall({
                            target: swift.Expression.reference("httpClient"),
                            // TODO(kafkas): Changes based on content type
                            methodName: "performRequest",
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

    private getSubpackages(): Subpackage[] {
        return this.subpackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
