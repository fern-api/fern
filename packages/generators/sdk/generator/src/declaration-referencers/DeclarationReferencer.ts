import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile } from "ts-morph";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";

export type ImportStrategy = { type: "fromRoot" } | { type: "direct"; alias?: string };

export interface DeclarationReferencer<Name> {
    getExportedFilepath: (name: Name) => ExportedFilePath;
    getFilename: (name: Name) => string;
    getExportedName: (name: Name) => string;
    getReferenceTo: (name: Name, options: DeclarationReferencer.getReferenceTo.Options) => Reference;
}

export declare namespace DeclarationReferencer {
    namespace getReferenceTo {
        export interface Options {
            importStrategy: ImportStrategy;
            addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
            referencedIn: SourceFile;
        }
    }
}
