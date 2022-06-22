import { ModelContext } from "@fern-typescript/commons";
import { SourceFile, ts } from "ts-morph";
import { WebSocketChannelTypeReference } from "../types";

// adds an import to the `referencedIn` file and returns a reference to the imported type
export function getWebSocketServiceTypeReference({
    reference,
    referencedIn,
    modelContext,
}: {
    referencedIn: SourceFile;
    modelContext: ModelContext;
    reference: WebSocketChannelTypeReference;
}): ts.TypeNode {
    if (reference.isInlined) {
        return modelContext.getReferenceToWebSocketChannelType({
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
