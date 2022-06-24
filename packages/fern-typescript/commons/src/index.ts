export { addFernServiceUtilsDependency } from "./dependencies/addFernServiceUtilsDependency";
export { DependencyManager, DependencyType } from "./dependencies/DependencyManager";
export { generateUuidCall } from "./dependencies/generateUuidCall";
export { createDirectoriesForFernFilepath } from "./file-system/createDirectories";
export { createDirectoryAndExportFromModule } from "./file-system/createDirectoryAndExportFromModule";
export { createSourceFileAndExportFromModule } from "./file-system/createSourceFileAndExportFromModule";
export { getOrCreateSourceFile } from "./file-system/getOrCreateSourceFile";
export { BUILD_PROJECT_SCRIPT_NAME } from "./generate-ts-project/generatePackageJson";
export {
    generateTypeScriptProject,
    type GeneratedProjectSrcInfo,
} from "./generate-ts-project/generateTypeScriptProject";
export { writeVolumeToDisk } from "./generate-ts-project/writeVolumeToDisk";
export { exportFromModule } from "./import-export/exportFromModule";
export { ImportStrategy } from "./import-export/ImportStrategy";
export { ModelContext } from "./model-context/ModelContext";
export {
    type GeneratedHttpEndpointTypes,
    type HttpServiceTypeMetadata,
    type HttpServiceTypeReference,
} from "./model-context/service-type-context/HttpServiceTypeContext";
export {
    type InlinedServiceTypeReference,
    type ServiceTypeReference,
} from "./model-context/service-type-context/types";
export {
    type GeneratedWebSocketOperationTypes,
    type WebSocketChannelTypeMetadata,
    type WebSocketChannelTypeReference,
} from "./model-context/service-type-context/WebSocketChannelTypeContext";
export { ResolvedType } from "./model-context/type-context/ResolvedType";
export { addBrandedTypeAlias } from "./utils/addBrandedTypeAlias";
export { getRelativePathAsModuleSpecifierTo } from "./utils/getRelativePathAsModuleSpecifierTo";
export { getTextOfTsKeyword } from "./utils/getTextOfTsKeyword";
export { getTextOfTsNode } from "./utils/getTextOfTsNode";
export { maybeAddDocs } from "./utils/maybeAddDocs";
export * as visitorUtils from "./utils/visitorUtils";
export { validateSchema } from "./validateSchema";
export { FernWriters } from "./writers";
export { getWriterForMultiLineUnionType } from "./writers/getWriterForMultiLineUnionType";
