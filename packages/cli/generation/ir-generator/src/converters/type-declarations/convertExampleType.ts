import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { assertNever, Examples, isPlainObject } from "@fern-api/core-utils";
import {
    EXAMPLE_REFERENCE_PREFIX,
    isRawAliasDefinition,
    isRawObjectDefinition,
    RawSchemas,
    visitRawTypeDeclaration,
    visitRawTypeReference
} from "@fern-api/fern-definition-schema";
import {
    DeclaredTypeName,
    ExampleContainer,
    ExampleExtraObjectProperty,
    ExampleObjectProperty,
    ExamplePrimitive,
    ExampleSingleUnionType,
    ExampleSingleUnionTypeProperties,
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    ExampleTypeShape,
    PrimitiveTypeV1
} from "@fern-api/ir-sdk";
import { IdGenerator } from "@fern-api/ir-utils";
import { validateTypeReferenceExample } from "../../examples/validateTypeReferenceExample";
import { FernFileContext } from "../../FernFileContext";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import {
    getSingleUnionTypeName,
    getSingleUnionTypeProperties,
    getUnionDiscriminant,
    getUnionDiscriminantName
} from "./convertDiscriminatedUnionTypeDeclaration";
import { getEnumNameFromEnumValue } from "./convertEnumTypeDeclaration";
import { getPropertyAccess, getPropertyName } from "./convertObjectTypeDeclaration";

export function convertTypeExample({
    typeName,
    typeDeclaration,
    example,
    typeResolver,
    exampleResolver,
    fileContainingType,
    fileContainingExample,
    workspace
}: {
    typeName: DeclaredTypeName;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    example: RawSchemas.ExampleTypeValueSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    fileContainingType: FernFileContext;
    fileContainingExample: FernFileContext;
    workspace: FernWorkspace;
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
                    workspace
                })
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
                workspace
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

            const baseProperties: ExampleObjectProperty[] = Object.entries(rawUnion["base-properties"] ?? {})
                .map<ExampleObjectProperty | undefined>(([propertyName, property]) => {
                    const propertyExample = example[propertyName];
                    if (propertyExample == null) {
                        return undefined;
                    }
                    return {
                        name: fileContainingExample.casingsGenerator.generateNameAndWireValue({
                            name: propertyName,
                            wireValue: propertyName
                        }),
                        value: convertTypeReferenceExample({
                            example: propertyExample,
                            rawTypeBeingExemplified: typeof property === "string" ? property : property.type,
                            fileContainingRawTypeReference: fileContainingType,
                            fileContainingExample,
                            typeResolver,
                            exampleResolver,
                            workspace
                        }),
                        propertyAccess: undefined,
                        originalTypeDeclaration: typeName
                    };
                })
                .filter((property): property is ExampleObjectProperty => property != null);

            const extendProperties: ExampleObjectProperty[] = (
                typeof rawUnion.extends === "undefined"
                    ? []
                    : typeof rawUnion.extends === "string"
                      ? [rawUnion.extends]
                      : rawUnion.extends
            ).flatMap((extendedTypeName) => {
                const resolvedExtendedType = typeResolver.resolveNamedTypeOrThrow({
                    file: fileContainingType,
                    referenceToNamedType: extendedTypeName
                });
                if (
                    resolvedExtendedType._type !== "named" ||
                    !isRawObjectDefinition(resolvedExtendedType.declaration)
                ) {
                    throw new Error("Extended type is not a named object");
                }
                const extendedObject = resolvedExtendedType.declaration;
                const propertiesFromExtension: ExampleObjectProperty[] = Object.entries(extendedObject.properties ?? {})
                    .map<ExampleObjectProperty | undefined>(([propertyName, property]) => {
                        const propertyExample = example[propertyName];
                        if (propertyExample == null) {
                            return undefined;
                        }
                        return {
                            name: fileContainingExample.casingsGenerator.generateNameAndWireValue({
                                name: typeof property === "string" ? propertyName : (property.name ?? propertyName),
                                wireValue: propertyName
                            }),
                            value: convertTypeReferenceExample({
                                example: propertyExample,
                                rawTypeBeingExemplified: typeof property === "string" ? property : property.type,
                                fileContainingRawTypeReference: fileContainingType,
                                fileContainingExample,
                                typeResolver,
                                exampleResolver,
                                workspace
                            }),
                            propertyAccess: getPropertyAccess({ property }),
                            originalTypeDeclaration: typeName
                        };
                    })
                    .filter((property): property is ExampleObjectProperty => property != null);
                return propertiesFromExtension;
            });

            return ExampleTypeShape.union({
                discriminant: fileContainingExample.casingsGenerator.generateNameAndWireValue({
                    name: getUnionDiscriminantName(rawUnion).name,
                    wireValue: discriminant
                }),
                singleUnionType: convertSingleUnionType({
                    rawValueType,
                    rawSingleUnionType,
                    fileContainingType,
                    fileContainingExample,
                    typeResolver,
                    exampleResolver,
                    example,
                    discriminant,
                    discriminantValueForExample,
                    workspace
                }),
                baseProperties,
                extendProperties
            });
        },
        enum: (rawEnum) => {
            if (typeof example !== "string") {
                const validValues = rawEnum.enum
                    .map((enumEntry) => (typeof enumEntry === "string" ? enumEntry : enumEntry.value))
                    .join(", ");

                throw new Error(`Expected one of ${validValues}. Received ${example}`);
            }
            return ExampleTypeShape.enum({
                value: fileContainingExample.casingsGenerator.generateNameAndWireValue({
                    name: getEnumNameFromEnumValue(example, rawEnum).name,
                    wireValue: example
                })
            });
        },
        undiscriminatedUnion: (undiscriminatedUnion) => {
            for (const [index, variant] of undiscriminatedUnion.union.entries()) {
                const violationsForMember = validateTypeReferenceExample({
                    rawTypeReference: typeof variant === "string" ? variant : variant.type,
                    example,
                    typeResolver,
                    exampleResolver,
                    file: fileContainingType,
                    workspace,
                    breadcrumbs: [],
                    depth: 0
                });
                if (violationsForMember.length === 0) {
                    return ExampleTypeShape.undiscriminatedUnion({
                        index,
                        singleUnionType: convertTypeReferenceExample({
                            example,
                            rawTypeBeingExemplified: typeof variant === "string" ? variant : variant.type,
                            fileContainingRawTypeReference: fileContainingType,
                            fileContainingExample,
                            typeResolver,
                            exampleResolver,
                            workspace
                        })
                    });
                }
            }
            const variantOptions = undiscriminatedUnion.union.map((variant) => {
                return typeof variant === "string" ? variant : variant.type;
            });
            const validValues = variantOptions.join(", ");
            throw new Error(`Expected one of ${validValues}. Received ${example}`);
        }
    });
}

export function convertTypeReferenceExample({
    example,
    fileContainingExample,
    rawTypeBeingExemplified,
    fileContainingRawTypeReference,
    typeResolver,
    exampleResolver,
    workspace
}: {
    example: RawSchemas.ExampleTypeReferenceSchema;
    fileContainingExample: FernFileContext;
    rawTypeBeingExemplified: string;
    fileContainingRawTypeReference: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
}): ExampleTypeReference {
    const { resolvedExample, file: fileContainingResolvedExample } = exampleResolver.resolveExampleOrThrow({
        example,
        file: fileContainingExample
    });
    const jsonExample = exampleResolver.resolveAllReferencesInExampleOrThrow({
        example,
        file: fileContainingExample
    }).resolvedExample;

    const shape = visitRawTypeReference<ExampleTypeReferenceShape>({
        type: rawTypeBeingExemplified,
        _default: undefined,
        validation: undefined,
        visitor: {
            primitive: (primitive) => {
                return convertPrimitiveExample({
                    example: resolvedExample,
                    typeBeingExemplified: primitive.v1
                });
            },
            map: ({ keyType, valueType }) => {
                if (!isPlainObject(resolvedExample)) {
                    throw new Error("Example is not an object");
                }
                return ExampleTypeReferenceShape.container(
                    ExampleContainer.map({
                        map: Object.entries(resolvedExample).map(([key, value]) => ({
                            key: convertTypeReferenceExample({
                                example: key,
                                fileContainingExample: fileContainingResolvedExample,
                                rawTypeBeingExemplified: keyType,
                                fileContainingRawTypeReference,
                                typeResolver,
                                exampleResolver,
                                workspace
                            }),
                            value: convertTypeReferenceExample({
                                example: value,
                                fileContainingExample: fileContainingResolvedExample,
                                rawTypeBeingExemplified: valueType,
                                fileContainingRawTypeReference,
                                typeResolver,
                                exampleResolver,
                                workspace
                            })
                        })),
                        keyType: fileContainingRawTypeReference.parseTypeReference(keyType),
                        valueType: fileContainingRawTypeReference.parseTypeReference(valueType)
                    })
                );
            },
            list: (itemType) => {
                if (!Array.isArray(resolvedExample)) {
                    throw new Error("Example is not a list");
                }
                return ExampleTypeReferenceShape.container(
                    ExampleContainer.list({
                        list: resolvedExample.map((exampleItem) =>
                            convertTypeReferenceExample({
                                example: exampleItem,
                                fileContainingExample: fileContainingResolvedExample,
                                rawTypeBeingExemplified: itemType,
                                fileContainingRawTypeReference,
                                typeResolver,
                                exampleResolver,
                                workspace
                            })
                        ),
                        itemType: fileContainingRawTypeReference.parseTypeReference(itemType)
                    })
                );
            },
            set: (itemType) => {
                if (!Array.isArray(resolvedExample)) {
                    throw new Error("Example is not a list");
                }
                return ExampleTypeReferenceShape.container(
                    ExampleContainer.set({
                        set: resolvedExample.map((exampleItem) =>
                            convertTypeReferenceExample({
                                example: exampleItem,
                                fileContainingExample: fileContainingResolvedExample,
                                rawTypeBeingExemplified: itemType,
                                fileContainingRawTypeReference,
                                typeResolver,
                                exampleResolver,
                                workspace
                            })
                        ),
                        itemType: fileContainingRawTypeReference.parseTypeReference(itemType)
                    })
                );
            },
            optional: (itemType) => {
                return ExampleTypeReferenceShape.container(
                    ExampleContainer.optional({
                        optional:
                            resolvedExample != null
                                ? convertTypeReferenceExample({
                                      example: resolvedExample,
                                      fileContainingExample: fileContainingResolvedExample,
                                      rawTypeBeingExemplified: itemType,
                                      fileContainingRawTypeReference,
                                      typeResolver,
                                      exampleResolver,
                                      workspace
                                  })
                                : undefined,
                        valueType: fileContainingRawTypeReference.parseTypeReference(itemType)
                    })
                );
            },
            nullable: (itemType) => {
                return ExampleTypeReferenceShape.container(
                    ExampleContainer.nullable({
                        nullable:
                            resolvedExample != null
                                ? convertTypeReferenceExample({
                                      example: resolvedExample,
                                      fileContainingExample: fileContainingResolvedExample,
                                      rawTypeBeingExemplified: itemType,
                                      fileContainingRawTypeReference,
                                      typeResolver,
                                      exampleResolver,
                                      workspace
                                  })
                                : undefined,
                        valueType: fileContainingRawTypeReference.parseTypeReference(itemType)
                    })
                );
            },
            literal: (literal) => {
                switch (literal.type) {
                    case "boolean":
                        return ExampleTypeReferenceShape.container(
                            ExampleContainer.literal({ literal: ExamplePrimitive.boolean(literal.boolean) })
                        );
                    case "string":
                        return ExampleTypeReferenceShape.container(
                            ExampleContainer.literal({
                                literal: ExamplePrimitive.string({
                                    original: literal.string
                                })
                            })
                        );
                    default:
                        assertNever(literal);
                }
            },
            named: (named) => {
                const typeDeclaration = typeResolver.getDeclarationOfNamedTypeOrThrow({
                    referenceToNamedType: rawTypeBeingExemplified,
                    file: fileContainingRawTypeReference
                });
                const parsedReferenceToNamedType = fileContainingRawTypeReference.parseTypeReference(named);
                if (parsedReferenceToNamedType.type !== "named") {
                    throw new Error("Type reference is not to a named type.");
                }
                const typeName: DeclaredTypeName = {
                    typeId: parsedReferenceToNamedType.typeId,
                    fernFilepath: parsedReferenceToNamedType.fernFilepath,
                    name: parsedReferenceToNamedType.name,
                    displayName: parsedReferenceToNamedType.displayName
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
                        workspace
                    })
                });
            },
            unknown: () => {
                return ExampleTypeReferenceShape.unknown(jsonExample);
            }
        }
    });

    return {
        shape,
        jsonExample
    };
}

export function convertUnknownExample({
    example
}: {
    example: RawSchemas.ExampleTypeReferenceSchema;
}): ExampleTypeReferenceShape {
    return ExampleTypeReferenceShape.unknown(example);
}

function convertPrimitiveExample({
    example,
    typeBeingExemplified
}: {
    example: RawSchemas.ExampleTypeReferenceSchema;
    typeBeingExemplified: PrimitiveTypeV1;
}): ExampleTypeReferenceShape {
    return PrimitiveTypeV1._visit(typeBeingExemplified, {
        string: () => {
            if (typeof example !== "string") {
                return ExampleTypeReferenceShape.primitive(
                    ExamplePrimitive.string({
                        original: Examples.STRING
                    })
                );
            }

            // remove initial \
            const unescaped = example.startsWith(`\\${EXAMPLE_REFERENCE_PREFIX}`) ? example.slice(1) : example;
            return ExampleTypeReferenceShape.primitive(
                ExamplePrimitive.string({
                    original: unescaped
                })
            );
        },
        dateTime: () => {
            if (typeof example !== "string") {
                return ExampleTypeReferenceShape.primitive(
                    ExamplePrimitive.string({
                        original: Examples.DATE_TIME
                    })
                );
            }
            return ExampleTypeReferenceShape.primitive(
                ExamplePrimitive.datetime({
                    datetime: new Date(example),
                    raw: example
                })
            );
        },
        date: () => {
            if (typeof example !== "string") {
                return ExampleTypeReferenceShape.primitive(
                    ExamplePrimitive.string({
                        original: Examples.DATE
                    })
                );
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.date(example));
        },
        base64: () => {
            if (typeof example !== "string") {
                return ExampleTypeReferenceShape.primitive(
                    ExamplePrimitive.string({
                        original: Examples.BASE64
                    })
                );
            }
            return ExampleTypeReferenceShape.primitive(
                ExamplePrimitive.string({
                    original: example
                })
            );
        },
        uint: () => {
            if (typeof example !== "number") {
                return ExampleTypeReferenceShape.primitive(ExamplePrimitive.uint(Examples.UINT));
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.uint(example));
        },
        uint64: () => {
            if (typeof example !== "number") {
                return ExampleTypeReferenceShape.primitive(ExamplePrimitive.uint64(Examples.UINT64));
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.uint64(example));
        },
        integer: () => {
            if (typeof example !== "number") {
                return ExampleTypeReferenceShape.primitive(ExamplePrimitive.integer(Examples.INT));
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.integer(example));
        },
        float: () => {
            if (typeof example !== "number") {
                return ExampleTypeReferenceShape.primitive(ExamplePrimitive.float(Examples.FLOAT));
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.float(example));
        },
        double: () => {
            if (typeof example !== "number") {
                return ExampleTypeReferenceShape.primitive(ExamplePrimitive.double(Examples.DOUBLE));
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.double(example));
        },
        long: () => {
            if (typeof example !== "number") {
                return ExampleTypeReferenceShape.primitive(ExamplePrimitive.long(Examples.UINT));
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.long(example));
        },
        boolean: () => {
            if (typeof example !== "boolean") {
                return ExampleTypeReferenceShape.primitive(ExamplePrimitive.boolean(Examples.BOOLEAN));
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.boolean(example));
        },
        uuid: () => {
            if (typeof example !== "string") {
                return ExampleTypeReferenceShape.primitive(
                    ExamplePrimitive.string({
                        original: Examples.UUID
                    })
                );
            }
            return ExampleTypeReferenceShape.primitive(ExamplePrimitive.uuid(example));
        },
        bigInteger: () => {
            if (typeof example !== "string") {
                return ExampleTypeReferenceShape.primitive(
                    ExamplePrimitive.string({
                        original: Examples.BIG_INTEGER
                    })
                );
            }
            return ExampleTypeReferenceShape.primitive(
                ExamplePrimitive.string({
                    original: example
                })
            );
        },
        _other: () => {
            throw new Error("Unknown primitive type: " + typeBeingExemplified);
        }
    });
}

type WireKey = string;
type PropertyExample = unknown;
type OriginalTypeDeclaration = {
    typeName: DeclaredTypeName;
    rawPropertyType: string | RawSchemas.ObjectPropertySchema;
    file: FernFileContext;
};

function convertObject({
    typeName,
    rawObject,
    example,
    fileContainingType,
    fileContainingExample,
    typeResolver,
    exampleResolver,
    workspace
}: {
    typeName: DeclaredTypeName;
    rawObject: RawSchemas.ObjectSchema;
    example: RawSchemas.ExampleTypeValueSchema;
    fileContainingType: FernFileContext;
    fileContainingExample: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
}): ExampleTypeShape.Object_ {
    if (!isPlainObject(example)) {
        throw new Error(`Example is not an object. Got: ${JSON.stringify(example)}`);
    }

    const properties: [WireKey, PropertyExample, OriginalTypeDeclaration | undefined][] = Object.entries(example).map(
        ([wireKey, propertyExample]) => {
            const originalTypeDeclaration = getOriginalTypeDeclarationForProperty({
                typeName,
                wirePropertyKey: wireKey,
                rawObject,
                typeResolver,
                file: fileContainingType
            });
            return [wireKey, propertyExample, originalTypeDeclaration];
        }
    );
    const propertiesWithTypeDeclaration = properties.filter(
        ([, , originalTypeDeclaration]) => originalTypeDeclaration != null
    ) as [WireKey, PropertyExample, OriginalTypeDeclaration][];
    const propertiesWithoutTypeDeclaration = properties.filter(
        ([, , originalTypeDeclaration]) => originalTypeDeclaration == null
    );
    return ExampleTypeShape.object({
        properties:
            rawObject.properties != null || rawObject.extends != null
                ? propertiesWithTypeDeclaration.map(([wireKey, propertyExample, originalTypeDeclaration]) => {
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
                          workspace
                      });
                      return {
                          name: fileContainingExample.casingsGenerator.generateNameAndWireValue({
                              name: getPropertyName({
                                  propertyKey: wireKey,
                                  property: originalTypeDeclaration.rawPropertyType
                              }).name,
                              wireValue: wireKey
                          }),
                          value: valueExample,
                          originalTypeDeclaration: originalTypeDeclaration.typeName,
                          propertyAccess: getPropertyAccess({ property: originalTypeDeclaration.rawPropertyType })
                      };
                  })
                : [],
        extraProperties:
            rawObject["extra-properties"] !== true || propertiesWithoutTypeDeclaration.length === 0
                ? undefined
                : propertiesWithoutTypeDeclaration.map<ExampleExtraObjectProperty>(([wireKey, propertyExample]) => {
                      return {
                          name: fileContainingExample.casingsGenerator.generateNameAndWireValue({
                              name: wireKey,
                              wireValue: wireKey
                          }),
                          value: {
                              shape: convertUnknownExample({ example: propertyExample }),
                              jsonExample: propertyExample
                          }
                      };
                  })
    });
}

function getOriginalTypeDeclarationForProperty({
    typeName,
    wirePropertyKey,
    rawObject,
    typeResolver,
    file
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
            file
        });
    }
}

export function getOriginalTypeDeclarationForPropertyFromExtensions({
    wirePropertyKey,
    extends_,
    typeResolver,
    file
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
                file
            });
            if (resolvedType._type !== "named" || !isRawObjectDefinition(resolvedType.declaration)) {
                throw new Error("Extension is not of a named object");
            }
            const originalTypeDeclaration = getOriginalTypeDeclarationForProperty({
                wirePropertyKey,
                rawObject: resolvedType.declaration,
                typeResolver,
                typeName: resolvedType.name,
                file: resolvedType.file
            });
            if (originalTypeDeclaration != null) {
                return originalTypeDeclaration;
            }
        }
    }

    return undefined;
}

function convertSingleUnionType({
    rawValueType,
    rawSingleUnionType,
    fileContainingType,
    fileContainingExample,
    typeResolver,
    exampleResolver,
    example,
    discriminant,
    discriminantValueForExample,
    workspace
}: {
    rawValueType: string | undefined;
    rawSingleUnionType: RawSchemas.SingleUnionTypeSchema;
    fileContainingType: FernFileContext;
    fileContainingExample: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    example: RawSchemas.ExampleTypeValueSchema;
    discriminant: string;
    discriminantValueForExample: string;
    workspace: FernWorkspace;
}): ExampleSingleUnionType {
    const wireDiscriminantValue = fileContainingExample.casingsGenerator.generateNameAndWireValue({
        name: getSingleUnionTypeName({ unionKey: discriminantValueForExample, rawSingleUnionType }).name,
        wireValue: discriminantValueForExample
    });
    if (rawValueType == null) {
        return {
            wireDiscriminantValue,
            shape: ExampleSingleUnionTypeProperties.noProperties()
        };
    }

    const parsedSingleUnionTypeProperties = getSingleUnionTypeProperties({
        rawSingleUnionType,
        rawValueType,
        parsedValueType: fileContainingType.parseTypeReference(rawValueType),
        file: fileContainingType,
        typeResolver
    });

    switch (parsedSingleUnionTypeProperties.propertiesType) {
        case "singleProperty": {
            if (!isPlainObject(example)) {
                throw new Error("Example is not an object");
            }
            return {
                wireDiscriminantValue,
                shape: ExampleSingleUnionTypeProperties.singleProperty(
                    convertTypeReferenceExample({
                        example: example[parsedSingleUnionTypeProperties.name.wireValue],
                        rawTypeBeingExemplified: rawValueType,
                        typeResolver,
                        exampleResolver,
                        fileContainingRawTypeReference: fileContainingType,
                        fileContainingExample,
                        workspace
                    })
                )
            };
        }
        case "samePropertiesAsObject": {
            if (!isPlainObject(example)) {
                throw new Error("Example is not an object");
            }
            const { [discriminant]: _discriminantValue, ...nonDiscriminantPropertiesFromExample } = example;
            let rawDeclaration = typeResolver.getDeclarationOfNamedTypeOrThrow({
                referenceToNamedType: rawValueType,
                file: fileContainingType
            });
            while (isRawAliasDefinition(rawDeclaration.declaration)) {
                rawDeclaration = typeResolver.getDeclarationOfNamedTypeOrThrow({
                    referenceToNamedType:
                        typeof rawDeclaration.declaration === "string"
                            ? rawDeclaration.declaration
                            : rawDeclaration.declaration.type,
                    file: fileContainingType
                });
            }
            if (!isRawObjectDefinition(rawDeclaration.declaration)) {
                throw new Error(`${rawValueType} is not an object`);
            }
            const typeName: DeclaredTypeName = {
                typeId: parsedSingleUnionTypeProperties.typeId,
                fernFilepath: parsedSingleUnionTypeProperties.fernFilepath,
                name: parsedSingleUnionTypeProperties.name,
                displayName: parsedSingleUnionTypeProperties.displayName
            };
            return {
                wireDiscriminantValue,
                shape: ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                    typeId: IdGenerator.generateTypeId(typeName),
                    object: convertObject({
                        rawObject: rawDeclaration.declaration,
                        example: nonDiscriminantPropertiesFromExample,
                        fileContainingType: rawDeclaration.file,
                        fileContainingExample,
                        typeResolver,
                        exampleResolver,
                        typeName,
                        workspace
                    })
                })
            };
        }
        default:
            assertNever(parsedSingleUnionTypeProperties);
    }
}
