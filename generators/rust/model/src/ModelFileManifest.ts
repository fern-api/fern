import { ModuleExportOwner } from "./collectModuleExports.js";

/**
 * Location of the manifest inside the generated crate, relative to its root.
 * Written only when `emitFileManifest` is enabled.
 */
export const MODEL_FILE_MANIFEST_PATH = ".fern/model-file-manifest.json";

export interface ModelFileManifestModule {
    /** Generated file under `src/`, e.g. `user_type.rs`. */
    filename: string;
    /** Module name as declared in `mod.rs`. */
    moduleName: string;
    /** Type the module exports. */
    typeName: string;
    owner: ModuleExportOwner;
}

export interface ModelFileManifest {
    modules: ModelFileManifestModule[];
}
