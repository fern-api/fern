import {
    ImportsManager,
    JavaScriptRuntime,
    NpmPackage,
    PackageId,
    getExportedDirectoriesForFernFilepath
} from "@fern-typescript/commons";
import { GeneratedSdkClientUtils, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

export declare namespace BaseGeneratedUtilsFileImpl {
    export interface Init {
        importsManager: ImportsManager;
        intermediateRepresentation: IntermediateRepresentation;
        packageId: PackageId;
        packageResolver: PackageResolver;
        errorResolver: ErrorResolver;
        targetRuntime: JavaScriptRuntime;
        npmPackage: NpmPackage | undefined;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
        allowExtraFields: boolean;
        filename: string;
    }
}

export abstract class BaseGeneratedUtilsFileImpl {
    protected importsManager: ImportsManager;
    protected intermediateRepresentation: IntermediateRepresentation;
    protected packageId: PackageId;
    protected packageResolver: PackageResolver;
    protected errorResolver: ErrorResolver;
    protected targetRuntime: JavaScriptRuntime;
    protected npmPackage: NpmPackage | undefined;
    protected includeSerdeLayer: boolean;
    protected retainOriginalCasing: boolean;
    protected omitUndefined: boolean;
    protected allowExtraFields: boolean;
    protected _filename: string;

    constructor({
        importsManager,
        intermediateRepresentation,
        packageId,
        packageResolver,
        errorResolver,
        targetRuntime,
        npmPackage,
        includeSerdeLayer,
        retainOriginalCasing,
        omitUndefined,
        allowExtraFields,
        filename
    }: BaseGeneratedUtilsFileImpl.Init) {
        this.importsManager = importsManager;
        this.intermediateRepresentation = intermediateRepresentation;
        this.packageId = packageId;
        this.packageResolver = packageResolver;
        this.errorResolver = errorResolver;
        this.targetRuntime = targetRuntime;
        this.npmPackage = npmPackage;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.omitUndefined = omitUndefined;
        this.allowExtraFields = allowExtraFields;
        this._filename = filename;
    }

    public get filename(): string {
        return this._filename;
    }

    public get outputDirectory(): string {
        const package_ = this.packageResolver.resolvePackage(this.packageId);
        const exportedDirectories = getExportedDirectoriesForFernFilepath({
            fernFilepath: package_.fernFilepath
        });

        const pathParts = ["api"];

        if (!this.packageId.isRoot) {
            pathParts.push("resources");
            if (exportedDirectories.length > 0) {
                pathParts.push(...exportedDirectories.map((dir) => dir.nameOnDisk));
            } else {
                pathParts.push(this.packageId.subpackageId);
            }
        } else if (exportedDirectories.length > 0) {
            pathParts.push("resources");
            pathParts.push(...exportedDirectories.map((dir) => dir.nameOnDisk));
        }

        pathParts.push("utils");

        return pathParts.join("/");
    }

    public abstract writeToFile(context: SdkContext): void;

    // Common AST utility methods for consistent type definitions
    protected createApiKeyParameter(): { name: string; type: string } {
        return {
            name: "apiKey",
            type: "string"
        };
    }

    protected createStringRecordType(): string {
        return "Record<string, string>";
    }

    protected createStringArrayType(): string {
        return "string[]";
    }

    protected createStringType(): string {
        return "string";
    }

    protected createBooleanType(): string {
        return "boolean";
    }
}
