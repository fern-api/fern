import {
    ContentDescriptorObject,
    ExampleObject,
    ExamplePairingObject,
    MethodObject,
    OpenrpcDocument,
    ReferenceObject
} from "@open-rpc/meta-schema";
import { OpenAPIV3_1 } from "openapi-types";

import { TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverterContext, DisplayNameOverrideSource } from "@fern-api/v2-importer-commons";

/**
 * Context class for converting OpenAPI 3.1 specifications
 */
export class OpenRPCConverterContext3_1 extends AbstractConverterContext<OpenrpcDocument> {
    public isReferenceObject(
        parameter: ExampleObject | ExamplePairingObject | MethodObject | ContentDescriptorObject | ReferenceObject
    ): parameter is ReferenceObject {
        return parameter != null && "$ref" in parameter;
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
        displayNameOverrideSource?: DisplayNameOverrideSource;
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

        if (displayNameOverrideSource === "reference_identifier") {
            displayName = displayNameOverride ?? resolvedReference.value.title;
        } else if (
            displayNameOverrideSource === "discriminator_key" ||
            displayNameOverrideSource === "schema_identifier"
        ) {
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
                displayName,
                default: undefined,
                inline: false
            })
        };
    }
}
