import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { Schema } from "@fern-fern/openapi-ir-model/finalIr";
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
