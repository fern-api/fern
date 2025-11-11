export {
    DEFAULT_BODY_PROPERTY_KEY_IN_WRAPPER,
    DEFAULT_REQUEST_PARAMETER_NAME,
    doesRequestHaveNonBodyProperties
} from "./converters/services/convertHttpSdkRequest";
export { getHeaderName, resolvePathParameter } from "./converters/services/convertHttpService";
export { getQueryParameterName } from "./converters/services/convertQueryParameter";
export { convertResponseErrors } from "./converters/services/convertResponseErrors";
export {
    getSingleUnionTypeName,
    getUnionDiscriminant,
    getUnionDiscriminantName
} from "./converters/type-declarations/convertDiscriminatedUnionTypeDeclaration";
export { getEnumName } from "./converters/type-declarations/convertEnumTypeDeclaration";
export { getPropertyName } from "./converters/type-declarations/convertObjectTypeDeclaration";
export { convertIrToDynamicSnippetsIr } from "./dynamic-snippets/convertIrToDynamicSnippetsIr";
export * as ExampleValidators from "./examples";
export { constructFernFileContext, constructRootApiFileContext, type FernFileContext } from "./FernFileContext";
export { generateIntermediateRepresentation } from "./generateIntermediateRepresentation";
export { type EndpointResolver, EndpointResolverImpl } from "./resolvers/EndpointResolver";
export { type ErrorResolver, ErrorResolverImpl } from "./resolvers/ErrorResolver";
export { type ExampleResolver, ExampleResolverImpl } from "./resolvers/ExampleResolver";
export { type ResolvedEndpoint } from "./resolvers/ResolvedEndpoint";
export { type ResolvedContainerType, type ResolvedType } from "./resolvers/ResolvedType";
export { type TypeResolver, TypeResolverImpl } from "./resolvers/TypeResolver";
export { type VariableResolver, VariableResolverImpl } from "./resolvers/VariableResolver";
export { convertToFernFilepath } from "./utils/convertToFernFilepath";
export {
    convertObjectPropertyWithPathToString,
    getAllPropertiesForObject,
    getAllPropertiesForType,
    type ObjectPropertyWithPath
} from "./utils/getAllPropertiesForObject";
export { getEndpointPathParameters } from "./utils/getEndpointPathParameters";
export { getResolvedPathOfImportedFile } from "./utils/getResolvedPathOfImportedFile";
export { parseInlineType } from "./utils/parseInlineType";
export { parseReferenceToEndpointName, type ReferenceToEndpointName } from "./utils/parseReferenceToEndpointName";
export { parseReferenceToTypeName, type ReferenceToTypeName } from "./utils/parseReferenceToTypeName";
