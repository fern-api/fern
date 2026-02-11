export {
    DEFAULT_BODY_PROPERTY_KEY_IN_WRAPPER,
    DEFAULT_REQUEST_PARAMETER_NAME,
    doesRequestHaveNonBodyProperties
} from "./converters/services/convertHttpSdkRequest.js";
export { getHeaderName, resolvePathParameter } from "./converters/services/convertHttpService.js";
export { isRawPathPaginationSchema, isRawUriPaginationSchema } from "./converters/services/convertPaginationUtils.js";
export { getQueryParameterName } from "./converters/services/convertQueryParameter.js";
export { convertResponseErrors } from "./converters/services/convertResponseErrors.js";
export {
    getSingleUnionTypeName,
    getUnionDiscriminant,
    getUnionDiscriminantName
} from "./converters/type-declarations/convertDiscriminatedUnionTypeDeclaration.js";
export { getEnumName } from "./converters/type-declarations/convertEnumTypeDeclaration.js";
export { getPropertyName } from "./converters/type-declarations/convertObjectTypeDeclaration.js";
export { convertIrToDynamicSnippetsIr } from "./dynamic-snippets/convertIrToDynamicSnippetsIr.js";
export * as ExampleValidators from "./examples/index.js";
export { constructFernFileContext, constructRootApiFileContext, type FernFileContext } from "./FernFileContext.js";
export { generateIntermediateRepresentation } from "./generateIntermediateRepresentation.js";
export { type EndpointResolver, EndpointResolverImpl } from "./resolvers/EndpointResolver.js";
export { type ErrorResolver, ErrorResolverImpl } from "./resolvers/ErrorResolver.js";
export { type ExampleResolver, ExampleResolverImpl } from "./resolvers/ExampleResolver.js";
export { type ResolvedEndpoint } from "./resolvers/ResolvedEndpoint.js";
export { type ResolvedContainerType, type ResolvedType } from "./resolvers/ResolvedType.js";
export { type TypeResolver, TypeResolverImpl } from "./resolvers/TypeResolver.js";
export { type VariableResolver, VariableResolverImpl } from "./resolvers/VariableResolver.js";
export { convertToFernFilepath } from "./utils/convertToFernFilepath.js";
export {
    convertObjectPropertyWithPathToString,
    getAllPropertiesForObject,
    getAllPropertiesForType,
    type ObjectPropertyWithPath
} from "./utils/getAllPropertiesForObject.js";
export { getEndpointPathParameters } from "./utils/getEndpointPathParameters.js";
export { getResolvedPathOfImportedFile } from "./utils/getResolvedPathOfImportedFile.js";
export { parseInlineType } from "./utils/parseInlineType.js";
export { parseReferenceToEndpointName, type ReferenceToEndpointName } from "./utils/parseReferenceToEndpointName.js";
export { parseReferenceToTypeName, type ReferenceToTypeName } from "./utils/parseReferenceToTypeName.js";
