export {
    TypeReferenceLocation,
    type DefinitionFileAstNodeTypes,
    type DefinitionFileAstNodeVisitor,
    type DefinitionFileAstVisitor,
    type TypeDeclarationName,
} from "./ast/DefinitionFileAstVisitor";
export { type NodePath } from "./ast/NodePath";
export {
    type PackageMarkerAstNodeTypes,
    type PackageMarkerAstNodeVisitor,
    type PackageMarkerAstVisitor,
} from "./ast/PackageMarkerAstVisitor";
export {
    type RootApiFileAstNodeTypes,
    type RootApiFileAstNodeVisitor,
    type RootApiFileAstVisitor,
} from "./ast/RootApiFileAstVisitor";
export { visitDefinitionFileYamlAst } from "./ast/visitDefinitionFileYamlAst";
export { visitPackageMarkerYamlAst } from "./ast/visitPackageMarkerYamlAst";
export { visitRootApiFileYamlAst } from "./ast/visitRootApiFileYamlAst";
export { EXAMPLE_REFERENCE_PREFIX, YAML_SCHEMA_VERSION } from "./constants";
export * as RawSchemas from "./schemas";
export * from "./schemas/file-schemas";
export { getRequestBody } from "./utils/getRequestBody";
export { isInlineRequestBody } from "./utils/isInlineRequestBody";
export { isRawTextType } from "./utils/isRawTextType";
export { parseFileUploadRequest, type RawFileUploadRequest } from "./utils/parseFileUploadRequest";
export { parseRawFileType, type RawFileType } from "./utils/parseRawFileType";
export { RawPrimitiveType } from "./utils/RawPrimitiveType";
export { recursivelyVisitRawTypeReference } from "./utils/recursivelyVisitRawTypeReference";
export { isAnyAuthSchemes, isSingleAuthScheme, visitRawApiAuth, type RawApiAuthVisitor } from "./utils/visitRawApiAuth";
export {
    isHeaderAuthScheme,
    visitRawAuthSchemeDeclaration,
    type AuthSchemeDeclarationVisitor,
} from "./utils/visitRawAuthSchemeDeclaration";
export {
    isRawMultipleBaseUrlsEnvironment,
    isRawSingleBaseUrlEnvironment,
    visitRawEnvironmentDeclaration,
} from "./utils/visitRawEnvironmentDeclaration";
export {
    isVariablePathParameter,
    visitRawPathParameter,
    type PathParameterDeclarationVisitor,
} from "./utils/visitRawPathParameter";
export {
    isRawAliasDefinition,
    isRawDiscriminatedUnionDefinition,
    isRawEnumDefinition,
    isRawObjectDefinition,
    isRawUndiscriminatedUnionDefinition,
    visitRawTypeDeclaration,
    type RawTypeDeclarationVisitor,
} from "./utils/visitRawTypeDeclaration";
export { FernContainerRegex, visitRawTypeReference } from "./utils/visitRawTypeReference";
