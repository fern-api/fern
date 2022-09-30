import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts, VariableDeclarationKind } from "ts-morph";

const RAW_TYPE_NAME = "Raw";

export function generateSchemaDeclarations({
    schemaFile,
    getReferenceToParsedShape,
    typeName,
    schema,
    generateRawTypeDeclaration,
    isObject = false,
}: {
    schemaFile: SdkFile;
    getReferenceToParsedShape: (file: SdkFile) => ts.TypeNode;
    typeName: string;
    schema: Zurg.Schema;
    generateRawTypeDeclaration: (module: ModuleDeclaration, rawTypeName: string) => void;
    isObject?: boolean;
}): void {
    const MODULE_NAME = typeName;

    const rawShape = getReferenceToRawSchema({ referenceToSchemaModule: ts.factory.createIdentifier(MODULE_NAME) });
    const parsedShape = getReferenceToParsedShape(schemaFile);
    const schemaType = isObject
        ? schemaFile.coreUtilities.zurg.ObjectSchema._getReferenceToType({ rawShape, parsedShape })
        : schemaFile.coreUtilities.zurg.Schema._getReferenceToType({
              rawShape,
              parsedShape,
          });

    schemaFile.sourceFile.addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeName,
                type: getTextOfTsNode(schemaType),
                initializer: getTextOfTsNode(schema.toExpression()),
            },
        ],
    });

    const module = schemaFile.sourceFile.addModule({
        name: MODULE_NAME,
        isExported: true,
        hasDeclareKeyword: true,
    });

    generateRawTypeDeclaration(module, RAW_TYPE_NAME);
}

function getReferenceToRawSchema({ referenceToSchemaModule }: { referenceToSchemaModule: ts.EntityName }): ts.TypeNode {
    return ts.factory.createTypeReferenceNode(ts.factory.createQualifiedName(referenceToSchemaModule, RAW_TYPE_NAME));
}

export function getSubImportPathToRawSchema(): string[] {
    return [RAW_TYPE_NAME];
}
