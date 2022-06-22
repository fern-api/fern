import { IntermediateRepresentation } from "@fern-api/api";
import { ModelContext, TypeResolver } from "@fern-typescript/commons";
import { generateType } from "./generateType";

export function generateTypeFiles({
    intermediateRepresentation,
    typeResolver,
    modelContext,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    typeResolver: TypeResolver;
    modelContext: ModelContext;
}): void {
    for (const typeDefinition of intermediateRepresentation.types) {
        modelContext.addTypeDefinition(typeDefinition.name, (file) =>
            generateType({
                type: typeDefinition.shape,
                typeName: typeDefinition.name.name,
                docs: typeDefinition.docs,
                typeResolver,
                modelContext,
                file,
            })
        );
    }
}
