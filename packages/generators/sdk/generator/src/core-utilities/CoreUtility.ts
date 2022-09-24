import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/core-utils";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { ExportedDirectory, ExportedFilePath } from "../exports-manager/ExportedFilePath";

export declare namespace CoreUtility {
    export interface Init {
        getReferenceToExport: (args: {
            manifest: CoreUtility.Manifest;
            filepathInUtility: ExportedFilePath;
            exportedName: string;
        }) => Reference;
    }

    export interface Manifest {
        originalPathInRepo: RelativeFilePath;
        originalPathOnDocker: AbsoluteFilePath;
        pathInCoreUtilities: ExportedDirectory[];
    }
}

export abstract class CoreUtility {
    protected abstract readonly MANIFEST: CoreUtility.Manifest;

    private getReferenceToExportInCoreUtilities: (args: {
        manifest: CoreUtility.Manifest;
        filepathInUtility: ExportedFilePath;
        exportedName: string;
    }) => Reference;

    constructor(init: CoreUtility.Init) {
        this.getReferenceToExportInCoreUtilities = init.getReferenceToExport;
    }

    protected withReferenceToExport({
        filepathInUtility,
        exportedName,
    }: {
        filepathInUtility: ExportedFilePath;
        exportedName: string;
    }): Reference {
        return this.getReferenceToExportInCoreUtilities({
            manifest: this.MANIFEST,
            filepathInUtility,
            exportedName,
        });
    }
}
