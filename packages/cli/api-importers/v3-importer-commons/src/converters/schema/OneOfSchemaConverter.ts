import {
    ContainerType,
    DeclaredTypeName,
    SingleUnionType,
    SingleUnionTypeProperties,
    Type,
    TypeId,
    TypeReference,
    UndiscriminatedUnionMember
} from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { FernDiscriminatedExtension } from "../../extensions/x-fern-discriminated.js";
import { FernEnumExtension } from "../../extensions/x-fern-enum.js";
import { AbstractConverter, AbstractConverterContext } from "../../index.js";
import { convertProperties } from "../../utils/ConvertProperties.js";
import { EnumSchemaConverter } from "./EnumSchemaConverter.js";
import { SchemaConverter } from "./SchemaConverter.js";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter.js";

export declare namespace OneOfSchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        id: string;
        schema: OpenAPIV3_1.SchemaObject;
        inlinedTypes: Record<TypeId, SchemaConverter.ConvertedSchema>;
    }

    export interface Output {
        type: Type;
        referencedTypes: Set<string>;
        inlinedTypes: Record<TypeId, SchemaConverter.ConvertedSchema>;
    }
}

export class OneOfSchemaConverter extends AbstractConverter<
    AbstractConverterContext<object>,
    OneOfSchemaConverter.Output | undefined
> {
    private readonly schema: OpenAPIV3_1.SchemaObject;
    private readonly id: string;

    constructor({ context, breadcrumbs, schema, id, inlinedTypes }: OneOfSchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schema = schema;
        this.id = id;
    }

    public convert(): OneOfSchemaConverter.Output | undefined {
        if (this.shouldConvertAsNullableSchemaOrReference()) {
            return this.convertAsNullableSchemaOrReference();
        }

        const fernDiscriminatedExtension = new FernDiscriminatedExtension({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            node: this.schema
        });
        const isDiscriminated = fernDiscriminatedExtension.convert();

        if (isDiscriminated === false) {
            return this.convertAsUndiscriminatedUnion();
        }

        // If a discriminator is present, always convert as discriminated union
        // This properly handles OpenAPI oneOf with discriminator where the discriminant
        // property is defined in each variant schema
        if (this.schema.discriminator != null) {
            return this.convertAsDiscriminatedUnion();
        }

        // Infer open-ended enums: oneOf/anyOf with [enum, string] pattern
        // This runs after both x-fern-discriminated and discriminator checks so explicit overrides take precedence
        if (this.context.settings.inferForwardCompatible) {
            const openEndedEnum = this.convertAsOpenEndedEnum();
            if (openEndedEnum != null) {
                return openEndedEnum;
            }
        }

        return this.convertAsUndiscriminatedUnion();
    }

    /**
     * Detects the pattern oneOf/anyOf with exactly [enum, string] or [$ref(enum), string]
     * and converts it to a single enum type with forwardCompatible: true.
     */
    private convertAsOpenEndedEnum(): OneOfSchemaConverter.Output | undefined {
        const subSchemas = this.schema.oneOf ?? this.schema.anyOf;
        if (subSchemas == null || subSchemas.length !== 2) {
            return undefined;
        }

        let enumSchema: OpenAPIV3_1.SchemaObject | undefined;
        let hasStringSchema = false;

        for (const subSchema of subSchemas) {
            let resolved: OpenAPIV3_1.SchemaObject | undefined;

            if (this.context.isReferenceObject(subSchema)) {
                const result = this.context.resolveReference<OpenAPIV3_1.SchemaObject>({
                    reference: subSchema,
                    breadcrumbs: this.breadcrumbs,
                    skipErrorCollector: true
                });
                if (result.resolved) {
                    resolved = result.value;
                }
            } else {
                resolved = subSchema;
            }

            if (resolved == null) {
                continue;
            }

            if (
                resolved.enum != null &&
                resolved.enum.length > 1 &&
                (resolved.type === "string" || resolved.type == null)
            ) {
                enumSchema = resolved;
            } else if (resolved.type === "string" && resolved.enum == null) {
                hasStringSchema = true;
            }
        }

        if (enumSchema == null || !hasStringSchema) {
            return undefined;
        }

        const fernEnumConverter = new FernEnumExtension({
            breadcrumbs: this.breadcrumbs,
            schema: enumSchema,
            context: this.context
        });
        const maybeFernEnum = fernEnumConverter.convert();

        const enumConverter = new EnumSchemaConverter({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            schema: enumSchema,
            maybeFernEnum,
            forwardCompatible: true
        });

        const converted = enumConverter.convert();
        if (converted == null) {
            return undefined;
        }

        return {
            ...converted,
            referencedTypes: new Set(),
            inlinedTypes: {}
        };
    }

    /**
     * Filters out the discriminant property from a schema's properties.
     * This is needed when the discriminant is redeclared in variant schemas.
     */
    private filterDiscriminantFromSchema(
        schema: OpenAPIV3_1.SchemaObject,
        discriminantProperty: string
    ): OpenAPIV3_1.SchemaObject {
        if (schema.properties == null || !(discriminantProperty in schema.properties)) {
            return schema;
        }

        const { [discriminantProperty]: _, ...filteredProperties } = schema.properties;
        const filteredRequired = schema.required?.filter((prop) => prop !== discriminantProperty);

        return {
            ...schema,
            properties: filteredProperties,
            required: filteredRequired
        };
    }

    private convertAsDiscriminatedUnion(): OneOfSchemaConverter.Output | undefined {
        if (this.schema.discriminator == null) {
            return undefined;
        }

        const discriminantProperty = this.schema.discriminator.propertyName;
        const unionTypes: SingleUnionType[] = [];
        let referencedTypes: Set<string> = new Set();
        let inlinedTypes: Record<TypeId, SchemaConverter.ConvertedSchema> = {};

        for (const [discriminant, reference] of Object.entries(this.schema.discriminator.mapping ?? {})) {
            const typeId = this.context.getTypeIdFromSchemaReference({ $ref: reference });
            const breadcrumbs = [...this.breadcrumbs, "discriminator", "mapping", discriminant];

            // Resolve the reference to check if it contains the discriminant property
            const resolvedSchema = this.context.resolveReference<OpenAPIV3_1.SchemaObject>({
                reference: { $ref: reference },
                breadcrumbs
            });

            let schemaOrReference: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject = { $ref: reference };

            // If the variant schema contains the discriminant property, filter it out
            // and convert as an inlined schema with the original type ID
            if (
                resolvedSchema.resolved &&
                resolvedSchema.value.properties != null &&
                discriminantProperty in resolvedSchema.value.properties
            ) {
                // Create a filtered schema without the discriminant property
                const filteredSchema = this.filterDiscriminantFromSchema(resolvedSchema.value, discriminantProperty);
                schemaOrReference = filteredSchema;
            }

            const singleUnionTypeSchemaConverter = new SchemaOrReferenceConverter({
                context: this.context,
                schemaOrReference,
                schemaIdOverride: typeId ?? undefined,
                breadcrumbs
            });

            if (typeId != null) {
                referencedTypes.add(typeId);
            }
            const convertedSchema = singleUnionTypeSchemaConverter.convert();
            if (convertedSchema?.type != null && typeId != null) {
                for (const inlinedTypeId of Object.keys(convertedSchema?.inlinedTypes ?? {})) {
                    referencedTypes.add(inlinedTypeId);
                }
                for (const refTypeId of convertedSchema.schema?.typeDeclaration.referencedTypes ?? []) {
                    referencedTypes.add(refTypeId);
                }
                const nameAndWireValue = this.context.casingsGenerator.generateNameAndWireValue({
                    name: discriminant,
                    wireValue: discriminant
                });

                // Extract raw schema name for display (not namespaced)
                const rawSchemaName = reference.split("/").pop() ?? typeId;

                // Extract schema title once for reuse
                const schemaTitle = resolvedSchema.resolved ? resolvedSchema.value.title : undefined;

                // Determine variant display name with fallback priority:
                // 1. Schema's title field (explicit user intention)
                // 2. Discriminant key (e.g., "EMBEDDING_GENERATION")
                // 3. Schema name from $ref or typeId (e.g., "CircleShape")
                const variantDisplayName = schemaTitle ?? discriminant ?? rawSchemaName;

                // Set displayName on the type declaration only when the schema has an explicit title.
                // The discriminant key is context-specific to the union and should not be applied globally.
                if (convertedSchema.schema?.typeDeclaration != null && schemaTitle != null) {
                    convertedSchema.schema.typeDeclaration.name.displayName = schemaTitle;
                }

                unionTypes.push({
                    docs: undefined,
                    discriminantValue: nameAndWireValue,
                    availability: convertedSchema.availability,
                    displayName: variantDisplayName,
                    shape: SingleUnionTypeProperties.samePropertiesAsObject({
                        typeId,
                        name: this.context.casingsGenerator.generateName(rawSchemaName),
                        fernFilepath: {
                            allParts: [],
                            packagePath: [],
                            file: undefined
                        },
                        displayName: variantDisplayName
                    })
                });
                inlinedTypes = {
                    ...inlinedTypes,
                    ...convertedSchema.inlinedTypes
                };
            }
        }

        const {
            convertedProperties: baseProperties,
            referencedTypes: baseReferencedTypes,
            inlinedTypesFromProperties
        } = convertProperties({
            properties: this.schema.properties ?? {},
            required: this.schema.required ?? [],
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            errorCollector: this.context.errorCollector
        });

        referencedTypes = new Set([...referencedTypes, ...baseReferencedTypes]);

        const extends_: DeclaredTypeName[] = [];
        for (const [index, allOfSchema] of (this.schema.allOf ?? []).entries()) {
            const breadcrumbs = [...this.breadcrumbs, "allOf", index.toString()];

            if (this.context.isReferenceObject(allOfSchema)) {
                const maybeTypeReference = this.context.convertReferenceToTypeReference({
                    reference: allOfSchema,
                    breadcrumbs
                });
                if (maybeTypeReference.ok) {
                    const declaredTypeName = this.context.typeReferenceToDeclaredTypeName(maybeTypeReference.reference);
                    if (declaredTypeName != null) {
                        extends_.push(declaredTypeName);
                    }
                }
                const typeId = this.context.getTypeIdFromSchemaReference(allOfSchema);
                if (typeId != null) {
                    referencedTypes.add(typeId);
                }
                continue;
            }
        }

        for (const typeId of Object.keys({ ...inlinedTypes, ...inlinedTypesFromProperties })) {
            referencedTypes.add(typeId);
        }

        return {
            type: Type.union({
                baseProperties,
                discriminant: this.context.casingsGenerator.generateNameAndWireValue({
                    name: this.schema.discriminator.propertyName,
                    wireValue: this.schema.discriminator.propertyName
                }),
                extends: extends_,
                types: unionTypes,
                discriminatorContext: undefined
            }),
            referencedTypes,
            inlinedTypes: {
                ...inlinedTypes,
                ...inlinedTypesFromProperties
            }
        };
    }

    private convertAsUndiscriminatedUnion(): OneOfSchemaConverter.Output | undefined {
        if (
            (!this.schema.oneOf && !this.schema.anyOf) ||
            (this.schema.anyOf?.length === 0 && this.schema.oneOf?.length === 0)
        ) {
            return undefined;
        }

        const unionTypes: UndiscriminatedUnionMember[] = [];
        const referencedTypes: Set<string> = new Set();
        let inlinedTypes: Record<TypeId, SchemaConverter.ConvertedSchema> = {};

        for (const [index, subSchema] of [
            ...(this.schema.oneOf ?? []).entries(),
            ...(this.schema.anyOf ?? []).entries()
        ]) {
            if (this.context.isReferenceObject(subSchema)) {
                let maybeTypeReference;

                if (this.context.isReferenceObjectWithIdentifier(subSchema)) {
                    maybeTypeReference = this.context.convertReferenceToTypeReference({
                        reference: subSchema,
                        displayNameOverride:
                            subSchema.summary ?? subSchema.title ?? subSchema.name ?? subSchema.messageId,
                        displayNameOverrideSource: "reference_identifier"
                    });
                } else {
                    const mappingEntry = this.getDiscriminatorKeyForRef(subSchema);
                    if (mappingEntry != null) {
                        maybeTypeReference = this.context.convertReferenceToTypeReference({
                            reference: subSchema,
                            displayNameOverride: mappingEntry,
                            displayNameOverrideSource: "discriminator_key"
                        });
                    } else {
                        // Standard schema reference - use internal extraction
                        maybeTypeReference = this.context.convertReferenceToTypeReference({
                            reference: subSchema,
                            breadcrumbs: this.breadcrumbs
                        });
                    }
                }

                if (maybeTypeReference.ok) {
                    unionTypes.push({
                        type: maybeTypeReference.reference,
                        docs: subSchema.description
                    });
                }
                const typeId = this.context.getTypeIdFromSchemaReference(subSchema);
                if (typeId != null) {
                    referencedTypes.add(typeId);
                }
                continue;
            }

            const extendedSubSchema = this.extendSubSchema(subSchema);

            const schemaId = this.context.convertBreadcrumbsToName([`${this.id}_${index}`]);
            const displayName = subSchema.title;
            const schemaConverter = new SchemaConverter({
                context: this.context,
                id: schemaId,
                nameOverride: displayName,
                breadcrumbs: [...this.breadcrumbs, `oneOf[${index}]`],
                schema: extendedSubSchema ?? subSchema
            });
            const convertedSchema = schemaConverter.convert();
            if (convertedSchema != null) {
                const typeShape = convertedSchema.convertedSchema.typeDeclaration.shape;
                if (typeShape.type === "alias" && this.typeReferenceIsWrappedPrimitive(typeShape.aliasOf)) {
                    unionTypes.push({
                        type: typeShape.aliasOf,
                        docs: subSchema.description
                    });
                } else if (
                    typeShape.type === "object" &&
                    typeShape.properties.length === 0 &&
                    typeShape.extends.length === 0
                ) {
                    unionTypes.push({
                        type: TypeReference.container(
                            ContainerType.map({
                                keyType: AbstractConverter.STRING,
                                valueType: TypeReference.unknown()
                            })
                        ),
                        docs: subSchema.description
                    });
                } else {
                    unionTypes.push({
                        type: this.context.createNamedTypeReference(schemaId, displayName),
                        docs: subSchema.description
                    });
                    const namespacedSchemaId = this.context.getNamespacedSchemaId(schemaId);
                    inlinedTypes = {
                        ...inlinedTypes,
                        ...convertedSchema.inlinedTypes,
                        [namespacedSchemaId]: convertedSchema.convertedSchema
                    };
                }
                convertedSchema.convertedSchema.typeDeclaration.referencedTypes.forEach((referencedType) => {
                    referencedTypes.add(referencedType);
                });
            }
        }

        return {
            type: Type.undiscriminatedUnion({
                members: unionTypes
            }),
            referencedTypes,
            inlinedTypes
        };
    }

    private shouldConvertAsNullableSchemaOrReference(): boolean {
        if (this.schema.oneOf != null) {
            return this.schema.oneOf.some(
                (subSchema) =>
                    subSchema && typeof subSchema === "object" && "type" in subSchema && subSchema.type === "null"
            );
        } else if (this.schema.anyOf != null) {
            return this.schema.anyOf.some(
                (subSchema) =>
                    subSchema && typeof subSchema === "object" && "type" in subSchema && subSchema.type === "null"
            );
        }
        return false;
    }

    private removeNullFromOneOfOrAnyOf(): OpenAPIV3_1.SchemaObject | undefined {
        const schemaArray = this.schema.oneOf ?? this.schema.anyOf;
        const schemaType = this.schema.oneOf != null ? "oneOf" : "anyOf";

        if (schemaArray == null) {
            return undefined;
        }

        const withoutNull = schemaArray.filter((subSchema) => !("type" in subSchema && subSchema.type === "null"));

        if (withoutNull.length === 0) {
            this.context.errorCollector.collect({
                message: `Received ${schemaType} schema with no valid non-null types`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        if (withoutNull.length === 1) {
            return {
                ...this.schema,
                [schemaType]: undefined,
                ...withoutNull[0]
            };
        }

        return {
            ...this.schema,
            [schemaType]: withoutNull
        };
    }

    private convertAsNullableSchemaOrReference(): OneOfSchemaConverter.Output | undefined {
        const simplifiedSchema = this.removeNullFromOneOfOrAnyOf();
        if (simplifiedSchema == null) {
            return undefined;
        }

        const schemaOrReferenceConverter = new SchemaOrReferenceConverter({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            schemaOrReference: simplifiedSchema
        });
        const convertedSchema = schemaOrReferenceConverter.convert();
        if (convertedSchema == null) {
            return undefined;
        }
        const wrappedType = this.wrapInNullable(convertedSchema.type);
        return {
            type: Type.alias({
                aliasOf: wrappedType,
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                resolvedType: wrappedType as any
            }),
            referencedTypes: convertedSchema.schema?.typeDeclaration.referencedTypes ?? new Set(),
            inlinedTypes: convertedSchema.inlinedTypes
        };
    }

    private typeReferenceIsWrappedPrimitive(type: TypeReference): boolean {
        switch (type.type) {
            case "container":
                return this.containerTypeIsWrappedPrimitive(type.container);
            case "named":
                return false;
            case "primitive":
                return true;
            case "unknown":
                return true;
            default:
                return false;
        }
    }

    private containerTypeIsWrappedPrimitive(type: ContainerType): boolean {
        switch (type.type) {
            case "list":
                return this.typeReferenceIsWrappedPrimitive(type.list);
            case "map":
                return (
                    this.typeReferenceIsWrappedPrimitive(type.keyType) &&
                    this.typeReferenceIsWrappedPrimitive(type.valueType)
                );
            case "nullable":
                return this.typeReferenceIsWrappedPrimitive(type.nullable);
            case "optional":
                return this.typeReferenceIsWrappedPrimitive(type.optional);
            case "set":
                return this.typeReferenceIsWrappedPrimitive(type.set);
            case "literal":
                return true;
            default:
                return false;
        }
    }

    private wrapInNullable(type: TypeReference): TypeReference {
        return TypeReference.container(ContainerType.nullable(type));
    }

    private mergeIntoObjectSchema(
        subSchema: OpenAPIV3_1.SchemaObject,
        topLevelObjectProperties: Record<string, OpenAPIV3_1.SchemaObject>
    ): OpenAPIV3_1.SchemaObject {
        return {
            ...subSchema,
            properties: {
                ...topLevelObjectProperties,
                ...(subSchema.properties ?? {})
            }
        };
    }

    private extendSubSchema(subSchema: OpenAPIV3_1.SchemaObject): OpenAPIV3_1.SchemaObject | undefined {
        if (Object.entries(this.schema.properties ?? {}).length === 0) {
            return subSchema;
        }

        if (subSchema.type === "object") {
            return this.mergeIntoObjectSchema(subSchema, this.schema.properties ?? {});
        }

        if (!this.context.isObjectSchemaType(subSchema)) {
            this.context.errorCollector.collect({
                message: "Received additional object properties for oneOf/anyOf that are not objects",
                path: this.breadcrumbs
            });
        }
        return undefined;
    }

    private getDiscriminatorKeyForRef(subSchema: OpenAPIV3_1.ReferenceObject): string | undefined {
        return Object.entries(this.schema.discriminator?.mapping ?? {}).find(([_, ref]) => ref === subSchema.$ref)?.[0];
    }
}
