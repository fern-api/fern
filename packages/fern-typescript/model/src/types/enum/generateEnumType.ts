import { EnumTypeDefinition, FernFilepath, TypeDefinition } from "@fern-api/api";
import {
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
} from "@fern-api/typescript-commons";
import path from "path";
import { SourceFile, ts, VariableDeclarationKind, WriterFunction } from "ts-morph";
import { addBrandedTypeAlias } from "../../utils/addBrandedTypeAlias";
import { getKeyForEnum } from "./utils";
import { generateVisitMethod, generateVisitorInterface } from "./visitorUtils";

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
                node: ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(typeDefinition.name.name),
                        ts.factory.createIdentifier(getKeyForEnum(value))
                    )
                ),
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
                initializer: createUtils(typeDefinition, shape),
            },
        ],
        isExported: true,
    });

    const moduleDeclaration = file.addModule({
        name: typeDefinition.name.name,
        isExported: true,
        hasDeclareKeyword: true,
    });
    for (const value of shape.values) {
        addBrandedTypeAlias({
            node: moduleDeclaration,
            typeName: {
                name: getKeyForEnum(value),
                fernFilepath: FernFilepath.of(path.join(typeDefinition.name.fernFilepath, typeDefinition.name.name)),
            },
            docs: undefined,
            baseType: ts.factory.createStringLiteral(value.value),
        });
    }
    moduleDeclaration.addInterface(generateVisitorInterface({ shape }));
}

function createUtils(typeDefinition: TypeDefinition, shape: EnumTypeDefinition): WriterFunction {
    const writer = FernWriters.object.writer();

    for (const value of shape.values) {
        writer.addProperty({
            key: getKeyForEnum(value),
            value: getTextOfTsNode(
                ts.factory.createAsExpression(
                    ts.factory.createStringLiteral(value.value),
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(
                            ts.factory.createIdentifier(typeDefinition.name.name),
                            ts.factory.createIdentifier(getKeyForEnum(value))
                        )
                    )
                )
            ),
        });
    }

    writer.addNewLine();
    writer.addProperty({
        key: "visit",
        value: getTextOfTsNode(generateVisitMethod({ typeDefinition, shape })),
    });

    return writer.toFunction();
}
