import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

import { Availability, AvailabilityStatus, ObjectPropertyAccess, TypeReference } from "@fern-api/ir-sdk";

import { AbstractConverterContext } from "../AbstractConverterContext";
import { ErrorCollector } from "../ErrorCollector";
import { AvailabilityExtension } from "../extensions/x-fern-availability";

/**
 * Context class for converting OpenAPI 3.1 specifications
 */
export class OpenAPIConverterContext3_1 extends AbstractConverterContext<OpenAPIV3_1.Document> {
    public isReferenceObject(
        parameter:
            | OpenAPIV3_1.ReferenceObject
            | OpenAPIV3_1.ParameterObject
            | OpenAPIV3_1.SchemaObject
            | OpenAPIV3_1.RequestBodyObject
            | OpenAPIV3_1.SecuritySchemeObject
            | OpenAPIV3.ReferenceObject
            | OpenAPIV3.ParameterObject
            | OpenAPIV3.SchemaObject
            | OpenAPIV3.RequestBodyObject
            | OpenAPIV3.SecuritySchemeObject
    ): parameter is OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject {
        return parameter != null && "$ref" in parameter;
    }

    public getTypeIdFromSchemaReference(reference: OpenAPIV3_1.ReferenceObject): string | undefined {
        const schemaMatch = reference.$ref.match(/\/schemas\/(.+)$/);
        if (!schemaMatch || !schemaMatch[1]) {
            return undefined;
        }
        return schemaMatch[1];
    }

    public async convertReferenceToTypeReference(
        reference: OpenAPIV3_1.ReferenceObject
    ): Promise<{ ok: true; reference: TypeReference } | { ok: false }> {
        const typeId = this.getTypeIdFromSchemaReference(reference);
        if (typeId == null) {
            return { ok: false };
        }
        const resolvedReference = await this.resolveReference<OpenAPIV3_1.SchemaObject>(reference);
        if (!resolvedReference.resolved) {
            return { ok: false };
        }
        return {
            ok: true,
            reference: TypeReference.named({
                fernFilepath: {
                    allParts: [],
                    packagePath: [],
                    file: undefined
                },
                name: this.casingsGenerator.generateName(""),
                typeId,
                default: undefined,
                inline: false
            })
        };
    }

    public async getPropertyAccess(
        schemaOrReference: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject
    ): Promise<ObjectPropertyAccess | undefined> {
        let schema = schemaOrReference;

        // Keep resolving references until we get to a schema object
        while (this.isReferenceObject(schema)) {
            const resolved = await this.resolveReference<OpenAPIV3_1.SchemaObject>(schema);
            if (!resolved.resolved) {
                return undefined;
            }
            schema = resolved.value;
        }

        // Now we have the actual schema object
        if (schema.readOnly && schema.writeOnly) {
            // Can't be both readonly and writeonly
            return undefined;
        }

        if (schema.readOnly) {
            return ObjectPropertyAccess.ReadOnly;
        }

        if (schema.writeOnly) {
            return ObjectPropertyAccess.WriteOnly;
        }

        return undefined;
    }
    
    public async getAvailability({
        node,
        breadcrumbs,
        errorCollector
    }: {
        node:
            | OpenAPIV3_1.ReferenceObject
            | OpenAPIV3_1.SchemaObject
            | OpenAPIV3_1.OperationObject
            | OpenAPIV3_1.ParameterObject;
        breadcrumbs: string[];
        errorCollector: ErrorCollector;
    }): Promise<Availability | undefined> {
        while (this.isReferenceObject(node)) {
            const resolved = await this.resolveReference<OpenAPIV3_1.SchemaObject>(node);
            if (!resolved.resolved) {
                return undefined;
            }
            node = resolved.value;
        }

        const availabilityExtension = new AvailabilityExtension({
            node,
            breadcrumbs
        });
        const availability = await availabilityExtension.convert({
            context: this,
            errorCollector
        });
        if (availability != null) {
            return {
                status: availability,
                message: undefined
            };
        }

        if (node.deprecated === true) {
            return {
                status: AvailabilityStatus.Deprecated,
                message: undefined
            };
        }

        return undefined;
    }
}
