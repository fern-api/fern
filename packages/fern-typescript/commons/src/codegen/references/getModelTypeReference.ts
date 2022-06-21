import { ModelReference } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { createQualifiedTypeReference, getQualifiedReferenceToModel } from "../utils/getQualifiedReferenceToModel";
import { getFilePathForModelReference } from "./getFilePathForModelReference";
import { getNameOfModelReference } from "./getNameOfModelReference";

export declare namespace getModelTypeReference {
    export interface Args {
        reference: ModelReference;
        referencedIn: SourceFile;
        modelDirectory: Directory;
        forceUseNamespaceImport?: getQualifiedReferenceToModel.Args["forceUseNamespaceImport"];
    }
}

export function getModelTypeReference({
    reference,
    referencedIn,
    modelDirectory,
    forceUseNamespaceImport,
}: getModelTypeReference.Args): ts.TypeNode {
    return getQualifiedReferenceToModel({
        typeName: getNameOfModelReference(reference),
        filepathOfReference: getFilePathForModelReference({ reference, modelDirectory }),
        referencedIn,
        modelDirectory,
        forceUseNamespaceImport,
        constructQualifiedReference: createQualifiedTypeReference,
    });
}
