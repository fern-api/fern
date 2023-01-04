import { SourceFile } from "ts-morph";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { ImportsManager } from "../imports-manager/ImportsManager";

export type ImportStrategy =
    | { type: "fromRoot"; namespaceImport?: string; useDynamicImport?: boolean }
    | { type: "direct"; alias?: string };

export interface DeclarationReferencer<Name> {
    getExportedFilepath: (name: Name) => ExportedFilePath;
    getFilename: (name: Name) => string;
}

export declare namespace DeclarationReferencer {
    namespace getReferenceTo {
        export interface Options<Name> {
            name: Name;
            importStrategy: ImportStrategy;
            importsManager: ImportsManager;
            referencedIn: SourceFile;
            subImport?: string[];
        }
    }
}
