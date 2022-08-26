import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { FernConstants } from "@fern-fern/ir-model/ir";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpService } from "@fern-fern/ir-model/services/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import { WrapperName } from "@fern-typescript/commons-v2";
import { ResolvedType } from "@fern-typescript/resolvers";
import { SourceFile, ts } from "ts-morph";
import { ExternalDependencies } from "./external-dependencies/ExternalDependencies";
import { ParsedAuthSchemes } from "./ParsedAuthSchemes";
import { ServiceReference } from "./ServiceReference";
import { TypeReferenceNode } from "./TypeReferenceNode";
import { WrapperReference } from "./WrapperReference";

export interface File {
    sourceFile: SourceFile;
    getReferenceToType: (typeReference: TypeReference) => TypeReferenceNode;
    resolveTypeReference: (typeReference: TypeReference) => ResolvedType;
    getErrorDeclaration: (errorName: DeclaredErrorName) => ErrorDeclaration;
    getReferenceToError: (errorName: DeclaredErrorName) => ts.TypeNode;
    addDependency: (name: string, version: string, options?: { preferPeer?: boolean }) => void;
    getServiceDeclaration: (serviceName: DeclaredServiceName) => HttpService;
    getReferenceToService: (serviceName: DeclaredServiceName) => ServiceReference;
    getReferenceToWrapper: (wrapperName: WrapperName) => WrapperReference;
    externalDependencies: ExternalDependencies;
    authSchemes: ParsedAuthSchemes;
    fernConstants: FernConstants;
}
