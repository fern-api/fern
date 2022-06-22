import { IntermediateRepresentation } from "@fern-api/api";
import { ModelContext } from "@fern-typescript/commons";
import { generateType } from "./generateType";

export function generateTypeFiles({
    intermediateRepresentation,
    modelContext,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    modelContext: ModelContext;
}): void {
    for (const typeDefinition of intermediateRepresentation.types) {
        modelContext.addTypeDefinition(typeDefinition.name, (file) =>
            generateType({
                type: typeDefinition.shape,
                typeName: typeDefinition.name.name,
                docs: typeDefinition.docs,
                modelContext,
                file,
            })
        );
    }
}
