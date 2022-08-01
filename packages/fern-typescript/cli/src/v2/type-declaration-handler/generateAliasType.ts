import { AliasTypeDeclaration, PrimitiveType } from "@fern-fern/ir-model";
import { addBrandedTypeAlias, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { ts, VariableDeclarationKind, Writers } from "ts-morph";
import { File } from "../client/types";

export const ALIAS_UTILS_OF_KEY = "of";

export function generateAliasType({
    file,
    typeName,
    docs,
    shape,
}: {
    file: File;
    typeName: string;
    docs: string | null | undefined;
    shape: AliasTypeDeclaration;
}): void {
    if (shouldUseBrandedTypeForAlias(shape)) {
        generateStringAlias({ file, typeName, docs });
    } else {
        const typeAlias = file.sourceFile.addTypeAlias({
            name: typeName,
            type: getTextOfTsNode(file.getReferenceToType(shape.aliasOf)),
            isExported: true,
        });
        maybeAddDocs(typeAlias, docs);
    }
}

export function shouldUseBrandedTypeForAlias(shape: AliasTypeDeclaration): boolean {
    return shape.aliasOf._type === "primitive" && shape.aliasOf.primitive === PrimitiveType.String;
}

function generateStringAlias({
    file,
    typeName,
    docs,
}: {
    file: File;
    typeName: string;
    docs: string | null | undefined;
}) {
    addBrandedTypeAlias({ node: file.sourceFile, typeName, docs });

    file.sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeName,
                initializer: Writers.object({
                    [ALIAS_UTILS_OF_KEY]: getTextOfTsNode(getOf(typeName)),
                }),
            },
        ],
        isExported: true,
    });
}

function getOf(typeName: string): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";

    return ts.factory.createArrowFunction(
        undefined,
        undefined,
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                VALUE_PARAMETER_NAME,
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            ),
        ],
        ts.factory.createTypeReferenceNode(typeName),
        undefined,
        ts.factory.createAsExpression(
            ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
            ts.factory.createTypeReferenceNode(typeName)
        )
    );
}
