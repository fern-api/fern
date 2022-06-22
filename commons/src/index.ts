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
export { type HttpServiceTypeMetadata } from "./model-context/service-type-context/HttpServiceTypeContext";
export { type ServiceTypeMetadata } from "./model-context/service-type-context/ServiceTypeContext";
export { type WebSocketChannelTypeMetadata } from "./model-context/service-type-context/WebSocketChannelTypeContext";
export { ResolvedType } from "./model-context/type-context/types";
export { ImportStrategy } from "./model-context/utils/ImportStrategy";
export { validateSchema } from "./validateSchema";
