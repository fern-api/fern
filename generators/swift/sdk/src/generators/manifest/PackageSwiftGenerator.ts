import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

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
        return new SwiftFile({
            filename: "Package.swift",
            directory: RelativeFilePath.of(""),
            fileContents: [
                swift.comment({ content: "swift-tools-version: 5.7" }),
                swift.LineBreak.single(),
                swift.Statement.import("PackageDescription"),
                swift.LineBreak.single(),
                swift.Statement.constantDeclaration(
                    "package",
                    swift.Expression.classInitialization({
                        unsafeName: "Package",
                        arguments_: [
                            swift.functionArgument({
                                label: "name",
                                value: swift.Expression.rawStringValue(this.sdkGeneratorContext.packageName)
                            }),
                            swift.functionArgument({
                                label: "platforms",
                                value: swift.Expression.arrayLiteral({
                                    elements: [
                                        swift.Expression.contextualMethodCall({
                                            methodName: "iOS",
                                            arguments_: [
                                                swift.functionArgument({
                                                    value: swift.Expression.enumCaseShorthand("v15")
                                                })
                                            ]
                                        }),
                                        swift.Expression.contextualMethodCall({
                                            methodName: "macOS",
                                            arguments_: [
                                                swift.functionArgument({
                                                    value: swift.Expression.enumCaseShorthand("v12")
                                                })
                                            ]
                                        }),
                                        swift.Expression.contextualMethodCall({
                                            methodName: "tvOS",
                                            arguments_: [
                                                swift.functionArgument({
                                                    value: swift.Expression.enumCaseShorthand("v15")
                                                })
                                            ]
                                        }),
                                        swift.Expression.contextualMethodCall({
                                            methodName: "watchOS",
                                            arguments_: [
                                                swift.functionArgument({
                                                    value: swift.Expression.enumCaseShorthand("v8")
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
                                                    value: swift.Expression.rawStringValue(
                                                        this.sdkGeneratorContext.libraryName
                                                    )
                                                }),
                                                swift.functionArgument({
                                                    label: "targets",
                                                    value: swift.Expression.arrayLiteral({
                                                        elements: [
                                                            swift.Expression.rawStringValue(
                                                                this.sdkGeneratorContext.targetName
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
                                    elements: [
                                        swift.Expression.contextualMethodCall({
                                            methodName: "target",
                                            arguments_: [
                                                swift.functionArgument({
                                                    label: "name",
                                                    value: swift.Expression.rawStringValue(
                                                        this.sdkGeneratorContext.targetName
                                                    )
                                                }),
                                                swift.functionArgument({
                                                    label: "path",
                                                    value: swift.Expression.rawStringValue("Sources")
                                                })
                                            ],
                                            multiline: true
                                        })
                                    ],
                                    multiline: true
                                })
                            })
                        ],
                        multiline: true
                    })
                )
            ]
        });
    }
}
