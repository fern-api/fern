import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { Package, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { EndpointMethodGenerator } from "./EndpointMethodGenerator";

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

    private generateMethods(): swift.Method[] {
        const endpointMethodGenerator = new EndpointMethodGenerator({
            httpClientPropertyName: this.httpClientPropertyInfo.propertyName
        });
        return (this.service?.endpoints ?? []).map((endpoint) => {
            return endpointMethodGenerator.generateMethod(endpoint);
        });
    }

    private getSubpackages(): Subpackage[] {
        return this.package_.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
