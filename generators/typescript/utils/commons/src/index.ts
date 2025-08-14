export * from "@fern-api/typescript-base";
export { AsIsManager } from "./asIs/AsIsManager";
export { generateInlineAliasModule, generateInlinePropertiesModule } from "./codegen-utils/generateInlineModule";
export { getExampleEndpointCalls } from "./codegen-utils/getExampleEndpointCalls";
export {
    getParameterNameForPositionalPathParameter,
    getParameterNameForPropertyPathParameter,
    getParameterNameForPropertyPathParameterName,
    getParameterNameForRootExamplePathParameter,
    getParameterNameForRootPathParameter
} from "./codegen-utils/getParameterNameForPathParameter";
export { getPropertyKey } from "./codegen-utils/getPropertyKey";
export { getSchemaOptions } from "./codegen-utils/getSchemaOptions";
export { getTextOfTsKeyword } from "./codegen-utils/getTextOfTsKeyword";
export { getTextOfTsNode } from "./codegen-utils/getTextOfTsNode";
export { InlineConsts } from "./codegen-utils/inlineConsts";
export { maybeAddDocsNode, maybeAddDocsStructure } from "./codegen-utils/maybeAddDocs";
export { writerToString } from "./codegen-utils/writerToString";
export * from "./core-utilities";
export { type CoreUtilities } from "./core-utilities/CoreUtilities";
export { type Zurg } from "./core-utilities/Zurg";
export { DependencyManager, DependencyType, type PackageDependencies } from "./dependency-manager/DependencyManager";
export { type ExpressionReferenceNode } from "./ExpressionReferenceNode";
export * from "./exports-manager";
export * from "./express";
export * from "./external-dependencies";
export { getFullPathForEndpoint } from "./getFullPathForEndpoint";
export * from "./imports-manager";
export { type PackageId } from "./PackageId";
export * from "./public-exports-manager";
export * from "./referencing";
export { type TypeReferenceNode } from "./TypeReferenceNode";
export * from "./typescript-project";
export { fixImportsForEsm } from "./typescript-project/fixImportsForEsm";
export { FernWriters, ObjectWriter } from "./writers";
export { getWriterForMultiLineUnionType } from "./writers/getWriterForMultiLineUnionType";
export { writeTemplateFiles } from "./writeTemplateFiles";
