import { ErrorName, FernConstants, TypeReference } from "@fern-fern/ir-model";
import { ServiceName } from "@fern-fern/ir-model/services";
import { ts } from "@ts-morph/common";
import { SourceFile } from "ts-morph";
import { ExternalDependencies } from "./external-dependencies/ExternalDependencies";
import { GeneratorContext } from "./generator-context/GeneratorContext";
import { ResolvedType } from "./type-resolver/ResolvedType";
import { ServiceReference } from "./utils/getReferenceToService";

export type ModuleSpecifier = string;

export interface DeclarationHandlerArgs {
    withFile: (run: (file: File) => void | Promise<void>) => Promise<void>;
    context: GeneratorContext;
}

export type FileExportStrategy = { type: "all" } | { type: "namespace"; namespace: string };

export interface File {
    sourceFile: SourceFile;
    getReferenceToType: (typeReference: TypeReference) => ts.TypeNode;
    resolveTypeReference: (typeReference: TypeReference) => ResolvedType;
    getReferenceToError: (errorName: ErrorName) => ts.TypeNode;
    addDependency: (name: string, version: string, options?: { preferPeer?: boolean }) => void;
    getReferenceToService: (serviceName: ServiceName) => ServiceReference;
    externalDependencies: ExternalDependencies;
    fernConstants: FernConstants;
}
