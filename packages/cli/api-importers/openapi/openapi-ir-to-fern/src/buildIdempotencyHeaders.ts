import { ROOT_API_FILENAME } from "@fern-api/configuration";
import { PrimitiveSchemaValue, Schema } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { buildHeader } from "./buildHeader";
import { getGroupNameForSchema } from "./utils/getGroupNameForSchema";
import { getNamespaceFromGroup } from "./utils/getNamespaceFromGroup";
import { wrapTypeReferenceAsOptional } from "./utils/wrapTypeReferenceAsOptional";

export function buildIdempotencyHeaders(context: OpenApiIrConverterContext): void {
    for (const header of context.ir.idempotencyHeaders ?? []) {
        const groupName = header.schema ? getGroupNameForSchema(header.schema) : undefined;
        const namespace = groupName != null ? getNamespaceFromGroup(groupName) : undefined;
        const convertedHeader = buildHeader({
            header: {
                ...header,
                schema:
                    header.schema ??
                    Schema.primitive({
                        description: undefined,
                        availability: undefined,
                        generatedName: "",
                        title: undefined,
                        groupName: undefined,
                        nameOverride: undefined,
                        schema: PrimitiveSchemaValue.string({
                            default: undefined,
                            pattern: undefined,
                            format: undefined,
                            minLength: undefined,
                            maxLength: undefined
                        })
                    }),
                name: header.name ?? header.header,
                parameterNameOverride: undefined,
                description: undefined,
                availability: undefined,
                source: undefined
            },
            fileContainingReference: RelativeFilePath.of(ROOT_API_FILENAME),
            context,
            namespace
        });
        context.builder.addIdempotencyHeader({
            name: header.header,
            schema: wrapTypeReferenceAsOptional(convertedHeader)
        });
    }
}
