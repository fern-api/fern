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
import { AbstractConverterContext } from "@fern-api/v2-importer-commons";

/**
 * Context class for converting OpenAPI 3.1 specifications
 */
export class OpenRPCConverterContext3_1 extends AbstractConverterContext<OpenrpcDocument> {
    public isReferenceObject(
        parameter: ExampleObject | ExamplePairingObject | MethodObject | ContentDescriptorObject | ReferenceObject
    ): parameter is ReferenceObject {
        return parameter != null && "$ref" in parameter;
    }

    public convertReferenceToTypeReference(
        reference: OpenAPIV3_1.ReferenceObject
    ): { ok: true; reference: TypeReference } | { ok: false } {
        const typeId = this.getTypeIdFromSchemaReference(reference);
        if (typeId == null) {
            return { ok: false };
        }
        const resolvedReference = this.resolveReference<OpenAPIV3_1.SchemaObject>(reference);
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
                name: this.casingsGenerator.generateName(typeId),
                typeId,
                default: undefined,
                inline: false
            })
        };
    }
}
