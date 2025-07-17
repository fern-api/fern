import { OpenAPIV3_1 } from "openapi-types";

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

        if (
            this.schema.discriminator != null &&
            !this.unionVariantsContainLiteral({
                discriminantProperty: this.schema.discriminator.propertyName
            })
        ) {
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

                unionTypes.push({
                    docs: undefined,
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

        return {
            type: Type.union({
                baseProperties,
                discriminant: this.context.casingsGenerator.generateNameAndWireValue({
                    name: this.schema.discriminator.propertyName,
                    wireValue: this.schema.discriminator.propertyName
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
        const allInlinedSchemas = [
            ...(this.schema.oneOf ?? []),
            ...(this.schema.anyOf ?? [])
        ].filter(schema => !this.context.isReferenceObject(schema)) as OpenAPIV3_1.SchemaObject[];

        for (const [index, subSchema] of [
            ...(this.schema.oneOf ?? []).entries(),
            ...(this.schema.anyOf ?? []).entries()
        ]) {
            if (this.context.isReferenceObject(subSchema)) {
                let maybeTypeReference;

                if (this.context.isReferenceObjectWithIdentifier(subSchema)) {
                    maybeTypeReference = this.context.convertReferenceToTypeReference({
                        reference: subSchema,
                        displayNameOverride: subSchema.title ?? subSchema.name ?? subSchema.messageId,
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
                        displayNameOverride: subSchema.$ref,
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
            const displayName = this.generateDisplayNameForInlinedObject(subSchema, index, allInlinedSchemas);
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

    /**
     * Generates a meaningful display name for inlined union variants using a heuristic:
     * 1. Try description first
     * 2. Try title
     * 3. For object schemas, generate name from distinctive properties
     * 4. Fall back to undefined (will use auto-generated name)
     */
    private generateDisplayNameForInlinedObject(
        subSchema: OpenAPIV3_1.SchemaObject,
        index: number,
        allVariants: OpenAPIV3_1.SchemaObject[]
    ): string | undefined {
        // Try description first
        if (subSchema.description) {
            const nameFromDescription = this.cleanDescriptionForDisplayName(subSchema.description);
            if (nameFromDescription) {
                return nameFromDescription;
            }
        }

        // Try title
        if (subSchema.title) {
            return subSchema.title;
        }

        // For object schemas, try to generate name from properties
        if (subSchema.type === "object" && subSchema.properties && Object.keys(subSchema.properties).length > 0) {
            const nameFromProperties = this.generateNameFromObjectProperties(subSchema, allVariants);
            if (nameFromProperties) {
                return nameFromProperties;
            }
        }

        // Fall back to undefined (will use auto-generated name)
        return undefined;
    }

    /**
     * Cleans up a description string to make it a valid display name
     */
    private cleanDescriptionForDisplayName(description: string): string | undefined {
        // Take first sentence, clean it up, make it a valid identifier
        const firstSentence = description?.split('.')[0]?.trim();
        if (!firstSentence) {
            return undefined;
        }

        // Comprehensive function words to exclude from naming
        const functionWords = new Set([
            // Articles
            'a', 'an', 'the',
            // Conjunctions
            'and', 'or', 'but', 'nor', 'yet', 'so',
            // Prepositions
            'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 
            'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 
            'among', 'under', 'over', 'across', 'against', 'along', 'around', 'behind',
            'beneath', 'beside', 'beyond', 'down', 'inside', 'near', 'off', 'outside',
            'since', 'toward', 'until', 'upon', 'within', 'without',
            // Auxiliary verbs
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
            'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
            'must', 'can', 'shall',
            // Pronouns
            'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
            // Question words
            'when', 'where', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose',
            // Generic verbs/participles that don't add meaning
            'used', 'using', 'containing', 'including', 'having', 'showing', 'providing',
            'created', 'generated', 'processed', 'stored', 'managed', 'handled', 'returned',
            'sent', 'received', 'given', 'taken', 'made', 'done', 'called', 'named',
            // Generic adjectives/adverbs
            'available', 'current', 'existing', 'present', 'new', 'old', 'main', 'primary',
            'secondary', 'additional', 'extra', 'special', 'specific', 'general', 'common',
            'basic', 'simple', 'complex', 'full', 'empty', 'complete', 'partial',
            // Other meaningless connectors
            'also', 'then', 'now', 'here', 'there', 'only', 'just', 'even', 'still',
            'already', 'always', 'never', 'sometimes', 'often', 'usually', 'mostly'
        ]);

        const meaningfulWords = firstSentence
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0)
            .filter(word => !functionWords.has(word.toLowerCase())) // Remove function words
            .slice(0, 4); // Take max 4 meaningful words

        if (meaningfulWords.length === 0) {
            return undefined;
        }

        // Improve word ordering for better semantic meaning
        const reorderedWords = this.reorderWordsForBetterSemantics(meaningfulWords);
        
        const cleaned = reorderedWords
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');

        return cleaned.length > 0 ? cleaned : undefined;
    }

    /**
     * Reorders words to create better semantic meaning in generated names
     */
    private reorderWordsForBetterSemantics(words: string[]): string[] {
        if (words.length <= 2) {
            return words; // Short phrases are usually fine as-is
        }

        // More conservative reordering - only move modifying entities to the end
        const modifyingEntities = new Set(['system', 'service', 'api']);
        const descriptiveTypes = new Set(['object', 'method', 'function', 'interface', 'model']);
        
        const reordered: string[] = [];
        const modifiers: string[] = [];
        
        // First pass: collect main concepts and modifiers
        words.forEach(word => {
            const lowerWord = word.toLowerCase();
            if (modifyingEntities.has(lowerWord)) {
                modifiers.push(word); // Move system/service to end
            } else if (descriptiveTypes.has(lowerWord) && reordered.length > 0) {
                // Move generic types after the main concept
                reordered.splice(1, 0, word);
            } else {
                reordered.push(word);
            }
        });
        
        // Add modifiers at the end
        reordered.push(...modifiers);
        
        return reordered;
    }

    /**
     * Generates a name based on distinctive properties of an object schema
     */
    private generateNameFromObjectProperties(
        schema: OpenAPIV3_1.SchemaObject,
        allVariants: OpenAPIV3_1.SchemaObject[]
    ): string | undefined {
        const schemaProperties = schema.properties;
        if (!schemaProperties) {
            return undefined;
        }
        
        const properties = Object.keys(schemaProperties);
        
        if (properties.length === 0) {
            return undefined;
        }

        // Find properties that are unique to this variant
        const uniqueProperties = this.findUniqueProperties(schema, allVariants);
        
        if (uniqueProperties.length > 0) {
            // Prioritize the most significant unique properties
            const significantUniqueProperties = this.getMostSignificantProperties(uniqueProperties);
            const nameParts = significantUniqueProperties
                .slice(0, 1) // Take only the most significant unique property for cleaner names
                .map(prop => this.capitalizePropertyName(prop));
            
            if (nameParts.length > 0) {
                return nameParts.join('');
            }
        }

        // If no unique properties, use the most significant properties
        const significantProperties = this.getMostSignificantProperties(properties);
        if (significantProperties.length > 0) {
            const nameParts = significantProperties
                .slice(0, 1) // Take only the most significant property for cleaner names
                .map(prop => this.capitalizePropertyName(prop));
            return nameParts.join('');
        }

        return undefined;
    }

    /**
     * Finds properties that are unique to this schema compared to other variants
     */
    private findUniqueProperties(
        schema: OpenAPIV3_1.SchemaObject,
        allVariants: OpenAPIV3_1.SchemaObject[]
    ): string[] {
        const schemaProperties = schema.properties;
        if (!schemaProperties) {
            return [];
        }

        const thisProperties = new Set(Object.keys(schemaProperties));
        const otherProperties = new Set<string>();

        // Collect all properties from other variants
        allVariants.forEach(variant => {
            if (variant !== schema && variant.type === "object" && variant.properties) {
                const variantProperties = variant.properties;
                if (variantProperties) {
                    Object.keys(variantProperties).forEach(prop => {
                        otherProperties.add(prop);
                    });
                }
            }
        });

        // Return properties that are unique to this variant
        return Array.from(thisProperties).filter(prop => !otherProperties.has(prop));
    }

    /**
     * Gets the most significant properties from a list, prioritizing common business terms
     */
    private getMostSignificantProperties(properties: string[]): string[] {
        // High-priority business/API terms that are very meaningful for naming
        const highPriorityTerms = [
            'status', 'error', 'type', 'kind', 'mode', 'state', 'action', 'method',
            'enabled', 'disabled', 'active', 'inactive', 'success', 'failed'
        ];
        
        // Medium-priority terms that are meaningful but less specific
        const mediumPriorityTerms = [
            'config', 'configuration', 'setting', 'option', 'message', 'code',
            'user', 'account', 'profile', 'auth', 'token', 'key',
            'response', 'request', 'result', 'output', 'input', 'payload', 'body'
        ];
        
        // Lower-priority terms that are generic but still useful
        const lowPriorityTerms = [
            'name', 'id', 'value', 'data', 'info'
        ];
        
        // Calculate significance score for each property
        const scoredProperties = properties.map(prop => {
            const lowerProp = prop.toLowerCase();
            let score = 0;
            
            // Check high-priority terms first
            for (const term of highPriorityTerms) {
                if (lowerProp === term) {
                    score += 15; // High priority exact match
                } else if (lowerProp.includes(term)) {
                    score += 10; // High priority partial match
                }
            }
            
            // Check medium-priority terms
            for (const term of mediumPriorityTerms) {
                if (lowerProp === term) {
                    score += 8; // Medium priority exact match
                } else if (lowerProp.includes(term)) {
                    score += 5; // Medium priority partial match
                }
            }
            
            // Check low-priority terms
            for (const term of lowPriorityTerms) {
                if (lowerProp === term) {
                    score += 3; // Low priority exact match
                } else if (lowerProp.includes(term)) {
                    score += 2; // Low priority partial match
                }
            }
            
            // Shorter property names are often more significant (but less important than semantic meaning)
            score += Math.max(0, 5 - prop.length);
            
            return { prop, score };
        });
        
        // Sort by score (highest first), then alphabetically
        return scoredProperties
            .sort((a, b) => {
                if (a.score !== b.score) return b.score - a.score;
                return a.prop.localeCompare(b.prop);
            })
            .map(item => item.prop);
    }

    /**
     * Capitalizes a property name for use in display names
     */
    private capitalizePropertyName(prop: string): string {
        // Handle camelCase and snake_case
        if (prop.includes('_')) {
            return prop.split('_')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join('');
        } else {
            // Assume camelCase, just capitalize first letter
            return prop.charAt(0).toUpperCase() + prop.slice(1);
        }
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
