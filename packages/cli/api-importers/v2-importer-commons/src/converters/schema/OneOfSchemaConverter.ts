import { OpenAPIV3_1 } from "openapi-types";

import {
    ContainerType,
    SingleUnionType,
    SingleUnionTypeProperties,
    Type,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionMember
} from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { convertProperties } from "../../utils/ConvertProperties";
import { SchemaConverter } from "./SchemaConverter";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter";

export declare namespace OneOfSchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        id: string;
        schema: OpenAPIV3_1.SchemaObject;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
    }

    export interface Output {
        type: Type;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
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
            const schema = this.context.resolveReference<OpenAPIV3_1.SchemaObject>({ $ref: reference });
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
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        for (const [discriminant, reference] of Object.entries(this.schema.discriminator.mapping ?? {})) {
            const singleUnionTypeSchemaConverter = new SchemaOrReferenceConverter({
                context: this.context,
                schemaOrReference: { $ref: reference },
                breadcrumbs: [...this.breadcrumbs, "discriminator", "mapping", discriminant]
            });
            const typeId = this.context.getTypeIdFromSchemaReference({ $ref: reference });
            const convertedSchema = singleUnionTypeSchemaConverter.convert();
            if (convertedSchema?.type != null && typeId != null) {
                const nameAndWireValue = this.context.casingsGenerator.generateNameAndWireValue({
                    name: discriminant,
                    wireValue: discriminant
                });

                unionTypes.push({
                    docs: undefined,
                    discriminantValue: nameAndWireValue,
                    availability: convertedSchema.availability,
                    displayName: undefined,
                    shape: SingleUnionTypeProperties.samePropertiesAsObject({
                        typeId,
                        name: this.context.casingsGenerator.generateName(typeId),
                        fernFilepath: {
                            allParts: [],
                            packagePath: [],
                            file: undefined
                        }
                    })
                });
                inlinedTypes = {
                    ...inlinedTypes,
                    ...convertedSchema.inlinedTypes
                };
            }
        }

        const { convertedProperties: baseProperties, inlinedTypesFromProperties } = convertProperties({
            properties: this.schema.properties ?? {},
            required: this.schema.required ?? [],
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            errorCollector: this.context.errorCollector
        });

        return {
            type: Type.union({
                baseProperties,
                discriminant: this.context.casingsGenerator.generateNameAndWireValue({
                    name: this.schema.discriminator.propertyName,
                    wireValue: this.schema.discriminator.propertyName
                }),
                extends: [],
                types: unionTypes
            }),
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
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        for (const [index, subSchema] of [
            ...(this.schema.oneOf ?? []).entries(),
            ...(this.schema.anyOf ?? []).entries()
        ]) {
            if (this.context.isReferenceObject(subSchema)) {
                const maybeTypeReference = this.context.convertReferenceToTypeReference(subSchema);
                if (maybeTypeReference.ok) {
                    unionTypes.push({
                        type: maybeTypeReference.reference,
                        docs: subSchema.description
                    });
                }
                continue;
            }

            const schemaId = this.context.convertBreadcrumbsToName([`${this.id}_${index}`]);
            const schemaConverter = new SchemaConverter({
                context: this.context,
                id: schemaId,
                breadcrumbs: [...this.breadcrumbs, `oneOf[${index}]`],
                schema: subSchema
            });
            const convertedSchema = schemaConverter.convert();
            if (convertedSchema != null) {
                unionTypes.push({
                    type: this.context.createNamedTypeReference(schemaId),
                    docs: subSchema.description
                });
                inlinedTypes = {
                    ...inlinedTypes,
                    ...convertedSchema.inlinedTypes,
                    [schemaId]: convertedSchema.typeDeclaration
                };
            }
        }

        return {
            type: Type.undiscriminatedUnion({
                members: unionTypes
            }),
            inlinedTypes
        };
    }

    private shouldConvertAsNullableSchemaOrReference(): boolean {
        if (this.schema.oneOf != null) {
            return this.schema.oneOf.some((subSchema) => "type" in subSchema && subSchema.type === "null");
        } else if (this.schema.anyOf != null) {
            return this.schema.anyOf.some((subSchema) => "type" in subSchema && subSchema.type === "null");
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
                message: `Received ${schemaType} schema with no valid non-null types: ${JSON.stringify(this.schema)}`,
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
            inlinedTypes: convertedSchema.inlinedTypes
        };
    }

    private wrapInNullable(type: TypeReference): TypeReference {
        return TypeReference.container(ContainerType.nullable(type));
    }
}
