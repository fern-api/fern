import { ExportedFilePath, ExportsManager, ImportsManager } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

export type ImportStrategy =
    | { type: "fromRoot"; namespaceImport?: string; useDynamicImport?: boolean }
    | { type: "direct"; alias?: string };

export interface DeclarationReferencer<Name> {
    getExportedFilepath: (name: Name) => ExportedFilePath;
    getFilename: (name: Name) => string;
}

export declare namespace DeclarationReferencer {
    namespace getReferenceTo {
        export interface Options<Name = never> {
            name: Name;
            importStrategy: ImportStrategy;
            importsManager: ImportsManager;
            exportsManager: ExportsManager;
            referencedIn: SourceFile;
            subImport?: string[];
        }
    }
}
