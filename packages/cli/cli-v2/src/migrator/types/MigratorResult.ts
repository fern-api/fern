import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { MigratorWarning } from "./MigratorWarning.js";

export interface MigratorResult {
    success: boolean;
    warnings: MigratorWarning[];
    migratedFiles: AbsoluteFilePath[];
    outputPath?: AbsoluteFilePath;
}
