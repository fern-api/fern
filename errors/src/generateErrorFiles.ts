import { IntermediateRepresentation, Type } from "@fern-fern/ir-model";
import { ModelContext } from "@fern-typescript/model-context";
import { generateType } from "@fern-typescript/types";

export function generateErrorFiles({
    intermediateRepresentation,
    modelContext,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    modelContext: ModelContext;
}): void {
    for (const error of intermediateRepresentation.errors) {
        modelContext.addErrorDeclaration(error.name, (file) => {
            generateType({
                type: Type.object(error.type),
                typeName: error.name.name,
                docs: error.docs,
                modelContext,
                file,
            });
        });
    }
}
