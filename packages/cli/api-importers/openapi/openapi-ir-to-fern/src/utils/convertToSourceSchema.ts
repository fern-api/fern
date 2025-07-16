import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Source } from "@fern-api/openapi-ir";

export function convertToSourceSchema(source: Source): RawSchemas.SourceSchema {
    switch (source.type) {
        case "openapi":
            return {
                openapi: source.file
            };
        case "protobuf":
            return {
                proto: source.file
            };
        default:
            assertNever(source);
    }
}
