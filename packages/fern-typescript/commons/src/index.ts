export { getFilePathForError } from "./codegen/references/getFilePathForError";
export { getFilePathForNamedType } from "./codegen/references/getFilePathForNamedType";
export { getNamedTypeReference } from "./codegen/references/getNamedTypeReference";
export { getTypeReference } from "./codegen/references/getTypeReference";
export { generateTypeUtilsReference } from "./codegen/type-utils/generateTypeUtilsReference";
export { addBrandedTypeAlias } from "./codegen/utils/addBrandedTypeAlias";
export { getRelativePathAsModuleSpecifierTo } from "./codegen/utils/getRelativePathAsModuleSpecifierTo";
export { getTextOfTsKeyword } from "./codegen/utils/getTextOfTsKeyword";
export { getTextOfTsNode } from "./codegen/utils/getTextOfTsNode";
export { maybeAddDocs } from "./codegen/utils/maybeAddDocs";
export * as visitorUtils from "./codegen/utils/visitorUtils";
export { FernWriters } from "./codegen/writers";
export { getWriterForMultiLineUnionType } from "./codegen/writers/getWriterForMultiLineUnionType";
export { addFernServiceUtilsDependency } from "./dependencies/addFernServiceUtilsDependency";
export { addUuidDependency } from "./dependencies/addUuidDependency";
export { DependencyManager } from "./dependencies/DependencyManager";
export { getOrCreateDirectory } from "./file-system/getOrCreateDirectory";
export { getOrCreateSourceFile } from "./file-system/getOrCreateSourceFile";
export { ProjectCreator } from "./file-system/ProjectCreator";
export { BUILD_PROJECT_SCRIPT_NAME } from "./generate-ts-project/generatePackageJson";
export {
    generateTypeScriptProject,
    type GeneratedProjectSrcInfo,
} from "./generate-ts-project/generateTypeScriptProject";
export { writeVolumeToDisk } from "./generate-ts-project/writeVolumeToDisk";
export { TypeResolver } from "./type-resolver/TypeResolver";
export { ResolvedType } from "./type-resolver/types";
export { validateSchema } from "./validateSchema";
