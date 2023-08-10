import { assertNever, isPlainObject } from "@fern-api/core-utils";
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
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    ExampleTypeShape,
    PrimitiveType,
} from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../../FernFileContext";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { getSingleUnionTypeProperties, getUnionDiscriminant } from "./convertDiscriminatedUnionTypeDeclaration";

export function convertTypeExample({
    typeName,
    typeDeclaration,
    example,
    typeResolver,
    exampleResolver,
    fileContainingType,
    fileContainingExample,
}: {
    typeName: DeclaredTypeName;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    example: RawSchemas.ExampleTypeValueSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    fileContainingType: FernFileContext;
    fileContainingExample: FernFileContext;
}): ExampleTypeShape {
    return visitRawTypeDeclaration<ExampleTypeShape>(typeDeclaration, {
        alias: (rawAlias) => {
            return ExampleTypeShape.alias({
                value: convertTypeReferenceExample({
                    example,
                    rawTypeBeingExemplified: typeof rawAlias === "string" ? rawAlias : rawAlias.type,
                    fileContainingRawTypeReference: fileContainingType,
                    fileContainingExample,
                    typeResolver,
                    exampleResolver,
                }),
            });
        },
        object: (rawObject) => {
            return convertObject({
                typeName,
                rawObject,
                example,
                fileContainingType,
                fileContainingExample,
                typeResolver,
                exampleResolver,
            });
        },
        discriminatedUnion: (rawUnion) => {
            const discriminant = getUnionDiscriminant(rawUnion);
            if (!isPlainObject(example)) {
                throw new Error("Example is not an object");
            }
            const discriminantValueForExample = example[discriminant];
            if (discriminantValueForExample == null) {
                throw new Error("Example is missing discriminant: " + discriminant);
            }
            if (typeof discriminantValueForExample !== "string") {
                throw new Error("Discriminant value is not a string");
            }

            const rawSingleUnionType = rawUnion.union[discriminantValueForExample];
            if (rawSingleUnionType == null) {
                throw new Error(`${discriminantValueForExample} is not one of the specified discriminant values.`);
            }

            const rawValueType =
                typeof rawSingleUnionType === "string"
                    ? rawSingleUnionType
                    : typeof rawSingleUnionType.type === "string"
                    ? rawSingleUnionType.type
                    : undefined;

            return ExampleTypeShape.union({
                wireDiscriminantValue: discriminantValueForExample,
                properties: convertUnionProperties({
                    rawValueType,
                    rawSingleUnionType,
                    fileContainingType,
                    fileContainingExample,
                    typeResolver,
                    exampleResolver,
                    example,
                    discriminant,
                }),
            });
        },
        enum: () => {
            if (typeof example !== "string") {
                throw new Error("Enum example is not a string");
            }
            return ExampleTypeShape.enum({
                wireValue: example,
            });
        },
        undiscriminatedUnion: () => {
            throw new Error("Examples are not supported for undiscriminated unions");
        },
    });
}

export function convertTypeReferenceExample({
    example,
    fileContainingExample,
    rawTypeBeingExemplified,
    fileContainingRawTypeReference,
    typeResolver,
    exampleResolver,
}: {
    example: RawSchemas.ExampleTypeReferenceSchema;
    fileContainingExample: FernFileContext;
    rawTypeBeingExemplified: string;
    fileContainingRawTypeReference: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
}): ExampleTypeReference {
    const { resolvedExample, file: fileContainingResolvedExample } = exampleResolver.resolveExampleOrThrow({
        example,
        file: fileContainingExample,
    });
    const jsonExample = exampleResolver.resolveAllReferencesInExampleOrThrow({
        example,
        file: fileContainingExample,
    }).resolvedExample;

    const shape = visitRawTypeReference<ExampleTypeReferenceShape>(rawTypeBeingExemplified, {
        primitive: (primitive) => {
            return convertPrimitiveExample({
                example: resolvedExample,
                typeBeingExemplified: primitive,
            });
        },
        map: ({ keyType, valueType }) => {
            if (!isPlainObject(resolvedExample)) {
                throw new Error("Example is not an object");
            }
            return ExampleTypeReferenceShape.container(
                ExampleContainer.map(
                    Object.entries(resolvedExample).map(([key, value]) => ({
                        key: convertTypeReferenceExample({
                            example: key,
                            fileContainingExample: fileContainingResolvedExample,
                            rawTypeBeingExemplified: keyType,
                            fileContainingRawTypeReference,
                            typeResolver,
                            exampleResolver,
                        }),
                        value: convertTypeReferenceExample({
                            example: value,
                            fileContainingExample: fileContainingResolvedExample,
                            rawTypeBeingExemplified: valueType,
                            fileContainingRawTypeReference,
                            typeResolver,
                            exampleResolver,
                        }),
                    }))
                )
            );
        },
        list: (itemType) => {
            if (!Array.isArray(resolvedExample)) {
                throw new Error("Example is not a list");
            }
            return ExampleTypeReferenceShape.container(
                ExampleContainer.list(
                    resolvedExample.map((exampleItem) =>
                        convertTypeReferenceExample({
                            example: exampleItem,
                            fileContainingExample: fileContainingResolvedExample,
                            rawTypeBeingExemplified: itemType,
                            fileContainingRawTypeReference,
                            typeResolver,
                            exampleResolver,
                        })
                    )
                )
            );
        },
        set: (itemType) => {
            if (!Array.isArray(resolvedExample)) {
                throw new Error("Example is not a list");
            }
            return ExampleTypeReferenceShape.container(
                ExampleContainer.set(
                    resolvedExample.map((exampleItem) =>
                        convertTypeReferenceExample({
                            example: exampleItem,
                            fileContainingExample: fileContainingResolvedExample,
                            rawTypeBeingExemplified: itemType,
                            fileContainingRawTypeReference,
                            typeResolver,
                            exampleResolver,
                        })
                    )
                )
            );
        },
        optional: (itemType) => {
            return ExampleTypeReferenceShape.container(
                ExampleContainer.optional(
                    resolvedExample != null
                        ? convertTypeReferenceExample({
                              example: resolvedExample,
                              fileContainingExample: fileContainingResolvedExample,
                              rawTypeBeingExemplified: itemType,
                              fileContainingRawTypeReference,
                              typeResolver,
                              exampleResolver,
                          })
                        : undefined
                )
            );
        },
        literal: () => {
            throw new Error("Examples are not supported for literals");
        },
        named: (named) => {
            const typeDeclaration = typeResolver.getDeclarationOfNamedTypeOrThrow({
                referenceToNamedType: named,
                file: fileContainingRawTypeReference,
            });
            const parsedReferenceToNamedType = fileContainingRawTypeReference.parseTypeReference(named);
            if (parsedReferenceToNamedType.type !== "named") {
                throw new Error("Type reference is not to a named type.");
            }
            const typeName: DeclaredTypeName = {
                typeId: parsedReferenceToNamedType.typeId,
                fernFilepath: parsedReferenceToNamedType.fernFilepath,
                name: parsedReferenceToNamedType.name,
            };
            return ExampleTypeReferenceShape.named({
                typeName,
                shape: convertTypeExample({
                    typeName,
                    typeDeclaration: typeDeclaration.declaration,
                    fileContainingType: typeDeclaration.file,
                    fileContainingExample: fileContainingResolvedExample,
                    example: resolvedExample,
                    typeResolver,
                    exampleResolver,
                }),
            });
        },
        unknown: () => {
            return ExampleTypeReferenceShape.unknown(jsonExample);
        },
    });

    return {
        shape,
        jsonExample,
    };
}

function convertPrimitiveExample({
    example,
    typeBeingExemplified,
}: {
    example: RawSchemas.ExampleTypeReferenceSchema;
    typeBeingExemplified: PrimitiveType;
}): ExampleTypeReferenceShape {
    switch (typeBeingExemplified) {
        case PrimitiveType.String:
            if (typeof example !== "string") {
                throw new Error("Example is not a string");
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.string(example));
        case PrimitiveType.DateTime:
            if (typeof example !== "string") {
                throw new Error("Example is not a string");
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.datetime(new Date(example)));
        case PrimitiveType.Date:
            if (typeof example !== "string") {
                throw new Error("Example is not a string");
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.date(example));
        case PrimitiveType.Base64:
            if (typeof example !== "string") {
                throw new Error("Example is not a string");
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.string(example));
        case PrimitiveType.Integer:
            if (typeof example !== "number") {
                throw new Error("Example is not a number");
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.integer(example));
        case PrimitiveType.Double:
            if (typeof example !== "number") {
                throw new Error("Example is not a number");
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.double(example));
        case PrimitiveType.Long:
            if (typeof example !== "number") {
                throw new Error("Example is not a number");
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.long(example));
        case PrimitiveType.Boolean:
            if (typeof example !== "boolean") {
                throw new Error("Example is not a boolean");
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.boolean(example));
        case PrimitiveType.Uuid:
            if (typeof example !== "string") {
                throw new Error("Example is not a string");
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.uuid(example));
    }
}

function convertObject({
    typeName,
    rawObject,
    example,
    fileContainingType,
    fileContainingExample,
    typeResolver,
    exampleResolver,
}: {
    typeName: DeclaredTypeName;
    rawObject: RawSchemas.ObjectSchema;
    example: RawSchemas.ExampleTypeValueSchema;
    fileContainingType: FernFileContext;
    fileContainingExample: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
}): ExampleTypeShape {
    if (!isPlainObject(example)) {
        throw new Error("Example is not an object");
    }
    return ExampleTypeShape.object({
        properties:
            rawObject.properties != null
                ? Object.entries(example).reduce<ExampleObjectProperty[]>(
                      (exampleProperties, [wireKey, propertyExample]) => {
                          const originalTypeDeclaration = getOriginalTypeDeclarationForProperty({
                              typeName,
                              wirePropertyKey: wireKey,
                              rawObject,
                              typeResolver,
                              file: fileContainingType,
                          });
                          if (originalTypeDeclaration == null) {
                              throw new Error("Could not find original type declaration for property: " + wireKey);
                          }

                          try {
                              const valueExample = convertTypeReferenceExample({
                                  example: propertyExample,
                                  fileContainingExample,
                                  rawTypeBeingExemplified:
                                      typeof originalTypeDeclaration.rawPropertyType === "string"
                                          ? originalTypeDeclaration.rawPropertyType
                                          : originalTypeDeclaration.rawPropertyType.type,
                                  fileContainingRawTypeReference: originalTypeDeclaration.file,
                                  typeResolver,
                                  exampleResolver,
                              });
                              exampleProperties.push({
                                  wireKey,
                                  value: valueExample,
                                  originalTypeDeclaration: originalTypeDeclaration.typeName,
                              });
                          } catch (e) {
                              // skip properties that fail to convert (undiscriminated unions)
                          }

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
}):
    | { typeName: DeclaredTypeName; rawPropertyType: string | RawSchemas.ObjectPropertySchema; file: FernFileContext }
    | undefined {
    const rawPropertyType = rawObject.properties?.[wirePropertyKey];
    if (rawPropertyType != null) {
        return { typeName, rawPropertyType, file };
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
}):
    | { typeName: DeclaredTypeName; rawPropertyType: string | RawSchemas.ObjectPropertySchema; file: FernFileContext }
    | undefined {
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
    fileContainingType,
    fileContainingExample,
    typeResolver,
    exampleResolver,
    example,
    discriminant,
}: {
    rawValueType: string | undefined;
    rawSingleUnionType: RawSchemas.SingleUnionTypeSchema;
    fileContainingType: FernFileContext;
    fileContainingExample: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    example: RawSchemas.ExampleTypeValueSchema;
    discriminant: string;
}): ExampleSingleUnionTypeProperties {
    if (rawValueType == null) {
        return ExampleSingleUnionTypeProperties.noProperties();
    }

    const parsedSingleUnionTypeProperties = getSingleUnionTypeProperties({
        rawSingleUnionType,
        rawValueType,
        parsedValueType: fileContainingType.parseTypeReference(rawValueType),
        file: fileContainingType,
        typeResolver,
    });

    switch (parsedSingleUnionTypeProperties.propertiesType) {
        case "singleProperty": {
            if (!isPlainObject(example)) {
                throw new Error("Example is not an object");
            }
            return ExampleSingleUnionTypeProperties.singleProperty(
                convertTypeReferenceExample({
                    example: example[parsedSingleUnionTypeProperties.name.wireValue],
                    rawTypeBeingExemplified: rawValueType,
                    typeResolver,
                    exampleResolver,
                    fileContainingRawTypeReference: fileContainingType,
                    fileContainingExample,
                })
            );
        }
        case "samePropertiesAsObject": {
            if (!isPlainObject(example)) {
                throw new Error("Example is not an object");
            }
            const { [discriminant]: _discriminantValue, ...nonDiscriminantPropertiesFromExample } = example;
            const rawDeclaration = typeResolver.getDeclarationOfNamedTypeOrThrow({
                referenceToNamedType: rawValueType,
                file: fileContainingType,
            });
            if (!isRawObjectDefinition(rawDeclaration.declaration)) {
                throw new Error(`${rawValueType} is not an object`);
            }
            const typeName: DeclaredTypeName = {
                typeId: parsedSingleUnionTypeProperties.typeId,
                fernFilepath: parsedSingleUnionTypeProperties.fernFilepath,
                name: parsedSingleUnionTypeProperties.name,
            };
            return ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                typeName,
                shape: convertObject({
                    rawObject: rawDeclaration.declaration,
                    example: nonDiscriminantPropertiesFromExample,
                    fileContainingType: rawDeclaration.file,
                    fileContainingExample,
                    typeResolver,
                    exampleResolver,
                    typeName,
                }),
            });
        }
        default:
            assertNever(parsedSingleUnionTypeProperties);
    }
}
