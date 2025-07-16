import { IrVersions } from "../../ir-versions";
import { convertContainerType } from "./convertContainerType";
import { convertDeclaredTypeName } from "./convertDeclaredTypeName";
import { convertExampleTypeShape } from "./convertExampleTypeReference";
import { convertNameAndWireValueToV1, convertNameAndWireValueToV2 } from "./convertName";
import { convertTypeReference } from "./convertTypeReference";

export function convertTypeDeclaration(
    typeDeclaration: IrVersions.V5.types.TypeDeclaration
): IrVersions.V4.types.TypeDeclaration {
    return {
        docs: typeDeclaration.docs,
        availability: typeDeclaration.availability,
        name: convertDeclaredTypeName(typeDeclaration.name),
        shape: convertTypeShape(typeDeclaration.shape),
        examples: typeDeclaration.examples.map((example) => convertExampleType(example)),
        referencedTypes: typeDeclaration.referencedTypes.map((typeName) => convertDeclaredTypeName(typeName))
    };
}

function convertTypeShape(shape: IrVersions.V5.types.Type): IrVersions.V4.types.Type {
    return IrVersions.V5.types.Type._visit<IrVersions.V4.types.Type>(shape, {
        alias: ({ aliasOf, resolvedType }) =>
            IrVersions.V4.types.Type.alias({
                aliasOf: convertTypeReference(aliasOf),
                resolvedType: convertResolvedTypeReference(resolvedType)
            }),
        enum: (enumDeclaration) =>
            IrVersions.V4.types.Type.enum({
                values: enumDeclaration.values.map((enumValue) => ({
                    docs: enumValue.docs,
                    availability: enumValue.availability,
                    name: convertNameAndWireValueToV1(enumValue.name),
                    nameV2: convertNameAndWireValueToV2(enumValue.name),
                    value: enumValue.name.wireValue
                }))
            }),
        object: (objectDeclaration) =>
            IrVersions.V4.types.Type.object({
                extends: objectDeclaration.extends.map((extension) => convertDeclaredTypeName(extension)),
                properties: objectDeclaration.properties.map((property) => ({
                    docs: property.docs,
                    availability: property.availability,
                    name: convertNameAndWireValueToV1(property.name),
                    nameV2: convertNameAndWireValueToV2(property.name),
                    valueType: convertTypeReference(property.valueType)
                }))
            }),
        union: (unionDeclaration) =>
            IrVersions.V4.types.Type.union({
                discriminant: unionDeclaration.discriminant.wireValue,
                discriminantV2: convertNameAndWireValueToV1(unionDeclaration.discriminant),
                discriminantV3: convertNameAndWireValueToV2(unionDeclaration.discriminant),
                types: unionDeclaration.types.map((singleUnionType) => ({
                    docs: singleUnionType.docs,
                    discriminantValue: convertNameAndWireValueToV1(singleUnionType.discriminantValue),
                    discriminantValueV2: convertNameAndWireValueToV2(singleUnionType.discriminantValue),
                    valueType: IrVersions.V5.types.SingleUnionTypeProperties._visit<IrVersions.V4.types.TypeReference>(
                        singleUnionType.shape,
                        {
                            samePropertiesAsObject: (typeName) =>
                                IrVersions.V4.types.TypeReference.named(convertDeclaredTypeName(typeName)),
                            singleProperty: (property) => convertTypeReference(property.type),
                            noProperties: IrVersions.V4.types.TypeReference.void,
                            _unknown: () => {
                                throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape._type);
                            }
                        }
                    ),
                    shape: IrVersions.V5.types.SingleUnionTypeProperties._visit<IrVersions.V4.types.SingleUnionTypeProperties>(
                        singleUnionType.shape,
                        {
                            samePropertiesAsObject: (typeName) =>
                                IrVersions.V4.types.SingleUnionTypeProperties.samePropertiesAsObject(
                                    convertDeclaredTypeName(typeName)
                                ),
                            singleProperty: (property) =>
                                IrVersions.V4.types.SingleUnionTypeProperties.singleProperty({
                                    name: convertNameAndWireValueToV1(property.name),
                                    nameV2: convertNameAndWireValueToV2(property.name),
                                    type: convertTypeReference(property.type)
                                }),
                            noProperties: IrVersions.V4.types.SingleUnionTypeProperties.noProperties,
                            _unknown: () => {
                                throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape._type);
                            }
                        }
                    )
                }))
            }),
        _unknown: () => {
            throw new Error("Unknown shape: " + shape._type);
        }
    });
}

function convertExampleType(example: IrVersions.V5.types.ExampleType): IrVersions.V4.types.ExampleType {
    return {
        docs: example.docs,
        jsonExample: example.jsonExample,
        name: example.name?.originalName,
        shape: convertExampleTypeShape(example.shape)
    };
}

function convertResolvedTypeReference(
    resolvedTypeReference: IrVersions.V5.types.ResolvedTypeReference
): IrVersions.V4.types.ResolvedTypeReference {
    return IrVersions.V5.types.ResolvedTypeReference._visit<IrVersions.V4.types.ResolvedTypeReference>(
        resolvedTypeReference,
        {
            named: (resolvedNamedType) =>
                IrVersions.V4.types.ResolvedTypeReference.named({
                    name: convertDeclaredTypeName(resolvedNamedType.name),
                    shape: convertShapeType(resolvedNamedType.shape)
                }),
            container: (containerType) =>
                IrVersions.V4.types.ResolvedTypeReference.container(convertContainerType(containerType)),
            primitive: IrVersions.V4.types.ResolvedTypeReference.primitive,
            unknown: IrVersions.V4.types.ResolvedTypeReference.unknown,
            _unknown: () => {
                throw new Error("Unknown ResolvedTypeReference: " + resolvedTypeReference._type);
            }
        }
    );
}

function convertShapeType(shape: IrVersions.V5.types.ShapeType): IrVersions.V4.types.ShapeType {
    return IrVersions.V5.types.ShapeType._visit<IrVersions.V5.types.ShapeType>(shape, {
        enum: () => IrVersions.V5.types.ShapeType.Enum,
        object: () => IrVersions.V5.types.ShapeType.Object,
        union: () => IrVersions.V5.types.ShapeType.Union,
        _unknown: () => {
            throw new Error("Unknown ShapeType: " + shape);
        }
    });
}
