import { AliasTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractSchemaGenerator } from "../AbstractSchemaGenerator";
import { AbstractTypeSchemaGenerator } from "../AbstractTypeSchemaGenerator";

export declare namespace AliasTypeGenerator {
    export interface Init {
        typeDeclaration: TypeDeclaration;
        shape: AliasTypeDeclaration;
        typeName: string;
    }
}

export class AliasTypeGenerator extends AbstractTypeSchemaGenerator {
    private typeDeclaration: TypeDeclaration;
    private shape: AliasTypeDeclaration;

    constructor({ typeDeclaration, shape, typeName }: AliasTypeGenerator.Init) {
        super({ typeName });
        this.typeDeclaration = typeDeclaration;
        this.shape = shape;
    }

    public generate({ typeFile, schemaFile }: { typeFile: SdkFile; schemaFile: SdkFile }): void {
        const typeAlias = typeFile.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getTextOfTsNode(typeFile.getReferenceToType(this.shape.aliasOf).typeNode),
            isExported: true,
        });
        maybeAddDocs(typeAlias, this.typeDeclaration.docs);

        this.writeSchemaToFile(schemaFile);
    }

    protected override getReferenceToParsedShape(file: SdkFile): ts.TypeNode {
        return file.getReferenceToNamedType(this.typeDeclaration.name).typeNode;
    }

    protected override generateRawTypeDeclaration(file: SdkFile, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractSchemaGenerator.RAW_TYPE_NAME,
            type: getTextOfTsNode(file.getReferenceToRawType(this.shape.aliasOf).typeNode),
        });
    }
    protected override getSchema(file: SdkFile): Zurg.Schema {
        return file.getSchemaOfTypeReference(this.shape.aliasOf);
    }
}
