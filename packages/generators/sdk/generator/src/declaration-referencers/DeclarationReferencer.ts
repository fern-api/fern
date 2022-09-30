import { SourceFile } from "ts-morph";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";

export type ImportStrategy = { type: "fromRoot"; namespaceImport?: string } | { type: "direct"; alias?: string };

export interface DeclarationReferencer<Name> {
    getExportedFilepath: (name: Name) => ExportedFilePath;
    getFilename: (name: Name) => string;
}

export declare namespace DeclarationReferencer {
    namespace getReferenceTo {
        export interface Options<Name> {
            name: Name;
            importStrategy: ImportStrategy;
            addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
            referencedIn: SourceFile;
            subImport?: string[];
        }
    }
}
