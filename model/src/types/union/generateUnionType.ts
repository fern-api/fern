import { SingleUnionType, TypeDefinition, UnionTypeDefinition } from "@fern-api/api";
import {
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
} from "@fern-api/typescript-commons";
import {
    Directory,
    InterfaceDeclaration,
    InterfaceDeclarationStructure,
    OptionalKind,
    SourceFile,
    ts,
    VariableDeclarationKind,
    WriterFunction,
} from "ts-morph";
import { TypeResolver } from "../../utils/TypeResolver";
import { VISIT_PROPERTY_NAME } from "../constants";
import { getBaseTypeForSingleUnionType, getKeyForUnion, visitResolvedTypeReference } from "./utils";
import { generateVisitMethod, generateVisitorInterface } from "./visitorUtils";

export function generateUnionType({
    file,
    typeDefinition,
    shape,
    typeResolver,
    modelDirectory,
}: {
    file: SourceFile;
    typeDefinition: TypeDefinition;
    shape: UnionTypeDefinition;
    typeResolver: TypeResolver;
    modelDirectory: Directory;
}): void {
    const typeAlias = file.addTypeAlias({
        name: typeDefinition.name.name,
        type: getWriterForMultiLineUnionType(
            shape.types.map((type) => ({
                node: ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(typeDefinition.name.name),
                        ts.factory.createIdentifier(getKeyForUnion(type))
                    ),
                    undefined
                ),
                docs: type.docs,
            }))
        ),
        isExported: true,
    });
    maybeAddDocs(typeAlias, typeDefinition.docs);

    const module = file.addModule({
        name: typeDefinition.name.name,
        isExported: true,
        hasDeclareKeyword: true,
    });

    for (const singleUnionType of shape.types) {
        const interfaceNode = module.addInterface(
            generateDiscriminatedSingleUnionTypeInterface({ shape, singleUnionType })
        );

        const baseType = getBaseTypeForSingleUnionType({
            singleUnionType,
            typeResolver,
            file,
            modelDirectory,
        });
        if (baseType != null) {
            visitResolvedTypeReference(singleUnionType.valueType, typeResolver, {
                namedObject: () => {
                    interfaceNode.addExtends(getTextOfTsNode(baseType));
                },
                nonObject: () => {
                    addNonExtendableProperty(interfaceNode, singleUnionType, baseType);
                },
                void: () => {
                    /* noop */
                },
            });
        }
    }

    module.addInterface(generateVisitorInterface({ shape, typeResolver, file, modelDirectory }));

    file.addVariableStatement({
        declarations: [
            {
                name: typeDefinition.name.name,
                initializer: createUtils({
                    typeDefinition,
                    shape,
                    typeResolver,
                    file,
                    modelDirectory,
                }),
            },
        ],
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
    });
}

function generateDiscriminatedSingleUnionTypeInterface({
    shape,
    singleUnionType,
}: {
    shape: UnionTypeDefinition;
    singleUnionType: SingleUnionType;
}): OptionalKind<InterfaceDeclarationStructure> {
    return {
        name: getKeyForUnion(singleUnionType),
        properties: [
            {
                name: shape.discriminant,
                type: getTextOfTsNode(ts.factory.createStringLiteral(singleUnionType.discriminantValue)),
            },
        ],
    };
}

function addNonExtendableProperty(
    interfaceNode: InterfaceDeclaration,
    singleUnionType: SingleUnionType,
    baseType: ts.Node
) {
    interfaceNode.addProperty({
        name: singleUnionType.discriminantValue,
        type: getTextOfTsNode(baseType),
    });
}

function createUtils({
    typeDefinition,
    shape,
    typeResolver,
    file,
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    shape: UnionTypeDefinition;
    typeResolver: TypeResolver;
    file: SourceFile;
    modelDirectory: Directory;
}): WriterFunction {
    const writer = FernWriters.object.writer();

    for (const type of shape.types) {
        writer.addProperty({
            key: type.discriminantValue,
            value: getTextOfTsNode(
                generateCreator({ typeDefinition, shape, type, typeResolver, file, modelDirectory })
            ),
        });
        writer.addNewLine();
    }

    writer.addProperty({
        key: VISIT_PROPERTY_NAME,
        value: getTextOfTsNode(generateVisitMethod({ typeDefinition, shape, typeResolver })),
    });

    return writer.toFunction();
}

function generateCreator({
    typeDefinition,
    shape,
    type,
    typeResolver,
    file,
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    shape: UnionTypeDefinition;
    type: SingleUnionType;
    typeResolver: TypeResolver;
    file: SourceFile;
    modelDirectory: Directory;
}): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";

    const parameterType = getBaseTypeForSingleUnionType({
        singleUnionType: type,
        typeResolver,
        file,
        modelDirectory,
    });
    const parameter =
        parameterType != null
            ? ts.factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  undefined,
                  VALUE_PARAMETER_NAME,
                  undefined,
                  parameterType,
                  undefined
              )
            : undefined;

    const objectProperties: ts.ObjectLiteralElementLike[] = visitResolvedTypeReference<ts.ObjectLiteralElementLike[]>(
        type.valueType,
        typeResolver,
        {
            namedObject: () => [
                ts.factory.createSpreadAssignment(ts.factory.createIdentifier(VALUE_PARAMETER_NAME)),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(shape.discriminant),
                    ts.factory.createStringLiteral(type.discriminantValue)
                ),
            ],
            nonObject: () => [
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(shape.discriminant),
                    ts.factory.createStringLiteral(type.discriminantValue)
                ),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(type.discriminantValue),
                    ts.factory.createIdentifier(VALUE_PARAMETER_NAME)
                ),
            ],
            void: () => [
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(shape.discriminant),
                    ts.factory.createStringLiteral(type.discriminantValue)
                ),
            ],
        }
    );

    return ts.factory.createArrowFunction(
        undefined,
        undefined,
        parameter != null ? [parameter] : [],
        getQualifiedUnionTypeReference(typeDefinition, type),
        undefined,
        ts.factory.createParenthesizedExpression(ts.factory.createObjectLiteralExpression(objectProperties, true))
    );
}

function getQualifiedUnionTypeReference(typeDefinition: TypeDefinition, singleUnionType: SingleUnionType) {
    return ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createIdentifier(typeDefinition.name.name),
            ts.factory.createIdentifier(getKeyForUnion(singleUnionType))
        ),
        undefined
    );
}
