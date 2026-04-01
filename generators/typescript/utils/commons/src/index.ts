export { getOriginalName, getWireValue } from "@fern-api/base-generator";
export * from "@fern-api/typescript-base";
export { AsIsManager } from "./asIs/AsIsManager.js";
export {
    createNumericLiteralSafe,
    createNumericLiteralSafeTypeNode
} from "./codegen-utils/createNumericLiteralSafe.js";
export { deduplicateExamples } from "./codegen-utils/deduplicateExamples.js";
export { generateInlineAliasModule, generateInlinePropertiesModule } from "./codegen-utils/generateInlineModule.js";
export { getExampleEndpointCalls, getExampleEndpointCallsForTests } from "./codegen-utils/getExampleEndpointCalls.js";
export {
    getParameterNameForPositionalPathParameter,
    getParameterNameForPropertyPathParameter,
    getParameterNameForPropertyPathParameterName,
    getParameterNameForRootExamplePathParameter,
    getParameterNameForRootPathParameter
} from "./codegen-utils/getParameterNameForPathParameter.js";
export { getPropertyKey } from "./codegen-utils/getPropertyKey.js";
export { getSchemaOptions } from "./codegen-utils/getSchemaOptions.js";
export { getSdkParameterPropertyName } from "./codegen-utils/getSdkParameterPropertyName.js";
export { getTextOfTsKeyword } from "./codegen-utils/getTextOfTsKeyword.js";
export { getTextOfTsNode } from "./codegen-utils/getTextOfTsNode.js";
export { InlineConsts } from "./codegen-utils/inlineConsts.js";
export { isExpressionUndefined } from "./codegen-utils/isExpressionUndefined.js";
export { maybeAddDocsNode, maybeAddDocsStructure } from "./codegen-utils/maybeAddDocs.js";
export { toCamelCase } from "./codegen-utils/toCamelCase.js";
export { writerToString } from "./codegen-utils/writerToString.js";
export { type CoreUtilities } from "./core-utilities/CoreUtilities.js";
export * from "./core-utilities/index.js";
export { type Zurg } from "./core-utilities/Zurg.js";
export { DependencyManager, DependencyType, type PackageDependencies } from "./dependency-manager/DependencyManager.js";
export { type ExpressionReferenceNode } from "./ExpressionReferenceNode.js";
export * from "./exports-manager/index.js";
export * from "./express/index.js";
export * from "./external-dependencies/index.js";
export { getElementTypeFromArrayType } from "./getElementTypeFromArrayType.js";
export { getFullPathForEndpoint } from "./getFullPathForEndpoint.js";
export * from "./imports-manager/index.js";
export { type PackageId } from "./PackageId.js";
export * from "./public-exports-manager/index.js";
export * from "./referencing/index.js";
export { removeUndefinedAndNullFromTypeNode } from "./removeUndefinedAndNullFromTypeNode.js";
export { type TypeReferenceNode } from "./TypeReferenceNode.js";
export { convertJestImportsToVitest } from "./typescript-project/convertJestImportsToVitest.js";
export { fixImportsForEsm } from "./typescript-project/fixImportsForEsm.js";
export * from "./typescript-project/index.js";
export { getWriterForMultiLineUnionType } from "./writers/getWriterForMultiLineUnionType.js";
export { FernWriters, ObjectWriter } from "./writers/index.js";
export { writeTemplateFiles } from "./writeTemplateFiles.js";
