import { anyOfIsPresenceConstraint } from "@fern-api/core-utils";
import * as FernIr from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { AbstractConverter, AbstractConverterContext, Extensions } from "../../index.js";
import { createTypeReferenceFromFernType } from "../../utils/CreateTypeReferenceFromFernType.js";
import { ExampleConverter } from "../ExampleConverter.js";
import { ArraySchemaConverter } from "./ArraySchemaConverter.js";
import { EnumSchemaConverter } from "./EnumSchemaConverter.js";
import { MapSchemaConverter } from "./MapSchemaConverter.js";
import { mergeAllOfSchemas } from "./mergeAllOfSchemas.js";
import { ObjectSchemaConverter } from "./ObjectSchemaConverter.js";
import { OneOfSchemaConverter } from "./OneOfSchemaConverter.js";
import { PrimitiveSchemaConverter } from "./PrimitiveSchemaConverter.js";

const TYPE_INVARIANT_KEYS = [
    "description",
    "example",
    "title",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "xml",
    "externalDocs",
    "extensions"
];

export declare namespace SchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        id: string;
        schema: OpenAPIV3_1.SchemaObject;
        inlined?: boolean;
        nameOverride?: string;
        visitedRefs?: Set<string>;
    }

    export interface ConvertedSchema {
        typeDeclaration: FernIr.TypeDeclaration;
        audiences: string[];
        propertiesByAudience: Record<string, Set<string>>;
    }

    export interface Output {
        convertedSchema: ConvertedSchema;
        inlinedTypes: Record<FernIr.TypeId, ConvertedSchema>;
    }
}

export class SchemaConverter extends AbstractConverter<AbstractConverterContext<object>, SchemaConverter.Output> {
    /** Upper bound on the variants produced by distributing an allOf over its unions. */
    private static readonly MAX_DISTRIBUTED_VARIANTS = 64;

    private readonly schema: OpenAPIV3_1.SchemaObject;
    private readonly id: string;
    private readonly inlined: boolean;
    private readonly audiences: string[];
    private readonly nameOverride?: string;
    private readonly visitedRefs: Set<string>;

    constructor({
        context,
        breadcrumbs,
        schema,
        id,
        inlined = false,
        nameOverride,
        visitedRefs
    }: SchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schema = schema;
        this.id = id;
        this.inlined = inlined;
        this.nameOverride = nameOverride;
        this.visitedRefs = visitedRefs ?? new Set<string>();
        this.audiences =
            this.context.getAudiences({
                operation: this.schema,
                breadcrumbs: this.breadcrumbs
            }) ?? [];
    }

    public convert(): SchemaConverter.Output | undefined {
        const maybeConvertedFernTypeDeclaration = this.tryConvertFernTypeDeclaration();
        if (maybeConvertedFernTypeDeclaration != null) {
            return maybeConvertedFernTypeDeclaration;
        }

        const maybeConvertedEnumSchema = this.tryConvertEnumSchema();
        if (maybeConvertedEnumSchema != null) {
            return maybeConvertedEnumSchema;
        }

        const maybeDistributedAllOfOverOneOf = this.tryDistributeAllOfOverOneOf();
        if (maybeDistributedAllOfOverOneOf != null) {
            return maybeDistributedAllOfOverOneOf;
        }

        const maybeConvertedSingularAllOfSchema = this.tryConvertSingularAllOfSchema();
        if (maybeConvertedSingularAllOfSchema != null) {
            return maybeConvertedSingularAllOfSchema;
        }

        const maybeConvertedPrimitiveSchema = this.tryConvertPrimitiveSchema();
        if (maybeConvertedPrimitiveSchema != null) {
            return maybeConvertedPrimitiveSchema;
        }

        const maybeConvertedArraySchema = this.tryConvertArraySchema();
        if (maybeConvertedArraySchema != null) {
            return maybeConvertedArraySchema;
        }

        const maybeConvertedTypeArraySchema = this.tryConvertTypeArraySchema();
        if (maybeConvertedTypeArraySchema != null) {
            return maybeConvertedTypeArraySchema;
        }

        const maybeConvertedSiblingAnyOfConstraint = this.tryConvertSiblingAnyOfConstraint();
        if (maybeConvertedSiblingAnyOfConstraint != null) {
            return maybeConvertedSiblingAnyOfConstraint;
        }

        const maybeConvertedOneOfAnyOfSchema = this.tryConvertOneOfAnyOfSchema();
        if (maybeConvertedOneOfAnyOfSchema != null) {
            return maybeConvertedOneOfAnyOfSchema;
        }

        const maybeConvertedMapSchema = this.tryConvertMapSchema();
        if (maybeConvertedMapSchema != null) {
            return maybeConvertedMapSchema;
        }

        const maybeConvertedDiscriminatorMappingSchema = this.tryConvertDiscriminatorMappingSchema();
        if (maybeConvertedDiscriminatorMappingSchema != null) {
            return maybeConvertedDiscriminatorMappingSchema;
        }

        const maybeConvertedObjectAllOfSchema = this.tryConvertObjectAllOfSchema();
        if (maybeConvertedObjectAllOfSchema != null) {
            return maybeConvertedObjectAllOfSchema;
        }

        const maybeConvertedUntypedSchema = this.tryConvertUntypedSchema();
        if (maybeConvertedUntypedSchema != null) {
            return maybeConvertedUntypedSchema;
        }

        this.context.errorCollector.collect({
            message: `Failed to convert schema object: ${JSON.stringify(this.schema, null, 2)}`,
            path: this.breadcrumbs
        });
        return undefined;
    }

    private tryConvertEnumSchema(): SchemaConverter.Output | undefined {
        if (!this.schema.enum?.length) {
            return undefined;
        }
        const fernEnumConverter = new Extensions.FernEnumExtension({
            breadcrumbs: this.breadcrumbs,
            schema: this.schema,
            context: this.context
        });
        const maybeFernEnum = fernEnumConverter.convert();

        const enumConverter = new EnumSchemaConverter({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            schema: this.schema,
            maybeFernEnum
        });
        const enumType = enumConverter.convert();
        if (enumType != null) {
            return {
                convertedSchema: {
                    typeDeclaration: this.createTypeDeclaration({
                        shape: enumType.type,
                        referencedTypes: new Set()
                    }),
                    audiences: this.audiences,
                    propertiesByAudience: {}
                },
                inlinedTypes: {}
            };
        }
        return undefined;
    }

    private tryConvertSingularAllOfSchema(): SchemaConverter.Output | undefined {
        if (
            this.schemaOnlyHasAllowedKeys(["allOf", "type", "title"]) &&
            this.schema.allOf?.length === 1 &&
            this.schema.allOf[0] != null
        ) {
            const allOfElement = this.schema.allOf[0];

            // Guard against single-element allOf cycles (e.g. A → B → A via single-element allOf chains)
            if (this.context.isReferenceObject(allOfElement)) {
                const refPath = allOfElement.$ref;
                if (this.visitedRefs.has(refPath)) {
                    return undefined;
                }
            }

            const allOfSchema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                schemaOrReference: allOfElement,
                breadcrumbs: this.breadcrumbs
            });

            if (allOfSchema != null) {
                const visitedRefsForChild = this.context.isReferenceObject(allOfElement)
                    ? new Set<string>([...this.visitedRefs, allOfElement.$ref])
                    : this.visitedRefs;

                const allOfConverter = new SchemaConverter({
                    context: this.context,
                    breadcrumbs: [...this.breadcrumbs, "allOf", "0"],
                    schema: allOfSchema,
                    id: this.id,
                    inlined: this.inlined,
                    visitedRefs: visitedRefsForChild
                });

                const allOfResult = allOfConverter.convert();

                if (allOfResult?.convertedSchema.typeDeclaration?.shape.type !== "object") {
                    // Propagate outer schema metadata (description, deprecated, etc.)
                    // that would otherwise be lost since allOfConverter got the child schema
                    if (allOfResult != null) {
                        const decl = allOfResult.convertedSchema.typeDeclaration;
                        if (this.schema.description != null && decl.docs == null) {
                            decl.docs = this.schema.description;
                        }
                        const outerAvailability = this.context.getAvailability({
                            node: this.schema,
                            breadcrumbs: this.breadcrumbs
                        });
                        if (outerAvailability != null && decl.availability == null) {
                            decl.availability = outerAvailability;
                        }
                    }
                    return allOfResult;
                }
            }
        }

        const shouldMergeAllOf =
            this.schemaOnlyHasAllowedKeys(["allOf", "type", "title"]) &&
            Array.isArray(this.schema.allOf) &&
            this.schema.allOf.length >= 1;

        if (shouldMergeAllOf) {
            const localResolvedRefs = new Set<string>();
            const resolvedElements: OpenAPIV3_1.SchemaObject[] = [];
            let hasCycle = false;

            for (const allOfSchema of this.schema.allOf ?? []) {
                let schemaToMerge: OpenAPIV3_1.SchemaObject;

                if (this.context.isReferenceObject(allOfSchema)) {
                    const refPath = allOfSchema.$ref;
                    // Check ancestor set for true cross-schema cycles
                    if (this.visitedRefs.has(refPath)) {
                        hasCycle = true;
                        break;
                    }
                    // Skip same-array duplicates (e.g. allOf: [$ref:Base, $ref:Base])
                    // without triggering the cycle breaker
                    if (localResolvedRefs.has(refPath)) {
                        continue;
                    }
                    localResolvedRefs.add(refPath);

                    const resolved = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                        schemaOrReference: allOfSchema,
                        breadcrumbs: this.breadcrumbs
                    });
                    if (resolved == null) {
                        return undefined;
                    }
                    schemaToMerge = resolved;
                } else {
                    schemaToMerge = allOfSchema;
                }

                // Handle bare oneOf/anyOf elements used for mutual exclusion patterns
                // (e.g., oneOf with variants containing `not: {}` properties).
                // Flatten variant properties into the merged schema as optional properties.
                const variants = schemaToMerge.oneOf ?? schemaToMerge.anyOf;
                if (
                    !this.context.isReferenceObject(allOfSchema) &&
                    variants != null &&
                    schemaToMerge.type == null &&
                    schemaToMerge.properties == null
                ) {
                    const flattenedProperties: Record<string, unknown> = {};
                    for (const variantSchemaOrRef of variants) {
                        const variantSchema = this.context.isReferenceObject(variantSchemaOrRef)
                            ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                                  schemaOrReference: variantSchemaOrRef,
                                  breadcrumbs: this.breadcrumbs
                              })
                            : variantSchemaOrRef;
                        if (variantSchema == null) {
                            continue;
                        }
                        for (const [key, propertySchema] of Object.entries(variantSchema.properties ?? {})) {
                            // Filter out properties with `not: {}` schema (meaning "property must not exist")
                            if (
                                !this.context.isReferenceObject(
                                    propertySchema as OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
                                ) &&
                                "not" in (propertySchema as OpenAPIV3_1.SchemaObject)
                            ) {
                                continue;
                            }
                            if (!(key in flattenedProperties)) {
                                flattenedProperties[key] = propertySchema;
                            }
                        }
                    }
                    if (Object.keys(flattenedProperties).length > 0) {
                        resolvedElements.push({ properties: flattenedProperties } as OpenAPIV3_1.SchemaObject);
                    }
                    continue;
                }

                resolvedElements.push(schemaToMerge);
            }

            // If a circular reference was detected, fall back to the ObjectSchemaConverter path
            if (hasCycle) {
                return undefined;
            }

            const mergedSchema = mergeAllOfSchemas(this.schema, resolvedElements, (ref) => {
                const resolved = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                    schemaOrReference: ref,
                    breadcrumbs: this.breadcrumbs
                });
                // Skip if result is still a reference (e.g. URL ref alias)
                if (resolved != null && this.context.isReferenceObject(resolved)) {
                    return undefined;
                }
                return resolved;
            });

            const allResolvedRefs = new Set<string>([...this.visitedRefs, ...localResolvedRefs]);
            const mergedConverter = new SchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: mergedSchema,
                id: this.id,
                inlined: this.inlined,
                visitedRefs: allResolvedRefs
            });
            return mergedConverter.convert();
        }

        return undefined;
    }

    /**
     * Distributes an allOf whose members include a union over that union, so that
     * `allOf: [oneOf: [A, B], S]` is converted as `oneOf: [allOf: [A, S], allOf: [B, S]]`.
     * Otherwise the union member is flattened into the parent object and its variants are lost.
     *
     * Only the first union is distributed here; the remaining allOf members are re-injected into
     * every variant, so any further unions are distributed by the recursive conversion below.
     */
    private tryDistributeAllOfOverOneOf(): SchemaConverter.Output | undefined {
        if (!this.context.settings.preserveOneOfInAllOf) {
            return undefined;
        }
        const allOf = this.schema.allOf;
        if (!Array.isArray(allOf) || allOf.length === 0) {
            return undefined;
        }
        // A union declared alongside the allOf intersects with it; distributing would drop it.
        if (this.schema.oneOf != null || this.schema.anyOf != null) {
            return undefined;
        }

        const unions = this.getDistributableUnions(allOf);
        const firstUnion = unions[0];
        if (firstUnion == null) {
            return undefined;
        }
        // Every union multiplies the variant count, since the others are redistributed per variant.
        const variantCount = unions.reduce((count, union) => count * union.variants.length, 1);
        if (variantCount > SchemaConverter.MAX_DISTRIBUTED_VARIANTS) {
            this.context.logger.warn(
                `Not distributing allOf over its ${unions.length} unions at ${this.breadcrumbs.join(".")}: ` +
                    `it would produce ${variantCount} variants (max ${SchemaConverter.MAX_DISTRIBUTED_VARIANTS}).`
            );
            return undefined;
        }

        const sharedElements: (OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject)[] = allOf.filter(
            (_, index) => index !== firstUnion.index
        );
        if (this.schema.properties != null || this.schema.required != null) {
            sharedElements.push({
                type: "object",
                properties: this.schema.properties,
                required: this.schema.required
            });
        }

        const siblings: OpenAPIV3_1.SchemaObject = { ...this.schema };
        delete siblings.allOf;
        delete siblings.properties;
        delete siblings.required;

        const distributedConverter = new SchemaConverter({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            schema: {
                ...siblings,
                oneOf: firstUnion.variants.map((variant) => {
                    // The wrapper takes the variant's place in the union, so it has to carry the
                    // variant's title for the variant to stay named in docs and generated SDKs.
                    const title = this.getVariantTitle(variant);
                    return { ...(title != null ? { title } : {}), allOf: [variant, ...sharedElements] };
                })
            },
            id: this.id,
            inlined: this.inlined,
            nameOverride: this.nameOverride,
            visitedRefs: this.visitedRefs
        });
        return distributedConverter.convert();
    }

    private getVariantTitle(variant: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): string | undefined {
        if (!this.context.isReferenceObject(variant)) {
            return variant.title;
        }
        const resolved = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
            schemaOrReference: variant,
            breadcrumbs: this.breadcrumbs
        });
        return resolved?.title ?? variant.$ref.split("/").pop();
    }

    /**
     * The allOf members that are plain unions of the parent's shape, in declaration order.
     */
    private getDistributableUnions(
        allOf: (OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject)[]
    ): { index: number; variants: (OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject)[] }[] {
        const unions: { index: number; variants: (OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject)[] }[] = [];
        for (const [index, element] of allOf.entries()) {
            const resolved = this.context.isReferenceObject(element)
                ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                      schemaOrReference: element,
                      breadcrumbs: this.breadcrumbs
                  })
                : element;
            if (resolved == null || resolved.properties != null) {
                continue;
            }
            // Anything but a plain object wrapper (e.g. a nullable union) carries extra semantics
            // that the distributed variants would not preserve.
            if (resolved.type != null && resolved.type !== "object") {
                continue;
            }
            // Discriminated unions retain their discriminator only when left intact.
            if (resolved.discriminator != null) {
                continue;
            }
            const variants = resolved.oneOf ?? resolved.anyOf;
            if (variants == null || variants.length === 0) {
                continue;
            }
            unions.push({ index, variants });
        }
        return unions;
    }

    private tryConvertPrimitiveSchema(): SchemaConverter.Output | undefined {
        const primitiveConverter = new PrimitiveSchemaConverter({ context: this.context, schema: this.schema });
        const primitiveType = primitiveConverter.convert();
        if (primitiveType != null) {
            return {
                convertedSchema: {
                    typeDeclaration: this.createTypeDeclaration({
                        shape: FernIr.Type.alias({
                            aliasOf: primitiveType,
                            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                            resolvedType: primitiveType as any
                        }),
                        referencedTypes: new Set()
                    }),
                    audiences: this.audiences,
                    propertiesByAudience: {}
                },
                inlinedTypes: {}
            };
        }
        return undefined;
    }

    private tryConvertArraySchema(): SchemaConverter.Output | undefined {
        if (this.schema.type === "array") {
            const arrayConverter = new ArraySchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema
            });
            const arrayType = arrayConverter.convert();
            if (arrayType != null) {
                return {
                    convertedSchema: {
                        typeDeclaration: this.createTypeDeclaration({
                            shape: FernIr.Type.alias({
                                aliasOf: arrayType.typeReference,
                                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                                resolvedType: arrayType.typeReference as any
                            }),
                            referencedTypes: arrayType.referencedTypes
                        }),
                        audiences: this.audiences,
                        propertiesByAudience: {}
                    },
                    inlinedTypes: arrayType.inlinedTypes
                };
            }
        }
        return undefined;
    }

    private tryConvertTypeArraySchema(): SchemaConverter.Output | undefined {
        if (Array.isArray(this.schema.type) && this.schema.type.length > 0) {
            if (this.schema.type.length === 1) {
                this.schema.type = this.schema.type[0];
            } else {
                this.schema.oneOf = this.schema.type.map((type) => ({
                    type: type as OpenAPIV3_1.NonArraySchemaObjectType
                }));
                this.schema.type = undefined;
            }
            return this.convert();
        }
        return undefined;
    }

    /**
     * A schema may declare `properties` alongside an `anyOf` whose branches only
     * re-declare some of those same properties as required, for example:
     *
     *     type: object
     *     properties: { a: {...}, b: {...} }
     *     anyOf:
     *       - { properties: { a: {...} }, required: [a] }
     *       - { properties: { b: {...} }, required: [b] }
     *
     * Per JSON Schema an instance must satisfy both keywords, so the `anyOf` here
     * is a validation constraint -- "at least one of a, b" -- and not a set of
     * variants. Converting it as a union discards the sibling `properties`
     * entirely and makes the variants mutually exclusive, so a body carrying both
     * `a` and `b` silently loses one on the wire.
     *
     * Drop the `anyOf` and convert the schema as the object it declares. The "at
     * least one" constraint is not expressible in the IR and is not enforced.
     *
     * This only applies when every branch is an inline object whose properties are
     * a subset of the sibling `properties`. A branch that introduces a property,
     * or is a reference, is a genuine variant and is left to the union converter.
     *
     * Gated behind the `any-of-sibling-properties-as-object` setting.
     */
    private tryConvertSiblingAnyOfConstraint(): SchemaConverter.Output | undefined {
        if (!this.context.settings.anyOfSiblingPropertiesAsObject) {
            return undefined;
        }
        if (!anyOfIsPresenceConstraint(this.schema)) {
            return undefined;
        }

        this.context.logger.debug(
            `Treating the anyOf at ${this.breadcrumbs.join(".")} as an "at least one of" constraint ` +
                `over its sibling properties rather than a union, and converting the schema as an object.`
        );

        // Convert a copy rather than mutating this.schema: the schema object belongs
        // to the spec document and may be reached again through a $ref.
        const { anyOf: _constraint, ...schemaWithoutAnyOf } = this.schema;
        return new SchemaConverter({
            id: this.id,
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            schema: schemaWithoutAnyOf,
            inlined: this.inlined,
            nameOverride: this.nameOverride,
            visitedRefs: this.visitedRefs
        }).convert();
    }

    private tryConvertOneOfAnyOfSchema(): SchemaConverter.Output | undefined {
        if (this.schema.oneOf != null || this.schema.anyOf != null) {
            const oneOfConverter = new OneOfSchemaConverter({
                id: this.id,
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema,
                inlinedTypes: {}
            });
            const oneOfType = oneOfConverter.convert();
            if (oneOfType != null) {
                return {
                    convertedSchema: {
                        typeDeclaration: this.createTypeDeclaration({
                            shape: oneOfType.type,
                            referencedTypes: oneOfType.referencedTypes
                        }),
                        audiences: this.audiences,
                        propertiesByAudience: {}
                    },
                    inlinedTypes: oneOfType.inlinedTypes
                };
            }
        }
        return undefined;
    }

    private tryConvertMapSchema(): SchemaConverter.Output | undefined {
        if (
            (typeof this.schema.additionalProperties === "object" ||
                typeof this.schema.additionalProperties === "boolean") &&
            this.schema.additionalProperties != null &&
            !this.schema.properties &&
            !this.schema.allOf
        ) {
            if (typeof this.schema.additionalProperties === "boolean" && this.schema.additionalProperties === false) {
                return undefined;
            }
            const additionalPropertiesConverter = new MapSchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schemaOrReferenceOrBoolean: this.schema.additionalProperties
            });
            const additionalPropertiesType = additionalPropertiesConverter.convert();
            if (additionalPropertiesType != null) {
                return {
                    convertedSchema: {
                        typeDeclaration: this.createTypeDeclaration({
                            shape: additionalPropertiesType.type,
                            referencedTypes: additionalPropertiesType.referencedTypes
                        }),
                        audiences: this.audiences,
                        propertiesByAudience: {}
                    },
                    inlinedTypes: additionalPropertiesType.inlinedTypes
                };
            }
        }
        return undefined;
    }

    private tryConvertDiscriminatorMappingSchema(): SchemaConverter.Output | undefined {
        if (
            this.schema.discriminator?.mapping != null &&
            Object.keys(this.schema.discriminator.mapping).length > 0 &&
            this.schema.oneOf == null &&
            this.schema.anyOf == null
        ) {
            const schemaWithOneOf: OpenAPIV3_1.SchemaObject = {
                ...this.schema,
                oneOf: Object.values(this.schema.discriminator.mapping).map((ref) => ({
                    $ref: ref
                }))
            };
            const oneOfConverter = new OneOfSchemaConverter({
                id: this.id,
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: schemaWithOneOf,
                inlinedTypes: {}
            });
            const oneOfType = oneOfConverter.convert();
            if (oneOfType != null) {
                return {
                    convertedSchema: {
                        typeDeclaration: this.createTypeDeclaration({
                            shape: oneOfType.type,
                            referencedTypes: oneOfType.referencedTypes
                        }),
                        audiences: this.audiences,
                        propertiesByAudience: {}
                    },
                    inlinedTypes: oneOfType.inlinedTypes
                };
            }
        }
        return undefined;
    }

    private tryConvertObjectAllOfSchema(): SchemaConverter.Output | undefined {
        if (this.schema.type === "object" || this.schema.properties != null || this.schema.allOf != null) {
            const objectConverter = new ObjectSchemaConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                schema: this.schema
            });
            const convertedObject = objectConverter.convert();
            if (convertedObject != null) {
                return {
                    convertedSchema: {
                        typeDeclaration: this.createTypeDeclaration({
                            shape: convertedObject.type,
                            referencedTypes: convertedObject.referencedTypes
                        }),
                        audiences: this.audiences,
                        propertiesByAudience: convertedObject.propertiesByAudience
                    },
                    inlinedTypes: convertedObject.inlinedTypes
                };
            }
        }
        return undefined;
    }

    private tryConvertUntypedSchema(): SchemaConverter.Output | undefined {
        if (this.isUntypedSchema()) {
            return {
                convertedSchema: {
                    typeDeclaration: this.createTypeDeclaration({
                        shape: FernIr.Type.alias({
                            aliasOf: FernIr.TypeReference.unknown(),
                            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                            resolvedType: FernIr.TypeReference.unknown() as any
                        }),
                        referencedTypes: new Set()
                    }),
                    audiences: this.audiences,
                    propertiesByAudience: {}
                },
                inlinedTypes: {}
            };
        }
        return undefined;
    }

    private tryConvertFernTypeDeclaration(): SchemaConverter.Output | undefined {
        const fernTypeConverter = new Extensions.FernTypeExtension({
            breadcrumbs: this.breadcrumbs,
            schema: this.schema,
            context: this.context
        });
        const fernType = fernTypeConverter.convert();
        if (fernType == null) {
            return undefined;
        }
        const typeReference = createTypeReferenceFromFernType(fernType);
        if (typeReference == null) {
            return undefined;
        }
        return {
            convertedSchema: {
                typeDeclaration: this.createTypeDeclaration({
                    shape: FernIr.Type.alias({
                        aliasOf: typeReference,
                        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                        resolvedType: typeReference as any
                    }),
                    referencedTypes: new Set(),
                    omitV2Examples: true
                }),
                audiences: this.audiences,
                propertiesByAudience: {}
            },
            inlinedTypes: {}
        };
    }

    public createTypeDeclaration({
        shape,
        referencedTypes,
        omitV2Examples
    }: {
        shape: FernIr.Type;
        referencedTypes: Set<string>;
        omitV2Examples?: boolean;
    }): FernIr.TypeDeclaration {
        return {
            name: this.convertDeclaredTypeName(),
            shape,
            autogeneratedExamples: [],
            userProvidedExamples: [],
            encoding: undefined,
            availability: this.context.getAvailability({
                node: this.schema,
                breadcrumbs: this.breadcrumbs
            }),
            docs: this.schema.description,
            referencedTypes,
            source: undefined,
            inline: this.inlined,
            v2Examples: omitV2Examples ? undefined : this.convertSchemaExamples()
        };
    }

    public convertDeclaredTypeName(): FernIr.DeclaredTypeName {
        const rawId = this.context.getRawSchemaId(this.id);
        return {
            typeId: this.context.getNamespacedSchemaId(this.id),
            fernFilepath: this.context.createFernFilepath(),
            name: this.context.casingsGenerator.generateName(rawId),
            displayName: this.nameOverride
        };
    }

    /**
     * Checks if the schema only has the specified keys
     * @param allowedKeys - List of keys that are allowed in the schema
     * @returns true if the schema only has the specified keys, false otherwise
     */
    private schemaOnlyHasAllowedKeys(allowedKeys: string[]): boolean {
        const allAllowedKeys = [...TYPE_INVARIANT_KEYS, ...allowedKeys];
        const schemaKeys = Object.keys(this.schema);
        return schemaKeys.every((key) => allAllowedKeys.includes(key));
    }

    private isUntypedSchema(): boolean {
        if (
            this.schema &&
            typeof this.schema === "object" &&
            !("oneOf" in this.schema) &&
            !("anyOf" in this.schema) &&
            !("allOf" in this.schema) &&
            !("items" in this.schema) &&
            !("properties" in this.schema)
        ) {
            return true;
        }
        return false;
    }

    private convertSchemaExamples(): FernIr.V2SchemaExamples {
        const v2Examples = {
            userSpecifiedExamples: {},
            autogeneratedExamples: {}
        };

        const examples = this.context.getExamplesFromSchema({
            schema: this.schema,
            breadcrumbs: this.breadcrumbs
        });

        if (examples.length === 0) {
            const convertedExample = this.generateOrValidateExample({
                example: undefined,
                ignoreErrors: true
            });
            v2Examples.autogeneratedExamples = {
                [`${this.id}_example_autogenerated`]: convertedExample
            };
            return v2Examples;
        }

        v2Examples.userSpecifiedExamples = this.convertUserSpecifiedExamples(examples);
        return v2Examples;
    }

    private convertUserSpecifiedExamples(examples: unknown[]): Record<string, unknown> {
        const userSpecifiedExamples: Record<string, unknown> = {};

        for (const [index, example] of examples.entries()) {
            const resolvedExample = this.context.resolveExample(example);
            const exampleName = `${this.id}_example_${index}`;
            const convertedExample = this.generateOrValidateExample({
                example: resolvedExample,
                exampleName
            });
            userSpecifiedExamples[exampleName] = convertedExample;
        }

        return userSpecifiedExamples;
    }

    private generateOrValidateExample({
        example
    }: {
        example: unknown;
        ignoreErrors?: boolean;
        exampleName?: string;
    }): unknown {
        const exampleConverter = new ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            schema: this.schema,
            example
        });
        const { validExample: convertedExample } = exampleConverter.convert();
        // Note: Example validation errors are intentionally not collected as warnings
        // because they are too verbose and not actionable for users
        return convertedExample;
    }
}
