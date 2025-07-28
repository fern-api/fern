import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { SingleBaseUrlEnvironments } from "@fern-fern/ir-sdk/api";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        projectNamePascalCase: string;
        environments: SingleBaseUrlEnvironments;
    }
}

export class SingleUrlEnvironmentGenerator {
    private readonly projectNamePascalCase: string;
    private readonly environments: SingleBaseUrlEnvironments;

    public constructor({ projectNamePascalCase, environments }: SingleUrlEnvironmentGenerator.Args) {
        this.projectNamePascalCase = projectNamePascalCase;
        this.environments = environments;
    }

    public generate(): SwiftFile {
        const swiftEnum = swift.enumWithRawValues({
            name: this.getEnumName(),
            accessLevel: swift.AccessLevel.Public,
            conformances: ["String", swift.Protocol.CaseIterable],
            cases: this.environments.environments.map((e) => ({
                unsafeName: e.name.camelCase.unsafeName,
                rawValue: e.url
            }))
        });
        const fileContents = swiftEnum.toString();
        return new SwiftFile({
            filename: `${this.projectNamePascalCase}Environment.swift`,
            directory: RelativeFilePath.of(""),
            fileContents
        });
    }

    private getEnumName() {
        return `${this.projectNamePascalCase}Environment`;
    }
}
