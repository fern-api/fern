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

import { AbstractConverter, AbstractConverterContext, ErrorCollector, convertNumberToSnakeCase } from "../..";
import { convertProperties } from "../../utils/ConvertProperties";
import { SchemaConverter } from "./SchemaConverter";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter";

export declare namespace OneOfSchemaConverter {
    export interface Args extends AbstractConverter.Args {
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

    constructor({ breadcrumbs, schema }: OneOfSchemaConverter.Args) {
        super({ breadcrumbs });
        this.schema = schema;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<OneOfSchemaConverter.Output | undefined> {
        if (this.shouldConvertAsNullableSchemaOrReference()) {
            return await this.convertAsNullableSchemaOrReference({ context, errorCollector });
        }

        if (this.schema.discriminator != null) {
            return await this.convertAsDiscriminatedUnion({ context, errorCollector });
        }
        return this.convertAsUndiscriminatedUnion({ context, errorCollector });
    }

    private async convertAsDiscriminatedUnion({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<OneOfSchemaConverter.Output | undefined> {
        if (this.schema.discriminator == null) {
            return undefined;
        }

        const unionTypes: SingleUnionType[] = [];
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

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

        const { convertedProperties: baseProperties, inlinedTypesFromProperties } = await convertProperties({
            properties: this.schema.properties ?? {},
            required: this.schema.required ?? [],
            breadcrumbs: this.breadcrumbs,
            context,
            errorCollector
        });

        return {
            type: Type.union({
                baseProperties,
                discriminant: context.casingsGenerator.generateNameAndWireValue({
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

    private async convertAsUndiscriminatedUnion({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<OneOfSchemaConverter.Output | undefined> {
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
            const subBreadcrumbs = [...this.breadcrumbs, "oneOf", convertNumberToSnakeCase(index) ?? ""];

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

    private simplifySchema({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): OpenAPIV3_1.SchemaObject | undefined {
        if (this.schema.oneOf != null) {
            const oneOfWithoutNull = this.schema.oneOf.filter(
                (subSchema) => "type" in subSchema && subSchema.type !== "null"
            );
            if (oneOfWithoutNull.length === 0) {
                errorCollector.collect({
                    message: `Received oneOf schema with no valid non-null types: ${JSON.stringify(this.schema)}`,
                    path: this.breadcrumbs
                });
                return undefined;
            }
            if (oneOfWithoutNull.length === 1) {
                return {
                    ...this.schema,
                    oneOf: undefined,
                    ...oneOfWithoutNull[0]
                };
            } else {
                return {
                    ...this.schema,
                    oneOf: oneOfWithoutNull
                };
            }
        } else if (this.schema.anyOf != null) {
            const anyOfWithoutNull = this.schema.anyOf.filter(
                (subSchema) => "type" in subSchema && subSchema.type !== "null"
            );
            if (anyOfWithoutNull.length === 0) {
                errorCollector.collect({
                    message: `Received anyOf schema with no valid non-null types: ${JSON.stringify(this.schema)}`,
                    path: this.breadcrumbs
                });
                return undefined;
            }
            if (anyOfWithoutNull.length === 1) {
                return {
                    ...this.schema,
                    anyOf: undefined,
                    ...anyOfWithoutNull[0]
                };
            } else {
                return {
                    ...this.schema,
                    anyOf: anyOfWithoutNull
                };
            }
        }
        return undefined;
    }

    private async convertAsNullableSchemaOrReference({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<OneOfSchemaConverter.Output | undefined> {
        const simplifiedSchema = this.simplifySchema({ context, errorCollector });
        if (simplifiedSchema == null) {
            return undefined;
        }

        const schemaOrReferenceConverter = new SchemaOrReferenceConverter({
            breadcrumbs: this.breadcrumbs,
            schemaOrReference: simplifiedSchema
        });
        const convertedSchema = await schemaOrReferenceConverter.convert({ context, errorCollector });
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
