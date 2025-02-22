import { OpenAPIV3_1 } from "openapi-types";

import { Type, TypeDeclaration, TypeId, UndiscriminatedUnionMember } from "@fern-api/ir-sdk";

import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { SchemaConverter } from "./SchemaConverter";

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

export class OneOfSchemaConverter extends AbstractConverter<OpenAPIConverterContext3_1, OneOfSchemaConverter.Output> {
    private readonly schema: OpenAPIV3_1.SchemaObject;

    constructor({ breadcrumbs, schema }: OneOfSchemaConverter.Args) {
        super({ breadcrumbs });
        this.schema = schema;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): OneOfSchemaConverter.Output | undefined {
        if (!this.schema.oneOf || this.schema.oneOf.length === 0) {
            return undefined;
        }

        const unionTypes: UndiscriminatedUnionMember[] = [];
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        for (const [index, subSchema] of this.schema.oneOf.entries()) {
            const subBreadcrumbs = [...this.breadcrumbs, "oneOf", index.toString()];

            // if subschema is a reference
            if (context.isReferenceObject(subSchema)) {
                const maybeTypeReference = context.convertReferenceToTypeReference(subSchema);
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
            const convertedSchema = schemaConverter.convert({ context, errorCollector });
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

        if (unionTypes.length === 0) {
            return undefined;
        }

        return {
            union: Type.undiscriminatedUnion({
                members: unionTypes
            }),
            inlinedTypes
        };
    }
}
