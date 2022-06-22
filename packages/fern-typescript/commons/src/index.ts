export { addBrandedTypeAlias } from "./codegen/utils/addBrandedTypeAlias";
export { getRelativePathAsModuleSpecifierTo } from "./codegen/utils/getRelativePathAsModuleSpecifierTo";
export { getTextOfTsKeyword } from "./codegen/utils/getTextOfTsKeyword";
export { getTextOfTsNode } from "./codegen/utils/getTextOfTsNode";
export { maybeAddDocs } from "./codegen/utils/maybeAddDocs";
export * as visitorUtils from "./codegen/utils/visitorUtils";
export { FernWriters } from "./codegen/writers";
export { getWriterForMultiLineUnionType } from "./codegen/writers/getWriterForMultiLineUnionType";
export { addFernServiceUtilsDependency } from "./dependencies/addFernServiceUtilsDependency";
export { DependencyManager } from "./dependencies/DependencyManager";
export { generateUuidCall } from "./dependencies/generateUuidCall";
export { getOrCreateDirectory } from "./file-system/getOrCreateDirectory";
export { getOrCreateSourceFile } from "./file-system/getOrCreateSourceFile";
export { BUILD_PROJECT_SCRIPT_NAME } from "./generate-ts-project/generatePackageJson";
export {
    generateTypeScriptProject,
    type GeneratedProjectSrcInfo,
} from "./generate-ts-project/generateTypeScriptProject";
export { writeVolumeToDisk } from "./generate-ts-project/writeVolumeToDisk";
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
export { ResolvedType } from "./model-context/type-context/types";
export { createDirectoriesForFernFilepath } from "./model-context/utils/createDirectories";
export { exportFromModule } from "./model-context/utils/exportFromModule";
export { ImportStrategy } from "./model-context/utils/ImportStrategy";
export { validateSchema } from "./validateSchema";
