import { EnumTypeDefinition, TypeDefinition } from "@fern/ir-generation";
import { EnumValue } from "@fern/ir-generation/src/types/EnumValue";
import { SourceFile, ts, VariableDeclarationKind, WriterFunctionOrValue, Writers } from "ts-morph";
import { getTextOfTsNode } from "../../utils/getTextOfTsNode";
import { getWriterForMultiLineUnionType } from "../../utils/getWriterForMultiLineUnionType";
import { maybeAddDocs } from "../../utils/maybeAddDocs";
import { addEnumVisitorToNamespace, generateEnumVisit } from "./generateEnumVisit";
import { getKeyForEnum } from "./utils";

export function generateEnumType({
    file,
    typeDefinition,
    shape,
}: {
    file: SourceFile;
    typeDefinition: TypeDefinition;
    shape: EnumTypeDefinition;
}): void {
    const typeAlias = file.addTypeAlias({
        name: typeDefinition.name.name,
        type: getWriterForMultiLineUnionType(
            shape.values.map((value) => ({
                node: convertEnumValueToStringLiteral(value),
                docs: value.docs,
            }))
        ),
        isExported: true,
    });
    maybeAddDocs(typeAlias, typeDefinition.docs);

    file.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeDefinition.name.name,
                initializer: Writers.object(createUtils(typeDefinition, shape)),
            },
        ],
        isExported: true,
    });

    const moduleDeclaration = file.addModule({
        name: typeDefinition.name.name,
        isExported: true,
        hasDeclareKeyword: true,
    });
    addEnumVisitorToNamespace(moduleDeclaration, shape);
}

function convertEnumValueToStringLiteral(value: EnumValue): ts.StringLiteral {
    return ts.factory.createStringLiteral(value.value);
}

function createUtils(typeDefinition: TypeDefinition, shape: EnumTypeDefinition): Record<string, WriterFunctionOrValue> {
    const obj: Record<string, WriterFunctionOrValue> = {};

    for (const value of shape.values) {
        obj[getKeyForEnum(value)] = getTextOfTsNode(
            ts.factory.createAsExpression(
                ts.factory.createStringLiteral(value.value),
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("const"))
            )
        );
    }

    obj.visit = getTextOfTsNode(generateEnumVisit(typeDefinition, shape));

    return obj;
}
