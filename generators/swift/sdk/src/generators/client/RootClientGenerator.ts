import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { getSwiftTypeForTypeReference } from "@fern-api/swift-model";

import { HttpEndpoint, HttpMethod, Package, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { formatEndpointPathForSwift } from "./util/format-endpoint-path-for-swift";
import { getQueryParamCaseName } from "./util/get-query-param-case-name";
import { parseEndpointPath } from "./util/parse-endpoint-path";

export declare namespace RootClientGenerator {
    interface Args {
        projectNamePascalCase: string;
        package_: Package;
        context: SdkGeneratorContext;
    }
}

export class RootClientGenerator {
    private readonly projectNamePascalCase: string;
    private readonly package_: Package;
    private readonly context: SdkGeneratorContext;
    private readonly httpClientPropertyInfo;

    public constructor({ projectNamePascalCase, package_, context }: RootClientGenerator.Args) {
        this.projectNamePascalCase = projectNamePascalCase;
        this.package_ = package_;
        this.context = context;
        this.httpClientPropertyInfo = this.getHttpClientPropertyInfo();
    }

    private get service() {
        return this.package_.service != null ? this.context.getHttpServiceOrThrow(this.package_.service) : undefined;
    }

    private getHttpClientPropertyInfo() {
        const subpackages = this.getSubpackages();
        const otherPropertyNames = new Set(subpackages.map((subpackage) => subpackage.name.camelCase.unsafeName));
        let propertyName = "httpClient";
        while (otherPropertyNames.has(propertyName)) {
            propertyName = "_" + propertyName;
        }
        return {
            propertyName,
            swiftType: swift.Type.custom("HTTPClient")
        };
    }

    private getClientName() {
        return `${this.projectNamePascalCase}Client`;
    }

    private getSubClientName(subpackage: Subpackage) {
        return `${subpackage.name.pascalCase.unsafeName}Client`;
    }

    public generate(): SwiftFile {
        const swiftClass = swift.class_({
            name: this.getClientName(),
            final: true,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: this.generateProperties(),
            initializers: [this.generateInitializer()],
            methods: this.generateMethods()
        });
        const fileContents = swiftClass.toString();
        return new SwiftFile({
            filename: `${this.projectNamePascalCase}Client.swift`,
            directory: RelativeFilePath.of(""),
            fileContents
        });
    }

    private generateProperties(): swift.Property[] {
        const subpackages = this.getSubpackages();
        return [
            ...subpackages.map((subpackage) => {
                const clientName = this.getSubClientName(subpackage);
                return swift.property({
                    unsafeName: subpackage.name.camelCase.unsafeName,
                    accessLevel: swift.AccessLevel.Public,
                    declarationType: swift.DeclarationType.Let,
                    type: swift.Type.custom(clientName)
                });
            }),
            swift.property({
                unsafeName: this.httpClientPropertyInfo.propertyName,
                accessLevel: swift.AccessLevel.Private,
                declarationType: swift.DeclarationType.Let,
                type: swift.Type.custom("HTTPClient")
            })
        ];
    }

    private generateInitializer(): swift.Initializer {
        let defaultBaseUrlValue: swift.Expression | undefined;

        if (this.context.ir.environments) {
            if (this.context.ir.environments.environments.type === "singleBaseUrl") {
                const defaultEnvId = this.context.ir.environments.defaultEnvironment;

                // If no default environment is specified, use the first environment
                const defaultEnvironment = this.context.ir.environments.environments.environments.find((e, idx) =>
                    defaultEnvId == null ? idx === 0 : e.id === defaultEnvId
                );
                if (defaultEnvironment != null) {
                    defaultBaseUrlValue = swift.Expression.memberAccess({
                        target: swift.Expression.reference(`${this.projectNamePascalCase}Environment`),
                        memberName: `${defaultEnvironment.name.camelCase.unsafeName}.rawValue`
                    });
                }
            } else if (this.context.ir.environments.environments.type === "multipleBaseUrls") {
                // TODO(kafkas): Handle multiple environments
            } else {
                assertNever(this.context.ir.environments.environments);
            }
        }

        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: [
                swift.functionParameter({
                    argumentLabel: "baseURL",
                    unsafeName: "baseURL",
                    type: swift.Type.string(),
                    defaultValue: defaultBaseUrlValue
                }),
                swift.functionParameter({
                    argumentLabel: "apiKey",
                    unsafeName: "apiKey",
                    type: swift.Type.string()
                }),
                swift.functionParameter({
                    argumentLabel: "token",
                    unsafeName: "token",
                    type: swift.Type.optional(swift.Type.string()),
                    defaultValue: swift.Expression.rawValue("nil")
                }),
                swift.functionParameter({
                    argumentLabel: "headers",
                    unsafeName: "headers",
                    type: swift.Type.optional(swift.Type.dictionary(swift.Type.string(), swift.Type.string())),
                    defaultValue: swift.Expression.rawValue("[:]")
                }),
                swift.functionParameter({
                    argumentLabel: "timeout",
                    unsafeName: "timeout",
                    type: swift.Type.optional(swift.Type.int()),
                    defaultValue: swift.Expression.rawValue("nil")
                }),
                swift.functionParameter({
                    argumentLabel: "maxRetries",
                    unsafeName: "maxRetries",
                    type: swift.Type.optional(swift.Type.int()),
                    defaultValue: swift.Expression.rawValue("nil")
                }),
                swift.functionParameter({
                    argumentLabel: "urlSession",
                    unsafeName: "urlSession",
                    type: swift.Type.optional(swift.Type.custom("URLSession")),
                    defaultValue: swift.Expression.rawValue("nil")
                })
            ],
            body: swift.CodeBlock.withStatements([
                swift.Statement.constantDeclaration(
                    "config",
                    swift.Expression.classInitialization({
                        unsafeName: "ClientConfig",
                        arguments_: [
                            swift.functionArgument({
                                label: "baseURL",
                                value: swift.Expression.reference("baseURL")
                            }),
                            swift.functionArgument({
                                label: "apiKey",
                                value: swift.Expression.reference("apiKey")
                            }),
                            swift.functionArgument({
                                label: "token",
                                value: swift.Expression.reference("token")
                            }),
                            swift.functionArgument({
                                label: "headers",
                                value: swift.Expression.reference("headers")
                            }),
                            swift.functionArgument({
                                label: "timeout",
                                value: swift.Expression.reference("timeout")
                            }),
                            swift.functionArgument({
                                label: "urlSession",
                                value: swift.Expression.reference("urlSession")
                            })
                        ],
                        multiline: true
                    })
                ),
                swift.Statement.propertyAssignment(
                    this.httpClientPropertyInfo.propertyName,
                    swift.Expression.classInitialization({
                        unsafeName: "HTTPClient",
                        arguments_: [
                            swift.functionArgument({ label: "config", value: swift.Expression.reference("config") })
                        ]
                    })
                ),
                ...this.getSubpackages().map((subpackage) => {
                    return swift.Statement.propertyAssignment(
                        subpackage.name.camelCase.unsafeName,
                        swift.Expression.classInitialization({
                            unsafeName: this.getSubClientName(subpackage),
                            arguments_: [
                                swift.functionArgument({
                                    label: "config",
                                    value: swift.Expression.reference("config")
                                })
                            ]
                        })
                    );
                })
            ]),
            multiline: true
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
                            target: swift.Expression.reference(this.httpClientPropertyInfo.propertyName),
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

    private getSubpackages(): Subpackage[] {
        return this.package_.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
