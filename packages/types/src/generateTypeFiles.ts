import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { ModelContext } from "@fern-typescript/model-context";
import { generateType } from "./generateType";

export function generateTypeFiles({
    intermediateRepresentation,
    modelContext,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    modelContext: ModelContext;
}): void {
    for (const typeDeclaration of intermediateRepresentation.types) {
        modelContext.addTypeDeclaration(typeDeclaration.name, (file) =>
            generateType({
                type: typeDeclaration.shape,
                typeName: typeDeclaration.name.name,
                docs: typeDeclaration.docs,
                modelContext,
                file,
            })
        );
    }
}
