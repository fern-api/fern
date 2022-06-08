import { TypeReference } from "@fern-api/api";
import { SourceFile } from "ts-morph";

export type ServiceTypeReference<T extends string = string> = LocalServiceTypeReference<T> | ModelServiceTypeReference;

export interface LocalServiceTypeReference<T extends string = string> {
    // is located in a file local to this service, not imported from the model
    isLocal: true;
    typeName: T;
    file: SourceFile;
}

export interface ModelServiceTypeReference {
    // is imported from the model
    isLocal: false;
    typeReference: Exclude<TypeReference, TypeReference.Void>;
}
