export { constructCasingsGenerator, type CasingsGenerator } from "./casings/CasingsGenerator";
export { constructHttpPath } from "./converters/services/constructHttpPath";
export {
    DEFAULT_BODY_PROPERTY_KEY_IN_WRAPPER,
    DEFAULT_REQUEST_PARAMETER_NAME,
    doesRequestHaveNonBodyProperties
} from "./converters/services/convertHttpSdkRequest";
export { getHeaderName, resolvePathParameter } from "./converters/services/convertHttpService";
export { getQueryParameterName } from "./converters/services/convertQueryParameter";
export {
    getSingleUnionTypeName,
    getUnionDiscriminant,
    getUnionDiscriminantName
} from "./converters/type-declarations/convertDiscriminatedUnionTypeDeclaration";
export { getEnumName } from "./converters/type-declarations/convertEnumTypeDeclaration";
export { getPropertyName } from "./converters/type-declarations/convertObjectTypeDeclaration";
export * as ExampleValidators from "./examples";
export { constructFernFileContext, constructRootApiFileContext, type FernFileContext } from "./FernFileContext";
export { generateIntermediateRepresentation } from "./generateIntermediateRepresentation";
export { EndpointResolverImpl, type EndpointResolver } from "./resolvers/EndpointResolver";
export { ErrorResolverImpl, type ErrorResolver } from "./resolvers/ErrorResolver";
export { ExampleResolverImpl, type ExampleResolver } from "./resolvers/ExampleResolver";
export { type ResolvedEndpoint } from "./resolvers/ResolvedEndpoint";
export { type ResolvedContainerType, type ResolvedType } from "./resolvers/ResolvedType";
export { TypeResolverImpl, type TypeResolver } from "./resolvers/TypeResolver";
export { VariableResolverImpl, type VariableResolver } from "./resolvers/VariableResolver";
export {
    convertObjectPropertyWithPathToString,
    getAllPropertiesForObject,
    getAllPropertiesForType,
    type ObjectPropertyWithPath
} from "./utils/getAllPropertiesForObject";
export { getResolvedPathOfImportedFile } from "./utils/getResolvedPathOfImportedFile";
export { parseReferenceToEndpointName, type ReferenceToEndpointName } from "./utils/parseReferenceToEndpointName";
export { parseReferenceToTypeName, type ReferenceToTypeName } from "./utils/parseReferenceToTypeName";
