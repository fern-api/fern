import { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";
import { OpenAPIV3_1 } from "openapi-types";

import { TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverterContext } from "@fern-api/v2-importer-commons";

/**
 * Context class for converting protobuf file descriptors to intermediate representations
 */
export class ProtobufConverterContext extends AbstractConverterContext<CodeGeneratorRequest> {
    public convertReferenceToTypeReference({
        reference
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
    }): { ok: true; reference: TypeReference } | { ok: false } {
        return { ok: false };
    }
}
