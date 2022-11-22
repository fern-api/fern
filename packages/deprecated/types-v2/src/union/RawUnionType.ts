import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { ParsedSingleUnionType } from "./parsed-single-union-type/ParsedSingleUnionType";

export declare namespace RawUnionType {
    export interface Init {
        parsedSingleUnionTypes: ParsedSingleUnionType[];
    }
}

export class RawUnionType {
    private parsedSingleUnionTypes: ParsedSingleUnionType[];

    constructor(init: RawUnionType.Init) {
        this.parsedSingleUnionTypes = init.parsedSingleUnionTypes;
    }

    public writeToModule({
        file,
        module,
        rawTypeName,
    }: {
        file: SdkFile;
        module: ModuleDeclaration;
        rawTypeName: string;
    }): void {
        module.addTypeAlias({
            name: rawTypeName,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    this.parsedSingleUnionTypes.map((singleUnionType) =>
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(module.getName()),
                                ts.factory.createIdentifier(singleUnionType.getInterfaceName())
                            )
                        )
                    )
                )
            ),
        });

        for (const singleUnionType of this.parsedSingleUnionTypes) {
            const interfaceDeclaration = singleUnionType.getRawInterfaceDeclaration(file);
            module.addInterface({
                name: interfaceDeclaration.name,
                properties: interfaceDeclaration.jsonProperties,
                extends: interfaceDeclaration.extends.map(getTextOfTsNode),
            });
        }
    }
}
