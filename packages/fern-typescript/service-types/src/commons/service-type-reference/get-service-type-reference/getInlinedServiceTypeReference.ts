import { createQualifiedTypeReference, getQualifiedReferenceToModel } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { ServiceTypeMetadata } from "../types";

export declare namespace getInlinedServiceTypeReference {
    export interface Args {
        metadata: ServiceTypeMetadata;
        referencedIn: SourceFile;
        modelDirectory: Directory;
    }
}

export function getInlinedServiceTypeReference({
    metadata,
    referencedIn,
    modelDirectory,
}: getInlinedServiceTypeReference.Args): ts.TypeReferenceNode {
    return getQualifiedReferenceToModel({
        typeName: metadata.typeName,
        referencedIn,
        filepathOfReference: metadata.filepath,
        modelDirectory,
        constructQualifiedReference: createQualifiedTypeReference,
    });
}
