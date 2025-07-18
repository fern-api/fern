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
            name: `${this.projectNamePascalCase}Client`,
            final: true,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: this.generateProperties()
        });
        const fileContents = swiftClass.toString();
        return new SwiftFile({
            filename: "Client.swift",
            directory: RelativeFilePath.of(""),
            fileContents
        });
    }

    private generateProperties(): swift.Property[] {
        const subpackages = this.getSubpackages();
        return [
            ...subpackages.map((subpackage) => {
                const clientName = `${subpackage.name.pascalCase.unsafeName}Client`;
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

    private getSubpackages(): Subpackage[] {
        return this.package_.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
