import { ModelReference } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { getFilePathForModelReference } from "../references/getFilePathForModelReference";
import { getNameOfModelReference } from "../references/getNameOfModelReference";
import { createPropertyAccessExpression, getQualifiedReferenceToModel } from "../utils/getQualifiedReferenceToModel";

export function generateTypeUtilsReference({
    reference,
    referencedIn,
    modelDirectory,
}: {
    reference: ModelReference;
    referencedIn: SourceFile;
    modelDirectory: Directory;
}): ts.Expression {
    return getQualifiedReferenceToModel({
        typeName: getNameOfModelReference(reference),
        filepathOfReference: getFilePathForModelReference({ reference, modelDirectory }),
        referencedIn,
        modelDirectory,
        forceUseNamespaceImport: false,
        constructQualifiedReference: createPropertyAccessExpression,
    });
}
