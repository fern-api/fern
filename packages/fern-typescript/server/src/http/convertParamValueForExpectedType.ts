import { ContainerType, PrimitiveType, Type, TypeReference } from "@fern-fern/ir-model";
import { ModelContext } from "@fern-typescript/model-context";
import { ALIAS_UTILS_OF_KEY, shouldUseBrandedTypeForAlias } from "@fern-typescript/types";
import { SourceFile, ts } from "ts-morph";

export function convertParamValueForExpectedType({
    valueReference,
    isValueReferenceTypedAsString,
    expectedType,
    modelContext,
    file,
}: {
    valueReference: ts.Expression;
    isValueReferenceTypedAsString: boolean;
    expectedType: TypeReference;
    modelContext: ModelContext;
    file: SourceFile;
}): ts.Expression {
    function handleInvalidParamType(): never {
        throw new Error("Invalid type for parameter: " + JSON.stringify(expectedType));
    }

    function maybeCastAsString(): ts.Expression {
        if (isValueReferenceTypedAsString) {
            return valueReference;
        } else {
            return ts.factory.createAsExpression(
                valueReference,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            );
        }
    }

    return TypeReference._visit(expectedType, {
        primitive: (primitive) =>
            PrimitiveType._visit(primitive, {
                string: maybeCastAsString,
                uuid: maybeCastAsString,
                double: () => convertToNumber(valueReference),
                integer: () => convertToNumber(valueReference),
                long: () => convertToNumber(valueReference),
                boolean: () =>
                    ts.factory.createBinaryExpression(
                        valueReference,
                        ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                        ts.factory.createStringLiteral("true")
                    ),
                dateTime: maybeCastAsString,
                _unknown: handleInvalidParamType,
            }),
        container: (container) =>
            ContainerType._visit(container, {
                optional: (wrappedType) =>
                    ts.factory.createConditionalExpression(
                        ts.factory.createBinaryExpression(
                            valueReference,
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                            ts.factory.createNull()
                        ),
                        undefined,
                        convertParamValueForExpectedType({
                            valueReference,
                            expectedType: wrappedType,
                            modelContext,
                            file,
                            isValueReferenceTypedAsString,
                        }),
                        undefined,
                        ts.factory.createIdentifier("undefined")
                    ),
                map: handleInvalidParamType,
                list: handleInvalidParamType,
                set: handleInvalidParamType,
                _unknown: handleInvalidParamType,
            }),
        named: (typeName) => {
            const typeDeclaration = modelContext.getTypeDeclarationFromName(typeName);
            return Type._visit(typeDeclaration, {
                alias: (aliasTypeDeclaration) => {
                    const valueForAliasedType = convertParamValueForExpectedType({
                        valueReference,
                        expectedType: aliasTypeDeclaration.aliasOf,
                        modelContext,
                        file,
                        isValueReferenceTypedAsString,
                    });
                    if (shouldUseBrandedTypeForAlias(aliasTypeDeclaration)) {
                        return ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                modelContext.getReferenceToTypeUtils({
                                    typeName,
                                    referencedIn: file,
                                }),
                                ts.factory.createIdentifier(ALIAS_UTILS_OF_KEY)
                            ),
                            undefined,
                            [valueForAliasedType]
                        );
                    } else {
                        return valueForAliasedType;
                    }
                },
                enum: () =>
                    ts.factory.createAsExpression(
                        valueReference,
                        modelContext.getReferenceToType({ reference: expectedType, referencedIn: file })
                    ),
                object: handleInvalidParamType,
                union: handleInvalidParamType,
                _unknown: handleInvalidParamType,
            });
        },
        unknown: () => valueReference,
        void: handleInvalidParamType,
        _unknown: handleInvalidParamType,
    });
}

function convertToNumber(valueReference: ts.Expression): ts.Expression {
    return ts.factory.createCallExpression(ts.factory.createIdentifier("Number"), undefined, [valueReference]);
}
