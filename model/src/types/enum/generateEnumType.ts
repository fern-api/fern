import { EnumTypeDefinition } from "@fern-api/api";
import {
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    visitorUtils,
} from "@fern-typescript/commons";
import { lowerFirst } from "lodash";
import { SourceFile, ts, VariableDeclarationKind, WriterFunction } from "ts-morph";
import { getKeyForEnum } from "./utils";

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
                node: ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value.value)),
                docs: value.docs,
            }))
        ),
        isExported: true,
    });
    maybeAddDocs(typeAlias, docs);

    const visitorItems: visitorUtils.VisitableItem[] = shape.values.map((value) => ({
        caseInSwitchStatement: ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(typeName),
            ts.factory.createIdentifier(getKeyForEnum(value))
        ),
        keyInVisitor: lowerFirst(getKeyForEnum(value)),
        visitorArgument: undefined,
    }));

    file.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeName,
                initializer: createUtils({ shape, typeName, visitorItems }),
            },
        ],
        isExported: true,
    });

    const moduleDeclaration = file.addModule({
        name: typeName,
        isExported: true,
        hasDeclareKeyword: true,
    });
    moduleDeclaration.addInterface(visitorUtils.generateVisitorInterface(visitorItems));
}

function createUtils({
    shape,
    typeName,
    visitorItems,
}: {
    shape: EnumTypeDefinition;
    typeName: string;
    visitorItems: readonly visitorUtils.VisitableItem[];
}): WriterFunction {
    const writer = FernWriters.object.writer();

    for (const value of shape.values) {
        writer.addProperty({
            key: getKeyForEnum(value),
            value: getTextOfTsNode(ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value.value))),
        });
    }

    writer.addNewLine();
    writer.addProperty({
        key: visitorUtils.VISIT_PROPERTY_NAME,
        value: getTextOfTsNode(
            visitorUtils.generateVisitMethod({
                typeName,
                switchOn: ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                items: visitorItems,
            })
        ),
    });

    return writer.toFunction();
}
