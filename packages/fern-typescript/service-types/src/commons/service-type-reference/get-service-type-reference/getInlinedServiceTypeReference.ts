import { ImportStrategy, ModelContext } from "@fern-typescript/commons";
import { SourceFile, ts } from "ts-morph";
import { ServiceTypeMetadata } from "../types";

export declare namespace getInlinedServiceTypeReference {
    export interface Args {
        metadata: ServiceTypeMetadata;
        referencedIn: SourceFile;
        modelContext: ModelContext;
    }
}

export function getInlinedServiceTypeReference({
    metadata,
    referencedIn,
    modelContext,
}: getInlinedServiceTypeReference.Args): ts.TypeReferenceNode {
    return modelContext.getReferenceToServiceType({
        metadata,
        referencedIn,
        importStrategy: ImportStrategy.MODEL_NAMESPACE_IMPORT,
    });
}
