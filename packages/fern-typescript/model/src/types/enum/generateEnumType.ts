import { EnumTypeDefinition } from "@fern-api/api";
import {
    addBrandedTypeAlias,
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
} from "@fern-api/typescript-commons";
import { SourceFile, ts, VariableDeclarationKind, WriterFunction } from "ts-morph";
import { getKeyForEnum } from "./utils";
import { generateVisitMethod, generateVisitorInterface } from "./visitorUtils";

export function generateEnumType({
    file,
    typeName,
    docs,
    shape,
}: {
    file: SourceFile;
    typeName: string;
    docs: string | null | undefined;
    shape: EnumTypeDefinition;
}): void {
    const typeAlias = file.addTypeAlias({
        name: typeName,
        type: getWriterForMultiLineUnionType(
            shape.values.map((value) => ({
                node: ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(typeName),
                        ts.factory.createIdentifier(getKeyForEnum(value))
                    )
                ),
                docs: value.docs,
            }))
        ),
        isExported: true,
    });
    maybeAddDocs(typeAlias, docs);

    file.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeName,
                initializer: createUtils({ shape, typeName }),
            },
        ],
        isExported: true,
    });

    const moduleDeclaration = file.addModule({
        name: typeName,
        isExported: true,
        hasDeclareKeyword: true,
    });
    for (const value of shape.values) {
        addBrandedTypeAlias({
            node: moduleDeclaration,
            typeName: getKeyForEnum(value),
            docs: undefined,
            baseType: ts.factory.createStringLiteral(value.value),
        });
    }
    moduleDeclaration.addInterface(generateVisitorInterface({ shape }));
}

function createUtils({ shape, typeName }: { shape: EnumTypeDefinition; typeName: string }): WriterFunction {
    const writer = FernWriters.object.writer();

    for (const value of shape.values) {
        writer.addProperty({
            key: getKeyForEnum(value),
            value: getTextOfTsNode(
                ts.factory.createAsExpression(
                    ts.factory.createStringLiteral(value.value),
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(
                            ts.factory.createIdentifier(typeName),
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
        value: getTextOfTsNode(generateVisitMethod({ typeName, shape })),
    });

    return writer.toFunction();
}
