import { generateTypeReference } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { WireMessageBodyReference } from "./types";

// adds an import to the `referencedIn` file and returns a reference to the imported type
export function generateReferenceToWireMessageType({
    reference,
    referencedIn,
    modelDirectory,
}: {
    reference: WireMessageBodyReference;
    referencedIn: SourceFile;
    modelDirectory: Directory;
}): ts.TypeNode {
    if (reference.isLocal) {
        return reference.generateTypeReference(referencedIn);
    } else {
        return generateTypeReference({
            reference: reference.typeReference,
            referencedIn,
            modelDirectory,
        });
    }
}
