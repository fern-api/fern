import { ErrorDeclaration, ErrorName, FernConstants, TypeReference } from "@fern-fern/ir-model";
import { ServiceName } from "@fern-fern/ir-model/services";
import { ResolvedType } from "@fern-typescript/resolvers";
import { SourceFile, ts } from "ts-morph";
import { ExternalDependencies } from "./external-dependencies/ExternalDependencies";
import { ServiceReference } from "./ServiceReference";

export interface File {
    sourceFile: SourceFile;
    getReferenceToType: (typeReference: TypeReference) => ts.TypeNode;
    resolveTypeReference: (typeReference: TypeReference) => ResolvedType;
    getErrorDeclaration: (errorName: ErrorName) => ErrorDeclaration;
    getReferenceToError: (errorName: ErrorName) => ts.TypeNode;
    addDependency: (name: string, version: string, options?: { preferPeer?: boolean }) => void;
    getReferenceToService: (serviceName: ServiceName) => ServiceReference;
    externalDependencies: ExternalDependencies;
    fernConstants: FernConstants;
}
