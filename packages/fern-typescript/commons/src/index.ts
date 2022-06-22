export { getFilePathForModelReference, getFilePathInModel } from "./codegen/references/getFilePathForModelReference";
export { getModelTypeReference } from "./codegen/references/getModelTypeReference";
export { getTypeReference } from "./codegen/references/getTypeReference";
export { generateTypeUtilsReference } from "./codegen/type-utils/generateTypeUtilsReference";
export { addBrandedTypeAlias } from "./codegen/utils/addBrandedTypeAlias";
export {
    createPropertyAccessExpression,
    createQualifiedTypeReference,
    getQualifiedReferenceToModel,
} from "./codegen/utils/getQualifiedReferenceToModel";
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
export { ProjectCreator } from "./file-system/ProjectCreator";
export { BUILD_PROJECT_SCRIPT_NAME } from "./generate-ts-project/generatePackageJson";
export {
    generateTypeScriptProject,
    type GeneratedProjectSrcInfo,
} from "./generate-ts-project/generateTypeScriptProject";
export { writeVolumeToDisk } from "./generate-ts-project/writeVolumeToDisk";
export { ImportStrategy } from "./model-context/base-context/BaseModelContext";
export { ModelContext } from "./model-context/ModelContext";
export { ErrorResolver } from "./resolvers/ErrorResolver";
export { resolveType, TypeResolver } from "./resolvers/TypeResolver";
export { ResolvedType } from "./resolvers/types";
export { validateSchema } from "./validateSchema";
