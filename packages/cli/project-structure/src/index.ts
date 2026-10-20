export {
    type ApiFolderSelection,
    hasApiConfiguration,
    isApiSelected,
    rootOwnsSdkConfig,
    selectApiFolders,
    shouldLoadApiWorkspaces
} from "./api/index.js";
export { getDocsApiSectionsWithInlineSpecs } from "./docs/index.js";
export { anyDirectoryHasSdkConfig, hasGeneratorsFile, isSdkConfigOnly } from "./generation/index.js";
export {
    type ActiveGeneratorsFileName,
    type ApiFolder,
    definitionDirectoryExists,
    detectProjectDir,
    detectWorkspaceDir,
    docsConfigFilePath,
    findDocsConfigFile,
    findGeneratorsFile,
    findReadableSdkConfigFile,
    findSdkConfigFile,
    type GeneratorsFile,
    type GeneratorsFileName,
    type ProjectDir,
    rootApiFilePath,
    sdkConfigFilePath,
    type WorkspaceDir
} from "./workspace/index.js";
export * from "./workspace/names.js";
