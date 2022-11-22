import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ts, VariableDeclarationKind } from "ts-morph";

export declare namespace AbstractSchemaGenerator {
    export interface Init {
        typeName: string;
    }
}

export abstract class AbstractSchemaGenerator {
    public static RAW_TYPE_NAME = "Raw";

    protected typeName: string;

    constructor({ typeName }: AbstractSchemaGenerator.Init) {
        this.typeName = typeName;
    }

    public writeSchemaToFile(file: SdkFile): void {
        file.sourceFile.addVariableStatement({
            isExported: true,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: this.getSchemaVariableName(),
                    type: getTextOfTsNode(this.getReferenceToSchemaType(file)),
                    initializer: getTextOfTsNode(this.getSchema(file).toExpression()),
                },
            ],
        });

        this.generateModule(file);
    }

    private getSchemaVariableName() {
        return this.typeName;
    }

    public static getReferenceToRawSchema({
        referenceToSchemaModule,
    }: {
        referenceToSchemaModule: ts.EntityName;
    }): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(referenceToSchemaModule, AbstractSchemaGenerator.RAW_TYPE_NAME)
        );
    }

    protected getReferenceToSchemaType(file: SdkFile): ts.TypeNode {
        return file.coreUtilities.zurg.Schema._getReferenceToType({
            rawShape: this.getReferenceToRawShape(file),
            parsedShape: this.getReferenceToParsedShape(file),
        });
    }

    protected abstract getReferenceToRawShape(file: SdkFile): ts.TypeNode;
    protected abstract getReferenceToParsedShape(file: SdkFile): ts.TypeNode;
    protected abstract generateModule(file: SdkFile): void;
    protected abstract getSchema(file: SdkFile): Zurg.Schema;
}
