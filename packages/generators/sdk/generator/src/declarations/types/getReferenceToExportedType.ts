import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { SourceFile, ts } from "ts-morph";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { getReferenceToExport } from "../utils/getReferenceToExport";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";
import { getExportedFilepathForType } from "./getExportedFilepathForType";
import { getGeneratedTypeName } from "./getGeneratedTypeName";

export declare namespace getReferenceToExportedType {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        typeName: DeclaredTypeName;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
    }
}

export function getReferenceToExportedType({
    apiName,
    referencedIn,
    typeName,
    addImport,
}: getReferenceToExportedType.Args): ts.TypeNode {
    return ts.factory.createTypeReferenceNode(
        getReferenceToExport({
            apiName,
            referencedIn,
            exportedName: getGeneratedTypeName(typeName),
            exportedFromPath: getExportedFilepathForType(typeName, apiName),
            addImport,
        }).entityName
    );
}
