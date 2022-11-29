import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { FernConstants } from "@fern-fern/ir-model/ir";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { ExpressionReferenceNode, TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { SourceFile, ts } from "ts-morph";
import { CoreUtilities } from "./core-utilities";
import { ExternalDependencies } from "./external-dependencies";
import { ParsedAuthSchemes } from "./ParsedAuthSchemes";
import { ParsedEnvironments } from "./ParsedEnvironments";
import { ParsedGlobalHeaders } from "./ParsedGlobalHeaders";
import { Reference } from "./Reference";

export interface SdkFile {
    sourceFile: SourceFile;
    externalDependencies: ExternalDependencies;
    coreUtilities: CoreUtilities;
    fernConstants: FernConstants;

    // types
    getReferenceToType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToNamedType: (typeName: DeclaredTypeName) => Reference;
    resolveTypeReference: (typeReference: TypeReference) => ResolvedTypeReference;
    resolveTypeName: (typeName: DeclaredTypeName) => ResolvedTypeReference;
    convertExpressionToString: (expression: ts.Expression, type: TypeReference) => ExpressionReferenceNode;

    // schemas
    getReferenceToRawType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToRawNamedType: (typeReference: DeclaredTypeName) => Reference;
    getSchemaOfTypeReference: (typeReference: TypeReference) => Zurg.Schema;
    getSchemaOfNamedType: (typeName: DeclaredTypeName) => Zurg.Schema;

    // errors
    getErrorDeclaration: (errorName: DeclaredErrorName) => ErrorDeclaration;
    getReferenceToError: (errorName: DeclaredErrorName) => Reference;
    getReferenceToRawError: (errorName: DeclaredErrorName) => Reference;
    getErrorSchema: (errorName: DeclaredErrorName) => Zurg.Schema;

    // services
    getReferenceToService: (serviceName: DeclaredServiceName, options: { importAlias: string }) => Reference;
    getReferenceToEndpointFileExport: (
        serviceName: DeclaredServiceName,
        endpoint: HttpEndpoint,
        export_: string | string[]
    ) => Reference;
    getReferenceToEndpointSchemaFileExport: (
        serviceName: DeclaredServiceName,
        endpoint: HttpEndpoint,
        export_: string | string[]
    ) => Reference;

    // misc
    authSchemes: ParsedAuthSchemes;
    environments: ParsedEnvironments | undefined;
    globalHeaders: ParsedGlobalHeaders;
}
