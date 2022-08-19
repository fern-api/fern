export { DependencyManager, DependencyType } from "./dependencies/DependencyManager";
export { generateUuidCall } from "./dependencies/generateUuidCall";
export {
    getReferenceToFernServiceUtilsBasicAuthMethod,
    getReferenceToFernServiceUtilsBearerTokenMethod,
    getReferenceToFernServiceUtilsType,
    getReferenceToFernServiceUtilsValue,
    invokeSupplier,
} from "./dependencies/getReferenceToFernServiceUtils";
export {
    createDirectories,
    createDirectoriesForFernFilepath,
    type DirectoryNameWithExportStrategy,
} from "./file-system/createDirectories";
export { createDirectoriesAndSourceFile, type PathToSourceFile } from "./file-system/createDirectoriesAndSourceFile";
export { createDirectoryAndExportFromModule } from "./file-system/createDirectoryAndExportFromModule";
export { createSourceFileAndExportFromModule } from "./file-system/createSourceFileAndExportFromModule";
export { getOrCreateSourceFile } from "./file-system/getOrCreateSourceFile";
export { getPackagePath, type PackagePath } from "./file-system/getPackagePath";
export { BUILD_PROJECT_SCRIPT_NAME } from "./generate-ts-project/generatePackageJson";
export {
    generateTypeScriptProject,
    type GeneratedProjectSrcInfo,
} from "./generate-ts-project/generateTypeScriptProject";
export { writeVolumeToDisk } from "./generate-ts-project/writeVolumeToDisk";
export type { FernTypescriptGeneratorConfig } from "./generator-config/FernTypescriptGeneratorConfig";
export {
    FernTypescriptGeneratorCustomConfigSchema,
    type FernTypescriptGeneratorCustomConfig,
} from "./generator-config/FernTypescriptGeneratorCustomConfig";
export {
    FernTypescriptGeneratorModeSchema,
    type FernTypescriptGeneratorMode,
} from "./generator-config/FernTypescriptGeneratorMode";
export { exportFromModule } from "./import-export/exportFromModule";
export { ImportStrategy } from "./import-export/ImportStrategy";
export { getPropertyKey } from "./utils/getPropertyKey";
export { getRelativePathAsModuleSpecifierTo } from "./utils/getRelativePathAsModuleSpecifierTo";
export { getTextOfTsKeyword } from "./utils/getTextOfTsKeyword";
export { getTextOfTsNode } from "./utils/getTextOfTsNode";
export { maybeAddDocs } from "./utils/maybeAddDocs";
export * as visitorUtils from "./utils/visitorUtils";
export { FernWriters } from "./writers";
export { getWriterForMultiLineUnionType } from "./writers/getWriterForMultiLineUnionType";
