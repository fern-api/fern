import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { FernConstants } from "@fern-fern/ir-model/ir";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { ExpressionReferenceNode, TypeReferenceNode, WrapperName, Zurg } from "@fern-typescript/commons-v2";
import { SourceFile, ts } from "ts-morph";
import { CoreUtilities } from "./core-utilities";
import { ExternalDependencies } from "./external-dependencies/ExternalDependencies";
import { ParsedAuthSchemes } from "./ParsedAuthSchemes";
import { Reference } from "./Reference";

export interface SdkFile {
    sourceFile: SourceFile;

    // types
    getReferenceToType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToNamedType: (typeName: DeclaredTypeName) => Reference;
    getReferenceToRawType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToRawNamedType: (typeReference: DeclaredTypeName) => Reference;
    getSchemaOfTypeReference: (typeReference: TypeReference) => Zurg.Schema;
    getSchemaOfNamedType: (typeName: DeclaredTypeName) => Zurg.Schema;
    resolveTypeReference: (typeReference: TypeReference) => ResolvedTypeReference;
    convertExpressionToString: (expression: ts.Expression, type: TypeReference) => ExpressionReferenceNode;

    // errors
    getErrorDeclaration: (errorName: DeclaredErrorName) => ErrorDeclaration;
    getReferenceToError: (errorName: DeclaredErrorName) => Reference;
    getReferenceToRawError: (errorName: DeclaredErrorName) => Reference;
    getErrorSchema: (errorName: DeclaredErrorName) => Zurg.Schema;

    // services
    getReferenceToService: (serviceName: DeclaredServiceName, options: { importAlias: string }) => Reference;
    getServiceDeclaration: (serviceName: DeclaredServiceName) => HttpService;
    getReferenceToEndpointFile: (serviceName: DeclaredServiceName, endpoint: HttpEndpoint) => Reference;
    getReferenceToEndpointSchemaFile: (serviceName: DeclaredServiceName, endpoint: HttpEndpoint) => Reference;

    // wrappers
    getReferenceToWrapper: (wrapperName: WrapperName, options: { importAlias: string }) => Reference;

    // misc
    externalDependencies: ExternalDependencies;
    coreUtilities: CoreUtilities;
    authSchemes: ParsedAuthSchemes;
    fernConstants: FernConstants;
}
