import { ErrorName, FernConstants, TypeReference } from "@fern-fern/ir-model";
import { ServiceName } from "@fern-fern/ir-model/services";
import { ts } from "@ts-morph/common";
import { SourceFile } from "ts-morph";
import { FernServiceUtils } from "./FernServiceUtils";
import { Logger } from "./logger/Logger";
import { ResolvedType } from "./type-resolver/ResolvedType";

export type ModuleSpecifier = string;

export interface DeclarationHandlerArgs {
    withFile: (run: (file: File) => void | Promise<void>) => Promise<void>;
    logger: Logger;
    fernConstants: FernConstants;
}

export type FileExportStrategy = { type: "all" } | { type: "namespace"; namespace: string };

export interface File {
    sourceFile: SourceFile;
    getReferenceToType: (typeReference: TypeReference) => ts.TypeNode;
    resolveTypeReference: (typeReference: TypeReference) => ResolvedType;
    getReferenceToError: (errorName: ErrorName) => ts.TypeNode;
    addDependency: (name: string, version: string, options?: { preferPeer?: boolean }) => void;
    getReferenceToService: (serviceName: ServiceName) => ts.EntityName;
    serviceUtils: FernServiceUtils;
}

export interface ImportOptions {
    importDirectlyFromFile: boolean;
}
