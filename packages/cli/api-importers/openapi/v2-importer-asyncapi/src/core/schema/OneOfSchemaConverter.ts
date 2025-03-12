import { OpenAPIV3_1 } from "openapi-types";

import {
    SingleUnionType,
    SingleUnionTypeProperties,
    Type,
    TypeDeclaration,
    TypeId,
    UndiscriminatedUnionMember
} from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector, convertNumberToSnakeCase } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverterContext } from "../../AsyncAPIConverterContext";
import { SchemaConverter } from "./SchemaConverter";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter";

export declare namespace OneOfSchemaConverter {
    export interface Args extends AbstractConverter.Args {
        schema: OpenAPIV3_1.SchemaObject;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
    }

    export interface Output {
        union: Type;
        inlinedTypes?: Record<TypeId, TypeDeclaration>;
    }
}

export class OneOfSchemaConverter extends AbstractConverter<
    AsyncAPIConverterContext,
    OneOfSchemaConverter.Output | undefined
> {
    private readonly schema: OpenAPIV3_1.SchemaObject;

    constructor({ breadcrumbs, schema }: OneOfSchemaConverter.Args) {
        super({ breadcrumbs });
        this.schema = schema;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): Promise<OneOfSchemaConverter.Output | undefined> {
        if (this.schema.discriminator != null) {
            return await this.convertAsDiscriminatedUnion({ context, errorCollector });
        }
        return this.convertAsUndiscriminatedUnion({ context, errorCollector });
    }

    private async convertAsDiscriminatedUnion({
        context,
        errorCollector
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): Promise<OneOfSchemaConverter.Output | undefined> {
        const unionTypes: SingleUnionType[] = [];
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        if (this.schema.discriminator == null) {
            return undefined;
        }

        for (const [discriminant, reference] of Object.entries(this.schema.discriminator.mapping ?? {})) {
            const singleUnionTypeSchemaConverter = new SchemaOrReferenceConverter({
                schemaOrReference: { $ref: reference },
                breadcrumbs: [...this.breadcrumbs, "discriminator", "mapping", discriminant]
            });
            const typeId = context.getTypeIdFromSchemaReference({ $ref: reference });

            const convertedSchema = await singleUnionTypeSchemaConverter.convert({ context, errorCollector });

            if (convertedSchema?.type != null && typeId != null) {
                const nameAndWireValue = context.casingsGenerator.generateNameAndWireValue({
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
                        name: context.casingsGenerator.generateName(typeId),
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

        return {
            union: Type.union({
                baseProperties: [],
                discriminant: context.casingsGenerator.generateNameAndWireValue({
                    name: this.schema.discriminator.propertyName,
                    wireValue: this.schema.discriminator.propertyName
                }),
                extends: [],
                types: unionTypes
            }),
            inlinedTypes
        };
    }

    private async convertAsUndiscriminatedUnion({
        context,
        errorCollector
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): Promise<OneOfSchemaConverter.Output | undefined> {
        if (!this.schema.oneOf || this.schema.oneOf.length === 0) {
            return undefined;
        }

        const unionTypes: UndiscriminatedUnionMember[] = [];
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        for (const [index, subSchema] of this.schema.oneOf.entries()) {
            const subBreadcrumbs = [...this.breadcrumbs, "oneOf", convertNumberToSnakeCase(index) ?? ""];

            // if subschema is a reference
            if (context.isReferenceObject(subSchema)) {
                const maybeTypeReference = await context.convertReferenceToTypeReference(subSchema);
                if (maybeTypeReference.ok) {
                    unionTypes.push({
                        type: maybeTypeReference.reference,
                        docs: subSchema.description
                    });
                }
                continue;
            }

            // if subschema is inlined
            const schemaId = context.convertBreadcrumbsToName(subBreadcrumbs);
            const schemaConverter = new SchemaConverter({
                id: schemaId,
                breadcrumbs: subBreadcrumbs,
                schema: subSchema
            });
            const convertedSchema = await schemaConverter.convert({ context, errorCollector });
            if (convertedSchema != null) {
                unionTypes.push({
                    type: context.createNamedTypeReference(schemaId),
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
            union: Type.undiscriminatedUnion({
                members: unionTypes
            }),
            inlinedTypes
        };
    }
}
