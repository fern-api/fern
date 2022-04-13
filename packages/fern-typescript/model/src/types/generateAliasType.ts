import { AliasTypeDefinition, PrimitiveType, TypeDefinition, TypeReference } from "@fern/ir-generation";
import { SourceFile, ts, VariableDeclarationKind, Writers } from "ts-morph";
import { generateTypeReference } from "../utils/generateTypeReference";
import { getTextOfTsKeyword } from "../utils/getTextOfTsKeyword";
import { getTextOfTsNode } from "../utils/getTextOfTsNode";
import { maybeAddDocs } from "../utils/maybeAddDocs";

export function generateAliasType({
    file,
    typeDefinition,
    shape,
}: {
    file: SourceFile;
    typeDefinition: TypeDefinition;
    shape: AliasTypeDefinition;
}): void {
    if (TypeReference.isPrimitive(shape.aliasOf) && shape.aliasOf.primitive === PrimitiveType.String) {
        generateStringAlias(file, typeDefinition);
    } else {
        const typeAlias = file.addTypeAlias({
            name: typeDefinition.name.name,
            type: getTextOfTsNode(generateTypeReference(shape.aliasOf, file)),
            isExported: true,
        });
        maybeAddDocs(typeAlias, typeDefinition.docs);
    }
}

function generateStringAlias(file: SourceFile, typeDefinition: TypeDefinition) {
    const typeAlias = file.addTypeAlias({
        name: typeDefinition.name.name,
        isExported: true,
        type: Writers.intersectionType(
            getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            Writers.object({
                [`__${typeDefinition.name.name}`]: getTextOfTsKeyword(ts.SyntaxKind.VoidKeyword),
            })
        ),
    });
    maybeAddDocs(typeAlias, typeDefinition.docs);

    file.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeDefinition.name.name,
                initializer: Writers.object({
                    of: getTextOfTsNode(getOf(typeDefinition.name.name)),
                }),
            },
        ],
        isExported: true,
    });
}

function getOf(idTypeName: string): ts.ArrowFunction {
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
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
            ),
        ],
        undefined,
        undefined,
        ts.factory.createAsExpression(
            ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
            ts.factory.createTypeReferenceNode(idTypeName)
        )
    );
}
