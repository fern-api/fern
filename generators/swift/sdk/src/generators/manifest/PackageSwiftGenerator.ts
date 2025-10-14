import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { SDKRequirements } from "../../requirements";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace PackageSwiftGenerator {
    interface Args {
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class PackageSwiftGenerator {
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public constructor({ sdkGeneratorContext }: PackageSwiftGenerator.Args) {
        this.sdkGeneratorContext = sdkGeneratorContext;
    }

    public generate(): SwiftFile {
        const targetElements = [
            swift.Expression.contextualMethodCall({
                methodName: "target",
                arguments_: [
                    swift.functionArgument({
                        label: "name",
                        value: swift.Expression.stringLiteral(this.sdkGeneratorContext.sourceTargetName)
                    }),
                    swift.functionArgument({
                        label: "path",
                        value: swift.Expression.stringLiteral("Sources")
                    })
                ],
                multiline: true
            })
        ];

        if (this.sdkGeneratorContext.hasTests) {
            targetElements.push(
                swift.Expression.contextualMethodCall({
                    methodName: "testTarget",
                    arguments_: [
                        swift.functionArgument({
                            label: "name",
                            value: swift.Expression.stringLiteral(this.sdkGeneratorContext.testTargetName)
                        }),
                        swift.functionArgument({
                            label: "dependencies",
                            value: swift.Expression.arrayLiteral({
                                elements: [swift.Expression.stringLiteral(this.sdkGeneratorContext.sourceTargetName)]
                            })
                        }),
                        swift.functionArgument({
                            label: "path",
                            value: swift.Expression.stringLiteral("Tests")
                        })
                    ],
                    multiline: true
                })
            );
        }

        return SwiftFile.create({
            filename: "Package.swift",
            directory: RelativeFilePath.of(""),
            contents: [
                swift.comment({ content: `swift-tools-version: ${SDKRequirements.minSwiftVersion}` }),
                swift.LineBreak.single(),
                swift.Statement.import("PackageDescription"),
                swift.LineBreak.single(),
                swift.Statement.constantDeclaration({
                    unsafeName: "package",
                    value: swift.Expression.classInitialization({
                        unsafeName: "Package",
                        arguments_: [
                            swift.functionArgument({
                                label: "name",
                                value: swift.Expression.stringLiteral(this.sdkGeneratorContext.packageName)
                            }),
                            swift.functionArgument({
                                label: "platforms",
                                value: swift.Expression.arrayLiteral({
                                    elements: [
                                        swift.Expression.contextualMethodCall({
                                            methodName: "iOS",
                                            arguments_: [
                                                swift.functionArgument({
                                                    value: swift.Expression.enumCaseShorthand(
                                                        `v${SDKRequirements.minIOSVersion}`
                                                    )
                                                })
                                            ]
                                        }),
                                        swift.Expression.contextualMethodCall({
                                            methodName: "macOS",
                                            arguments_: [
                                                swift.functionArgument({
                                                    value: swift.Expression.enumCaseShorthand(
                                                        `v${SDKRequirements.minMacOSVersion}`
                                                    )
                                                })
                                            ]
                                        }),
                                        swift.Expression.contextualMethodCall({
                                            methodName: "tvOS",
                                            arguments_: [
                                                swift.functionArgument({
                                                    value: swift.Expression.enumCaseShorthand(
                                                        `v${SDKRequirements.minTVOSVersion}`
                                                    )
                                                })
                                            ]
                                        }),
                                        swift.Expression.contextualMethodCall({
                                            methodName: "watchOS",
                                            arguments_: [
                                                swift.functionArgument({
                                                    value: swift.Expression.enumCaseShorthand(
                                                        `v${SDKRequirements.minWatchOSVersion}`
                                                    )
                                                })
                                            ]
                                        })
                                    ],
                                    multiline: true
                                })
                            }),
                            swift.functionArgument({
                                label: "products",
                                value: swift.Expression.arrayLiteral({
                                    elements: [
                                        swift.Expression.contextualMethodCall({
                                            methodName: "library",
                                            arguments_: [
                                                swift.functionArgument({
                                                    label: "name",
                                                    value: swift.Expression.stringLiteral(
                                                        this.sdkGeneratorContext.libraryName
                                                    )
                                                }),
                                                swift.functionArgument({
                                                    label: "targets",
                                                    value: swift.Expression.arrayLiteral({
                                                        elements: [
                                                            swift.Expression.stringLiteral(
                                                                this.sdkGeneratorContext.sourceTargetName
                                                            )
                                                        ]
                                                    })
                                                })
                                            ],
                                            multiline: true
                                        })
                                    ],
                                    multiline: true
                                })
                            }),
                            swift.functionArgument({
                                label: "dependencies",
                                value: swift.Expression.arrayLiteral({
                                    elements: []
                                })
                            }),
                            swift.functionArgument({
                                label: "targets",
                                value: swift.Expression.arrayLiteral({
                                    elements: targetElements,
                                    multiline: true
                                })
                            })
                        ],
                        multiline: true
                    })
                })
            ]
        });
    }
}
