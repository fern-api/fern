import { ImportStrategy, ModelContext } from "@fern-typescript/commons";
import { SourceFile, ts } from "ts-morph";
import { ServiceTypeReference } from "../types";
import { getInlinedServiceTypeReference } from "./getInlinedServiceTypeReference";

// adds an import to the `referencedIn` file and returns a reference to the imported type
export function getServiceTypeReference({
    reference,
    referencedIn,
    modelContext,
}: {
    referencedIn: SourceFile;
    modelContext: ModelContext;
    reference: ServiceTypeReference;
}): ts.TypeNode {
    if (reference.isInlined) {
        return getInlinedServiceTypeReference({
            metadata: reference.metadata,
            referencedIn,
            modelContext,
        });
    } else {
        return modelContext.getReferenceToType({
            reference: reference.typeReference,
            referencedIn,
            importStrategy: ImportStrategy.NAMED_IMPORT,
        });
    }
}
