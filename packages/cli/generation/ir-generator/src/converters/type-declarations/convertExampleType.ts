import { assertNever } from "@fern-api/core-utils";
import {
    isRawObjectDefinition,
    RawSchemas,
    visitRawTypeDeclaration,
    visitRawTypeReference,
} from "@fern-api/yaml-schema";
import {
    DeclaredTypeName,
    ExampleContainer,
    ExampleObjectProperty,
    ExamplePrimitive,
    ExampleSingleUnionTypeProperties,
    ExampleType,
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    ExampleTypeShape,
    PrimitiveType,
} from "@fern-fern/ir-model/types";
import { isArray } from "lodash-es";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { getSingleUnionTypeProperties, getUnionDiscriminant } from "./convertUnionTypeDeclaration";

export function convertTypeExample({
    typeName,
    typeDeclaration,
    example,
    typeResolver,
    file,
}: {
    typeName: DeclaredTypeName;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    example: RawSchemas.ExampleTypeSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): ExampleType {
    const shape = visitRawTypeDeclaration<ExampleTypeShape>(typeDeclaration, {
        alias: (rawAlias) => {
            return ExampleTypeShape.alias({
                value: convertTypeReferenceExample({
                    example,
                    rawTypeBeingExemplified: typeof rawAlias === "string" ? rawAlias : rawAlias.type,
                    file,
                    typeResolver,
                }),
            });
        },
        object: (rawObject) => {
            return convertObject({ typeName, rawObject, example, file, typeResolver });
        },
        union: (rawUnion) => {
            const discriminant = getUnionDiscriminant(rawUnion);
            const discriminantValueForExample = example.value?.[discriminant];
            if (discriminantValueForExample == null) {
                throw new Error("Example is missing discriminant: " + discriminant);
            }

            const rawSingleUnionType = rawUnion.union[discriminantValueForExample];
            if (rawSingleUnionType == null) {
                throw new Error(`${discriminantValueForExample} is not one of the specified discriminant values.`);
            }

            const rawValueType = typeof rawSingleUnionType === "string" ? rawSingleUnionType : rawSingleUnionType.type;

            return ExampleTypeShape.union({
                wireDiscriminantValue: discriminantValueForExample,
                properties: convertUnionProperties({
                    rawValueType,
                    rawSingleUnionType,
                    file,
                    typeResolver,
                    example,
                    discriminant,
                }),
            });
        },
        enum: () => {
            return ExampleTypeShape.enum({
                wireValue: example.value,
            });
        },
    });

    return {
        name: example.name,
        docs: example.docs,
        jsonExample: example,
        shape,
    };
}

export function convertTypeReferenceExample({
    example,
    rawTypeBeingExemplified,
    typeResolver,
    file,
}: {
    example: RawSchemas.ExampleTypeReferenceSchema;
    rawTypeBeingExemplified: string;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): ExampleTypeReference {
    const shape = visitRawTypeReference<ExampleTypeReferenceShape>(rawTypeBeingExemplified, {
        primitive: (primitive) => {
            return convertPrimitiveExample({
                example,
                typeBeingExemplified: primitive,
            });
        },
        map: ({ keyType, valueType }) => {
            return ExampleTypeReferenceShape.container(
                ExampleContainer.map(
                    Object.entries(example).map(([key, value]) => ({
                        key: convertTypeReferenceExample({
                            example: key,
                            rawTypeBeingExemplified: keyType,
                            typeResolver,
                            file,
                        }),
                        value: convertTypeReferenceExample({
                            example: value,
                            rawTypeBeingExemplified: valueType,
                            typeResolver,
                            file,
                        }),
                    }))
                )
            );
        },
        list: (itemType) => {
            if (!isArray(example)) {
                throw new Error("Example is not a list");
            }
            return ExampleTypeReferenceShape.container(
                ExampleContainer.list(
                    example.map((exampleItem) =>
                        convertTypeReferenceExample({
                            example: exampleItem,
                            rawTypeBeingExemplified: itemType,
                            typeResolver,
                            file,
                        })
                    )
                )
            );
        },
        set: (itemType) => {
            if (!isArray(example)) {
                throw new Error("Example is not a list");
            }
            return ExampleTypeReferenceShape.container(
                ExampleContainer.set(
                    example.map((exampleItem) =>
                        convertTypeReferenceExample({
                            example: exampleItem,
                            rawTypeBeingExemplified: itemType,
                            typeResolver,
                            file,
                        })
                    )
                )
            );
        },
        optional: (itemType) => {
            return ExampleTypeReferenceShape.container(
                ExampleContainer.optional(
                    convertTypeReferenceExample({
                        example,
                        rawTypeBeingExemplified: itemType,
                        typeResolver,
                        file,
                    })
                )
            );
        },
        literal: () => {
            throw new Error("Examples are not supported for literals");
        },
        named: (named) => {
            const typeDeclaration = typeResolver.getDeclarationOfNamedTypeOrThrow({
                referenceToNamedType: named,
                file,
            });
            const parsedReferenceToNamedType = file.parseTypeReference(named);
            if (parsedReferenceToNamedType._type !== "named") {
                throw new Error("Type reference is not to a named type.");
            }
            const typeName = {
                fernFilepath: parsedReferenceToNamedType.fernFilepath,
                fernFilepathV2: parsedReferenceToNamedType.fernFilepathV2,
                name: parsedReferenceToNamedType.name,
                nameV2: parsedReferenceToNamedType.nameV2,
                nameV3: parsedReferenceToNamedType.nameV3,
            };
            return ExampleTypeReferenceShape.named({
                typeName,
                shape: convertTypeExample({
                    typeName,
                    typeDeclaration: typeDeclaration.declaration,
                    file: typeDeclaration.file,
                    example,
                    typeResolver,
                }).shape,
            });
        },
        unknown: () => {
            return ExampleTypeReferenceShape.unknown(example);
        },
        void: () => {
            throw new Error("Examples are not supported for void");
        },
    });
    return {
        shape,
        jsonExample: example,
    };
}

function convertPrimitiveExample({
    example,
    typeBeingExemplified,
}: {
    example: RawSchemas.ExampleTypeReferenceSchema;
    typeBeingExemplified: PrimitiveType;
}): ExampleTypeReferenceShape {
    return PrimitiveType._visit(typeBeingExemplified, {
        string: () => ExampleTypeReferenceShape.primitive(ExamplePrimitive.string(example)),
        dateTime: () => ExampleTypeReferenceShape.primitive(ExamplePrimitive.datetime(example)),
        integer: () => ExampleTypeReferenceShape.primitive(ExamplePrimitive.integer(example)),
        double: () => ExampleTypeReferenceShape.primitive(ExamplePrimitive.double(example)),
        long: () => ExampleTypeReferenceShape.primitive(ExamplePrimitive.long(example)),
        boolean: () => ExampleTypeReferenceShape.primitive(ExamplePrimitive.boolean(example)),
        uuid: () => ExampleTypeReferenceShape.primitive(ExamplePrimitive.uuid(example)),
        _unknown: () => {
            throw new Error("Unknown primitive type: " + typeBeingExemplified);
        },
    });
}

function convertObject({
    typeName,
    rawObject,
    example,
    file,
    typeResolver,
}: {
    typeName: DeclaredTypeName;
    rawObject: RawSchemas.ObjectSchema;
    example: RawSchemas.ExampleTypeSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): ExampleTypeShape {
    return ExampleTypeShape.object({
        properties:
            rawObject.properties != null
                ? Object.entries(example.value).reduce<ExampleObjectProperty[]>(
                      (exampleProperties, [wireKey, propertyExample]) => {
                          const originalTypeDeclaration = getOriginalTypeDeclarationForProperty({
                              typeName,
                              wirePropertyKey: wireKey,
                              rawObject,
                              typeResolver,
                              file,
                          });
                          if (originalTypeDeclaration == null) {
                              throw new Error("Could not find original type declaration for property: " + wireKey);
                          }
                          exampleProperties.push({
                              wireKey,
                              value: convertTypeReferenceExample({
                                  example: propertyExample,
                                  rawTypeBeingExemplified:
                                      typeof originalTypeDeclaration.rawPropertyType === "string"
                                          ? originalTypeDeclaration.rawPropertyType
                                          : originalTypeDeclaration.rawPropertyType.type,
                                  typeResolver,
                                  file,
                              }),
                              originalTypeDeclaration: originalTypeDeclaration.typeName,
                          });
                          return exampleProperties;
                      },
                      []
                  )
                : [],
    });
}

function getOriginalTypeDeclarationForProperty({
    typeName,
    wirePropertyKey,
    rawObject,
    typeResolver,
    file,
}: {
    typeName: DeclaredTypeName;
    wirePropertyKey: string;
    rawObject: RawSchemas.ObjectSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): { typeName: DeclaredTypeName; rawPropertyType: string | RawSchemas.ObjectPropertySchema } | undefined {
    const rawPropertyType = rawObject.properties?.[wirePropertyKey];
    if (rawPropertyType != null) {
        return { typeName, rawPropertyType };
    } else {
        return getOriginalTypeDeclarationForPropertyFromExtensions({
            wirePropertyKey,
            extends_: rawObject.extends,
            typeResolver,
            file,
        });
    }
}

export function getOriginalTypeDeclarationForPropertyFromExtensions({
    wirePropertyKey,
    extends_,
    typeResolver,
    file,
}: {
    wirePropertyKey: string;
    extends_: string | string[] | undefined;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): { typeName: DeclaredTypeName; rawPropertyType: string | RawSchemas.ObjectPropertySchema } | undefined {
    if (extends_ != null) {
        const extendsList = typeof extends_ === "string" ? [extends_] : extends_;
        for (const typeName of extendsList) {
            const resolvedType = typeResolver.resolveNamedTypeOrThrow({
                referenceToNamedType: typeName,
                file,
            });
            if (resolvedType._type !== "named" || !isRawObjectDefinition(resolvedType.declaration)) {
                throw new Error("Extension is not of a named object");
            }
            const originalTypeDeclaration = getOriginalTypeDeclarationForProperty({
                wirePropertyKey,
                rawObject: resolvedType.declaration,
                typeResolver,
                typeName: resolvedType.name,
                file: resolvedType.file,
            });
            if (originalTypeDeclaration != null) {
                return originalTypeDeclaration;
            }
        }
    }

    return undefined;
}

function convertUnionProperties({
    rawValueType,
    rawSingleUnionType,
    file,
    typeResolver,
    example,
    discriminant,
}: {
    rawValueType: string | undefined;
    rawSingleUnionType: RawSchemas.SingleUnionTypeSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    example: RawSchemas.ExampleTypeSchema;
    discriminant: string;
}): ExampleSingleUnionTypeProperties {
    if (rawValueType == null) {
        return ExampleSingleUnionTypeProperties.noProperties();
    }

    const parsedSingleUnionTypeProperties = getSingleUnionTypeProperties({
        rawSingleUnionType,
        rawValueType,
        parsedValueType: file.parseTypeReference(rawValueType),
        file,
        typeResolver,
    });

    switch (parsedSingleUnionTypeProperties._type) {
        case "singleProperty":
            return ExampleSingleUnionTypeProperties.singleProperty(
                convertTypeReferenceExample({
                    example: example.value?.[parsedSingleUnionTypeProperties.nameV2.wireValue],
                    rawTypeBeingExemplified: rawValueType,
                    typeResolver,
                    file,
                })
            );
        case "samePropertiesAsObject": {
            const { [discriminant]: _discriminantValue, ...nonDiscriminantPropertiesFromExample } = example.value;
            const rawDeclaration = typeResolver.getDeclarationOfNamedTypeOrThrow({
                referenceToNamedType: rawValueType,
                file,
            });
            if (!isRawObjectDefinition(rawDeclaration.declaration)) {
                throw new Error(`${rawValueType} is not an object`);
            }
            const typeName: DeclaredTypeName = {
                fernFilepath: parsedSingleUnionTypeProperties.fernFilepath,
                fernFilepathV2: parsedSingleUnionTypeProperties.fernFilepathV2,
                name: parsedSingleUnionTypeProperties.name,
                nameV2: parsedSingleUnionTypeProperties.nameV2,
                nameV3: parsedSingleUnionTypeProperties.nameV3,
            };
            return ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                typeName,
                shape: convertObject({
                    rawObject: rawDeclaration.declaration,
                    example: nonDiscriminantPropertiesFromExample,
                    file: rawDeclaration.file,
                    typeResolver,
                    typeName,
                }),
            });
        }
        default:
            assertNever(parsedSingleUnionTypeProperties);
    }
}
