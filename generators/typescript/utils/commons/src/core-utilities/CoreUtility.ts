import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ExportedDirectory } from "../exports-manager";
import { Reference } from "../referencing";

export type CoreUtilityName = string;

export declare namespace CoreUtility {
    export interface Options {
        streamType: "wrapper" | "web";
        formDataSupport: "Node16" | "Node18";
        fetchSupport: "node-fetch" | "native";
    }
    export interface Init {
        getReferenceToExport: (args: { manifest: CoreUtility.Manifest; exportedName: string }) => Reference;
    }

    export interface Manifest {
        name: CoreUtilityName;
        pathInCoreUtilities: ExportedDirectory;
        addDependencies?: (dependencyManager: DependencyManager, options: Options) => void;
        dependsOn?: CoreUtility.Manifest[];
        getFilesPatterns: (options: Options) => {
            patterns: string | string[];
            ignore?: string | string[];
        };
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
