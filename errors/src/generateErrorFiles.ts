import { IntermediateRepresentation } from "@fern-api/api";
import { ModelContext, TypeResolver } from "@fern-typescript/commons";
import { generateType } from "@fern-typescript/types";

export function generateErrorFiles({
    intermediateRepresentation,
    typeResolver,
    modelContext,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    typeResolver: TypeResolver;
    modelContext: ModelContext;
}): void {
    for (const error of intermediateRepresentation.errors) {
        modelContext.addErrorDefinition(error.name, (file) => {
            generateType({
                type: error.type,
                typeName: error.name.name,
                docs: error.docs,
                typeResolver,
                modelContext,
                file,
            });
        });
    }
}
