import { IrVersions } from "../../ir-versions";
import { convertDeclaredTypeName } from "./convertDeclaredTypeName";

export function convertExampleTypeReference(
    example: IrVersions.V5.types.ExampleTypeReference
): IrVersions.V4.types.ExampleTypeReference {
    return {
        jsonExample: example.jsonExample,
        shape: convertExampleTypeReferenceShape(example.shape)
    };
}

function convertExampleTypeReferenceShape(
    example: IrVersions.V5.types.ExampleTypeReferenceShape
): IrVersions.V4.types.ExampleTypeReferenceShape {
    return IrVersions.V5.types.ExampleTypeReferenceShape._visit<IrVersions.V4.types.ExampleTypeReferenceShape>(
        example,
        {
            primitive: IrVersions.V4.types.ExampleTypeReferenceShape.primitive,
            container: (container) =>
                IrVersions.V4.types.ExampleTypeReferenceShape.container(convertExampleContainer(container)),
            unknown: IrVersions.V4.types.ExampleTypeReferenceShape.unknown,
            named: (named) => IrVersions.V4.types.ExampleTypeReferenceShape.named(convertExampleNamedType(named)),
            _unknown: () => {
                throw new Error("Unknown ExampleTypeReferenceShape: " + example.type);
            }
        }
    );
}

function convertExampleNamedType(example: IrVersions.V5.types.ExampleNamedType): IrVersions.V4.types.ExampleNamedType {
    return {
        typeName: convertDeclaredTypeName(example.typeName),
        shape: convertExampleTypeShape(example.shape)
    };
}

function convertExampleContainer(example: IrVersions.V5.types.ExampleContainer): IrVersions.V4.types.ExampleContainer {
    return IrVersions.V5.types.ExampleContainer._visit<IrVersions.V4.types.ExampleContainer>(example, {
        list: (items) =>
            IrVersions.V4.types.ExampleContainer.list(items.map((item) => convertExampleTypeReference(item))),
        set: (items) =>
            IrVersions.V4.types.ExampleContainer.set(items.map((item) => convertExampleTypeReference(item))),
        optional: (item) =>
            IrVersions.V4.types.ExampleContainer.optional(item != null ? convertExampleTypeReference(item) : undefined),
        map: (pairs) =>
            IrVersions.V4.types.ExampleContainer.map(
                pairs.map((pair) => ({
                    key: convertExampleTypeReference(pair.key),
                    value: convertExampleTypeReference(pair.value)
                }))
            ),
        _unknown: () => {
            throw new Error("Unknown ExampleContainer: " + example.type);
        }
    });
}

export function convertExampleTypeShape(
    example: IrVersions.V5.types.ExampleTypeShape
): IrVersions.V4.types.ExampleTypeShape {
    return IrVersions.V5.types.ExampleTypeShape._visit<IrVersions.V4.types.ExampleTypeShape>(example, {
        alias: (aliasExample) =>
            IrVersions.V4.types.ExampleTypeShape.alias({
                value: convertExampleTypeReference(aliasExample.value)
            }),
        object: (objectExample) =>
            IrVersions.V4.types.ExampleTypeShape.object({
                properties: objectExample.properties.map((property) => ({
                    wireKey: property.wireKey,
                    value: convertExampleTypeReference(property.value),
                    originalTypeDeclaration: convertDeclaredTypeName(property.originalTypeDeclaration)
                }))
            }),
        union: (unionExample) =>
            IrVersions.V4.types.ExampleTypeShape.union({
                wireDiscriminantValue: unionExample.wireDiscriminantValue,
                properties:
                    IrVersions.V5.types.ExampleSingleUnionTypeProperties._visit<IrVersions.V4.types.ExampleSingleUnionTypeProperties>(
                        unionExample.properties,
                        {
                            samePropertiesAsObject: (exampleNamedType) =>
                                IrVersions.V4.types.ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                                    typeName: convertDeclaredTypeName(exampleNamedType.typeName),
                                    shape: convertExampleTypeShape(exampleNamedType.shape)
                                }),
                            singleProperty: (property) =>
                                IrVersions.V4.types.ExampleSingleUnionTypeProperties.singleProperty({
                                    jsonExample: property.jsonExample,
                                    shape: convertExampleTypeReferenceShape(property.shape)
                                }),
                            noProperties: IrVersions.V4.types.ExampleSingleUnionTypeProperties.noProperties,
                            _unknown: () => {
                                throw new Error(
                                    "Unknown ExampleSingleUnionTypeProperties: " + unionExample.properties.type
                                );
                            }
                        }
                    )
            }),
        enum: (enumExample) =>
            IrVersions.V4.types.ExampleTypeShape.enum({
                wireValue: enumExample.wireValue
            }),
        _unknown: () => {
            throw new Error("Unknown ExampleTypeShape: " + example.type);
        }
    });
}
