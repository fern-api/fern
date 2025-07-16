export { getExampleEndpointCalls } from './codegen-utils/getExampleEndpointCalls'
export { getPropertyKey } from './codegen-utils/getPropertyKey'
export { getSchemaOptions } from './codegen-utils/getSchemaOptions'
export { getTextOfTsKeyword } from './codegen-utils/getTextOfTsKeyword'
export { getTextOfTsNode } from './codegen-utils/getTextOfTsNode'
export { maybeAddDocsNode, maybeAddDocsStructure } from './codegen-utils/maybeAddDocs'
export { writerToString } from './codegen-utils/writerToString'
export { generateInlineAliasModule, generateInlinePropertiesModule } from './codegen-utils/generateInlineModule'
export {
    getParameterNameForPositionalPathParameter,
    getParameterNameForPropertyPathParameter,
    getParameterNameForPropertyPathParameterName,
    getParameterNameForRootPathParameter,
    getParameterNameForRootExamplePathParameter
} from './codegen-utils/getParameterNameForPathParameter'
export * from './core-utilities'
export { type Zurg } from './core-utilities/Zurg'
export { DependencyManager, DependencyType, type PackageDependencies } from './dependency-manager/DependencyManager'
export * from './exports-manager'
export * from './express'
export { type ExpressionReferenceNode } from './ExpressionReferenceNode'
export * from './external-dependencies'
export * from './imports-manager'
export { getFullPathForEndpoint } from './getFullPathForEndpoint'
export { type PackageId } from './PackageId'
export * from './referencing'
export { type TypeReferenceNode } from './TypeReferenceNode'
export * from './typescript-project'
export { FernWriters, ObjectWriter } from './writers'
export { getWriterForMultiLineUnionType } from './writers/getWriterForMultiLineUnionType'
export * from '@fern-api/typescript-base'
export { fixImportsForEsm } from './typescript-project/fixImportsForEsm'
export { writeTemplateFiles } from './writeTemplateFiles'
