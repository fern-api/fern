import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { Package, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

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
    private readonly configPropertyInfo;

    public constructor({ projectNamePascalCase, package_, context }: RootClientGenerator.Args) {
        this.projectNamePascalCase = projectNamePascalCase;
        this.package_ = package_;
        this.context = context;
        this.configPropertyInfo = this.getConfigPropertyInfo();
    }

    private getConfigPropertyInfo() {
        const subpackages = this.getSubpackages();
        const propertyNames = new Set(subpackages.map((subpackage) => subpackage.name.camelCase.unsafeName));
        let propertyName = "config";
        while (propertyNames.has(propertyName)) {
            propertyName = "_" + propertyName;
        }
        return {
            propertyName,
            swiftType: swift.Type.custom("ClientConfig")
        };
    }

    public generate(): SwiftFile {
        const swiftClass = swift.class_({
            name: this.getRootClientName(),
            final: true,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: this.generateProperties(),
            initializers: [this.generateInitializer()]
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
                unsafeName: this.configPropertyInfo.propertyName,
                accessLevel: swift.AccessLevel.Private,
                declarationType: swift.DeclarationType.Let,
                type: this.configPropertyInfo.swiftType
            })
        ];
    }

    private generateInitializer(): swift.Initializer {
        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: [
                swift.functionParameter({
                    argumentLabel: "baseURL",
                    unsafeName: "baseURL",
                    type: swift.Type.string(),
                    defaultValue: swift.Expression.memberAccess({
                        target: swift.Expression.reference(`${this.projectNamePascalCase}Environment`),
                        memberName: "default.rawValue"
                    })
                }),
                swift.functionParameter({
                    argumentLabel: "apiKey",
                    unsafeName: "qpiKey",
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
                swift.Statement.propertyAssignment(
                    this.configPropertyInfo.propertyName,
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
                ...this.getSubpackages().map((subpackage) => {
                    return swift.Statement.propertyAssignment(
                        subpackage.name.camelCase.unsafeName,
                        swift.Expression.classInitialization({
                            unsafeName: this.getSubClientName(subpackage),
                            arguments_: [
                                swift.functionArgument({
                                    label: "config",
                                    value: swift.Expression.reference(this.configPropertyInfo.propertyName)
                                })
                            ]
                        })
                    );
                })
            ])
        });
    }

    private getRootClientName() {
        return `${this.projectNamePascalCase}Client`;
    }

    private getSubClientName(subpackage: Subpackage) {
        return `${subpackage.name.pascalCase.unsafeName}Client`;
    }

    private getSubpackages(): Subpackage[] {
        return this.package_.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
