import { ModelReference } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
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
        reference,
        referencedIn,
        modelDirectory,
        forceUseNamespaceImport: false,
        constructQualifiedReference: createPropertyAccessExpression,
    });
}
