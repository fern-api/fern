import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Schema } from "@fern-api/openapi-ir";
import { buildNonInlineableTypeReference } from "./buildTypeReference";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getGroupNameForSchema } from "./utils/getGroupNameForSchema";
import { getNamespaceFromGroup } from "./utils/getNamespaceFromGroup";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export function buildVariables(context: OpenApiIrConverterContext): void {
    for (const [variable, variableSchema] of Object.entries(context.ir.variables)) {
        const namespace =
            variableSchema.groupName != null ? getNamespaceFromGroup(variableSchema.groupName) : undefined;
        const typeReference = buildNonInlineableTypeReference({
            schema: Schema.primitive(variableSchema),
            context,
            fileContainingReference: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
            namespace
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
