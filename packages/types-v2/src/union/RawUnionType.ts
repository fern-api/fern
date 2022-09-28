import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractUnionFileDeclaration } from "./AbstractUnionFileDeclaration";

export declare namespace RawUnionType {
    export interface Init extends AbstractUnionFileDeclaration.Init {
        file: SdkFile;
        module: ModuleDeclaration;
        rawTypeName: string;
    }
}

export class RawUnionType extends AbstractUnionFileDeclaration {
    private file: SdkFile;
    private module: ModuleDeclaration;
    private rawTypeName: string;

    constructor({ file, module, rawTypeName, ...superInit }: RawUnionType.Init) {
        super(superInit);
        this.file = file;
        this.module = module;
        this.rawTypeName = rawTypeName;
    }

    public writeToModule(): void {
        this.module.addTypeAlias({
            name: this.rawTypeName,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    this.parsedSingleUnionTypes.map((singleUnionType) =>
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(this.module.getName()),
                                ts.factory.createIdentifier(singleUnionType.getInterfaceName())
                            )
                        )
                    )
                )
            ),
        });

        for (const singleUnionType of this.parsedSingleUnionTypes) {
            const interfaceDeclaration = singleUnionType.getRawInterfaceDeclaration(this.file);
            this.module.addInterface({
                name: interfaceDeclaration.name,
                properties: interfaceDeclaration.jsonProperties,
                extends: interfaceDeclaration.extends.map(getTextOfTsNode),
            });
        }
    }
}
