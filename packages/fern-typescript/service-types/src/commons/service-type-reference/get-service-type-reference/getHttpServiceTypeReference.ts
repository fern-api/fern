import { ModelContext } from "@fern-typescript/commons";
import { SourceFile, ts } from "ts-morph";
import { HttpServiceTypeReference } from "../types";

// adds an import to the `referencedIn` file and returns a reference to the imported type
export function getHttpServiceTypeReference({
    reference,
    referencedIn,
    modelContext,
}: {
    referencedIn: SourceFile;
    modelContext: ModelContext;
    reference: HttpServiceTypeReference;
}): ts.TypeNode {
    if (reference.isInlined) {
        return modelContext.getReferenceToHttpServiceType({
            metadata: reference.metadata,
            referencedIn,
        });
    } else {
        return modelContext.getReferenceToType({
            reference: reference.typeReference,
            referencedIn,
        });
    }
}
