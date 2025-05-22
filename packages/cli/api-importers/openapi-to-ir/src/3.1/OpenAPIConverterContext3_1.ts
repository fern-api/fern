import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

import { TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverterContext } from "@fern-api/v2-importer-commons";

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
        return parameter != null && typeof parameter === "object" && "$ref" in parameter;
    }

    public convertReferenceToTypeReference({
        reference,
        breadcrumbs,
        displayNameOverride,
        displayNameOverrideSource
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
        breadcrumbs?: string[];
        displayNameOverride?: string | undefined;
        displayNameOverrideSource?: "reference_title" | "discriminator_key" | "schema_title";
    }): { ok: true; reference: TypeReference } | { ok: false } {
        const typeId = this.getTypeIdFromSchemaReference(reference);
        if (typeId == null) {
            return { ok: false };
        }
        const resolvedReference = this.resolveReference<OpenAPIV3_1.SchemaObject>({ reference, breadcrumbs });
        if (!resolvedReference.resolved) {
            return { ok: false };
        }

        let displayName: string | undefined;

        if (displayNameOverrideSource === "reference_title") {
            displayName = displayNameOverride ?? resolvedReference.value.title;
        } else if (displayNameOverrideSource === "discriminator_key" || displayNameOverrideSource === "schema_title") {
            displayName = resolvedReference.value.title ?? displayNameOverride;
        }

        return {
            ok: true,
            reference: TypeReference.named({
                fernFilepath: {
                    allParts: [],
                    packagePath: [],
                    file: undefined
                },
                name: this.casingsGenerator.generateName(typeId),
                typeId,
                default: undefined,
                inline: false,
                displayName
            })
        };
    }
}
