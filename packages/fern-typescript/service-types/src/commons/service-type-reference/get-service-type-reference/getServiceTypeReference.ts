import { getTypeReference } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { ServiceTypeReference } from "../types";
import { getInlinedServiceTypeReference } from "./getInlinedServiceTypeReference";

// adds an import to the `referencedIn` file and returns a reference to the imported type
export function getServiceTypeReference({
    reference,
    referencedIn,
    modelDirectory,
}: {
    referencedIn: SourceFile;
    modelDirectory: Directory;
    reference: ServiceTypeReference;
}): ts.TypeNode {
    if (reference.isInlined) {
        return getInlinedServiceTypeReference({
            metadata: reference.metadata,
            referencedIn,
            modelDirectory,
        });
    } else {
        return getTypeReference({
            reference: reference.typeReference,
            referencedIn,
            modelDirectory,
        });
    }
}
