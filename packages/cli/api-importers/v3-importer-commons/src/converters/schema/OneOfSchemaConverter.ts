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

import { AbstractConverter, AbstractConverterContext } from "../..";
import { FernDiscriminatedExtension } from "../../extensions/x-fern-discriminated";
import { convertProperties } from "../../utils/ConvertProperties";
import { SchemaConverter } from "./SchemaConverter";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter";

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

        const hasDiscriminator = this.schema.discriminator != null;
        const hasMapping = hasDiscriminator && Object.keys(this.schema.discriminator.mapping ?? {}).length > 0;
        const hasPropertyName = hasDiscriminator && this.schema.discriminator.propertyName != null;

        if (hasMapping || hasPropertyName) {
            return this.convertAsDiscriminatedUnion();
        }

        return this.convertAsUndiscriminatedUnion();
    }

    private unionVariantsContainLiteral({ discriminantProperty }: { discriminantProperty: string }): boolean {
        for (const [_, reference] of Object.entries(this.schema.discriminator?.mapping ?? {})) {
            const schema = this.context.resolveReference<OpenAPIV3_1.SchemaObject>({
                reference: { $ref: reference },
                breadcrumbs: this.breadcrumbs
            });
            if (schema.resolved && !Object.keys(schema.value.properties ?? {}).includes(discriminantProperty)) {
                return false;
            }
        }
        return true;
    }

    private convertAsDiscriminatedUnion(): OneOfSchemaConverter.Output | undefined {
        if (this.schema.discriminator == null) {
            return undefined;
        }

        const unionTypes: SingleUnionType[] = [];
        let referencedTypes: Set<string> = new Set();
        let inlinedTypes: Record<TypeId, SchemaConverter.ConvertedSchema> = {};

        for (const [discriminant, reference] of Object.entries(this.schema.discriminator.mapping ?? {})) {
            const singleUnionTypeSchemaConverter = new SchemaOrReferenceConverter({
                context: this.context,
                schemaOrReference: { $ref: reference },
                breadcrumbs: [...this.breadcrumbs, "discriminator", "mapping", discriminant]
            });
            const typeId = this.context.getTypeIdFromSchemaReference({ $ref: reference });
            if (typeId != null) {
                referencedTypes.add(typeId);
            }
            const convertedSchema = singleUnionTypeSchemaConverter.convert();
            if (convertedSchema?.type != null && typeId != null) {
                for (const typeId of Object.keys(convertedSchema?.inlinedTypes ?? {})) {
                    referencedTypes.add(typeId);
                }
                for (const typeId of convertedSchema.schema?.typeDeclaration.referencedTypes ?? []) {
                    referencedTypes.add(typeId);
                }
                const nameAndWireValue = this.context.casingsGenerator.generateNameAndWireValue({
                    name: discriminant,
                    wireValue: discriminant
                });

                const resolved = this.context.resolveReference<OpenAPIV3_1.SchemaObject>({
                    reference: { $ref: reference },
                    breadcrumbs: [...this.breadcrumbs, "discriminator", "mapping", discriminant]
                });
                const variantDocs = resolved.resolved ? resolved.value.description : undefined;

                unionTypes.push({
                    docs: variantDocs,
                    discriminantValue: nameAndWireValue,
                    availability: convertedSchema.availability,
                    displayName: discriminant,
                    shape: SingleUnionTypeProperties.samePropertiesAsObject({
                        typeId,
                        name: this.context.casingsGenerator.generateName(typeId),
                        fernFilepath: {
                            allParts: [],
                            packagePath: [],
                            file: undefined
                        },
                        displayName: discriminant
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

        const discriminantProperty = this.inferDiscriminantProperty();
        if (discriminantProperty == null) {
            this.context.errorCollector.addError({
                message: "Cannot determine discriminant property for discriminated union",
                breadcrumbs: this.breadcrumbs
            });
            return undefined;
        }

        return {
            type: Type.union({
                baseProperties,
                discriminant: this.context.casingsGenerator.generateNameAndWireValue({
                    name: discriminantProperty,
                    wireValue: discriminantProperty
                }),
                extends: extends_,
                types: unionTypes
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

        // Collect all inlined object schemas for better naming
        const allInlinedSchemas = [...(this.schema.oneOf ?? []), ...(this.schema.anyOf ?? [])].filter(
            (schema) => !this.context.isReferenceObject(schema)
        ) as OpenAPIV3_1.SchemaObject[];

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
                } else if (this.getDiscriminatorKeyForRef(subSchema) != null) {
                    const mappingEntry = this.getDiscriminatorKeyForRef(subSchema);
                    maybeTypeReference = this.context.convertReferenceToTypeReference({
                        reference: subSchema,
                        displayNameOverride: mappingEntry,
                        displayNameOverrideSource: "discriminator_key"
                    });
                } else {
                    maybeTypeReference = this.context.convertReferenceToTypeReference({
                        reference: subSchema,
                        displayNameOverride: subSchema.$ref.split("/").pop(),
                        displayNameOverrideSource: "schema_identifier"
                    });
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
                } else if (typeShape.type === "object" && typeShape.properties.length === 0) {
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
                    inlinedTypes = {
                        ...inlinedTypes,
                        ...convertedSchema.inlinedTypes,
                        [schemaId]: convertedSchema.convertedSchema
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

    private inferDiscriminantProperty(): string | undefined {
        if (this.schema.discriminator?.propertyName != null) {
            return this.schema.discriminator.propertyName;
        }

        const mapping = this.schema.discriminator?.mapping ?? {};
        const mappingEntries = Object.entries(mapping);
        
        if (mappingEntries.length === 0) {
            return undefined;
        }

        // Collect all properties from all mapped schemas
        const propertyNames = new Set<string>();
        for (const [discriminantValue, reference] of mappingEntries) {
            const resolved = this.context.resolveReference<OpenAPIV3_1.SchemaObject>({
                reference: { $ref: reference },
                breadcrumbs: [...this.breadcrumbs, "discriminator", "mapping", discriminantValue]
            });
            
            if (resolved.resolved && resolved.value.properties) {
                for (const propName of Object.keys(resolved.value.properties)) {
                    propertyNames.add(propName);
                }
            }
        }

        for (const propName of propertyNames) {
            let isCommonDiscriminant = true;
            
            for (const [discriminantValue, reference] of mappingEntries) {
                const resolved = this.context.resolveReference<OpenAPIV3_1.SchemaObject>({
                    reference: { $ref: reference },
                    breadcrumbs: [...this.breadcrumbs, "discriminator", "mapping", discriminantValue]
                });
                
                if (!resolved.resolved) {
                    isCommonDiscriminant = false;
                    break;
                }

                const prop = resolved.value.properties?.[propName];
                if (!prop) {
                    isCommonDiscriminant = false;
                    break;
                }

                const hasConstOrEnum = 
                    ('const' in prop) || 
                    ('enum' in prop && Array.isArray(prop.enum) && prop.enum.length > 0);
                
                if (!hasConstOrEnum) {
                    isCommonDiscriminant = false;
                    break;
                }
            }

            if (isCommonDiscriminant) {
                return propName;
            }
        }

        return undefined;
    }
}
