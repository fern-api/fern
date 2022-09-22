import { WrapperName } from "@fern-typescript/commons-v2";
import { Reference } from "@fern-typescript/declaration-handler";
import { SourceFile } from "ts-morph";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { getDirectReferenceToExport } from "../utils/getDirectReferenceToExport";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";
import { getExportedFilepathForWrapper } from "./getExportedFilepathForWrapper";

export declare namespace getReferenceToWrapper {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        wrapperName: WrapperName;
        importAlias: string;
    }
}

export function getReferenceToWrapper({
    referencedIn,
    apiName,
    addImport,
    wrapperName,
    importAlias,
}: getReferenceToWrapper.Args): Reference {
    return getDirectReferenceToExport({
        referencedIn,
        addImport,
        filepath: getExportedFilepathForWrapper(wrapperName, apiName),
        exportedName: wrapperName.name,
        importAlias,
    });
}
