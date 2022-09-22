import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { SourceFile, ts } from "ts-morph";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { getReferenceToExport } from "../utils/getReferenceToExport";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";
import { getExportedFilepathForError } from "./getExportedFilepathForError";
import { getGeneratedErrorName } from "./getGeneratedErrorName";

export declare namespace getReferenceToError {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        errorName: DeclaredErrorName;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
    }
}

export function getReferenceToError({
    apiName,
    referencedIn,
    errorName,
    addImport,
}: getReferenceToError.Args): ts.TypeNode {
    return ts.factory.createTypeReferenceNode(
        getReferenceToExport({
            apiName,
            referencedIn,
            exportedName: getGeneratedErrorName(errorName),
            exportedFromPath: getExportedFilepathForError(errorName, apiName),
            addImport,
        }).entityName
    );
}
