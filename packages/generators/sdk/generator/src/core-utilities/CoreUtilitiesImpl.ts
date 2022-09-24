import { CoreUtilities } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile } from "ts-morph";
import { getReferenceToExportViaNamespaceImport } from "../declaration-referencers/utils/getReferenceToExportViaNamespaceImport";
import { ExportedDirectory, ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";
import { CoreUtility } from "./CoreUtility";
import { ZurgImpl } from "./implementations/ZurgImpl";

export declare namespace CoreUtilitiesImpl {
    interface Init {
        sourceFile: SourceFile;
        addImport: (
            moduleSpecifier: ModuleSpecifier,
            importDeclaration: ImportDeclaration,
            manifest: CoreUtility.Manifest
        ) => void;
        coreUtilitiesFilepath: ExportedDirectory[];
    }
}

export class CoreUtilitiesImpl implements CoreUtilities {
    private sourceFile: SourceFile;
    private addImport: (
        moduleSpecifier: ModuleSpecifier,
        importDeclaration: ImportDeclaration,
        manifest: CoreUtility.Manifest
    ) => void;
    private coreUtilitiesFilepath: ExportedDirectory[];

    constructor({ sourceFile, addImport, coreUtilitiesFilepath }: CoreUtilitiesImpl.Init) {
        this.sourceFile = sourceFile;
        this.addImport = addImport;
        this.coreUtilitiesFilepath = coreUtilitiesFilepath;
    }

    public zurg = new ZurgImpl({
        getReferenceToExport: this.getReferenceToExport.bind(this),
    });

    private getReferenceToExport({
        manifest,
        filepathInUtility,
        exportedName,
    }: {
        manifest: CoreUtility.Manifest;
        filepathInUtility: ExportedFilePath;
        exportedName: string;
    }) {
        const filepathInsideCoreUtilities: ExportedFilePath = {
            directories: [...manifest.pathInCoreUtilities, ...filepathInUtility.directories],
            file: filepathInUtility.file,
        };

        return getReferenceToExportViaNamespaceImport({
            exportedName,
            filepathInsideNamespaceImport: filepathInsideCoreUtilities,
            directoryToNamespaceImport: this.coreUtilitiesFilepath,
            namespaceImport: "core",
            referencedIn: this.sourceFile,
            addImport: (moduleSpecifier, importDeclaration) =>
                this.addImport(moduleSpecifier, importDeclaration, manifest),
        });
    }
}
