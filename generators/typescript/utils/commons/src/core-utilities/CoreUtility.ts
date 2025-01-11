import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ExportedDirectory } from "../exports-manager";
import { Reference } from "../referencing";

export type CoreUtilityName = string;

export declare namespace CoreUtility {
    export interface Init {
        getReferenceToExport: (args: { manifest: CoreUtility.Manifest; exportedName: string }) => Reference;
    }

    export interface Manifest {
        name: CoreUtilityName;
        repoInfoForTesting: {
            path: RelativeFilePath;
            ignoreGlob?: string;
        };
        unitTests?: {
            fromDirectory: RelativeFilePath;
            /**
             * Import strings that we want to find + replace
             */
            findAndReplace: Record<string, string>;
        };
        originalPathOnDocker: AbsoluteFilePath;
        pathInCoreUtilities: ExportedDirectory[];
        addDependencies?: (dependencyManager: DependencyManager) => void;
        writeConditionalFiles?: (pathToSrc: AbsoluteFilePath) => Promise<void>;
    }
}

export abstract class CoreUtility {
    protected abstract readonly MANIFEST: CoreUtility.Manifest;

    private getReferenceToExportInCoreUtilities: (args: {
        manifest: CoreUtility.Manifest;
        exportedName: string;
    }) => Reference;

    constructor(init: CoreUtility.Init) {
        this.getReferenceToExportInCoreUtilities = init.getReferenceToExport;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    protected withExportedName<F extends Function>(
        exportedName: string,
        run: (referenceToExportedName: Reference) => F
    ): F {
        const wrapper = (...args: unknown[]) => {
            const reference = this.getReferenceToExportInCoreUtilities({
                manifest: this.MANIFEST,
                exportedName
            });
            return run(reference)(...args);
        };

        return wrapper as unknown as F;
    }
}
