import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace PackageSwiftGenerator {
    interface Args {
        projectNamePascalCase: string;
        context: SdkGeneratorContext;
    }
}

export class PackageSwiftGenerator {
    private readonly projectNamePascalCase: string;
    private readonly context: SdkGeneratorContext;

    public constructor({ projectNamePascalCase, context }: PackageSwiftGenerator.Args) {
        this.projectNamePascalCase = projectNamePascalCase;
        this.context = context;
    }

    public generate(): SwiftFile {
        const statements: swift.Statement[] = [
            swift.Statement.import("PackageDescription"),
            swift.Statement.constantDeclaration(
                "package",
                swift.Expression.classInitialization({
                    unsafeName: "Package",
                    arguments_: [
                        swift.functionArgument({
                            label: "name",
                            value: swift.Expression.rawStringValue(this.projectNamePascalCase)
                        })
                    ],
                    multiline: true
                })
            )
        ];
        const fileContents = statements.map((statement) => statement.toString()).join("\n");
        return new SwiftFile({
            filename: `Package.swift`,
            directory: RelativeFilePath.of(""),
            fileContents
        });
    }
}
