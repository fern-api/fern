import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Schema } from "@fern-api/openapi-ir-sdk";
import { buildTypeReference } from "./buildTypeReference";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export function buildVariables(context: OpenApiIrConverterContext): void {
    for (const [variable, variableSchema] of Object.entries(context.ir.variables)) {
        const typeReference = buildTypeReference({
            schema: Schema.primitive(variableSchema),
            context,
            fileContainingReference: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)
        });
        context.builder.addVariable({
            name: variable,
            schema: {
                type: getTypeFromTypeReference(typeReference),
                docs: variableSchema.description ?? undefined
            }
        });
    }
}
