import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { HttpService, Package, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";

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

    public constructor({ projectNamePascalCase, package_, context }: RootClientGenerator.Args) {
        this.projectNamePascalCase = projectNamePascalCase;
        this.package_ = package_;
        this.context = context;
    }

    public generate(): SwiftFile {
        const swiftClass = swift.class_({
            name: `${this.projectNamePascalCase}Client`,
            final: true,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: []
        });
        const fileContents = swiftClass.toString();
        return new SwiftFile({
            filename: "Client.swift", // TODO: Make dynamic
            directory: RelativeFilePath.of(""),
            fileContents
        });
    }

    private getSubpackages(): Subpackage[] {
        return this.package_.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
