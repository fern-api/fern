import {
    ExportedDirectory,
    ExportedFilePath,
    PackageId,
    Reference,
    getExportedDirectoriesForFernFilepath
} from "@fern-typescript/commons";

import { SubpackageId } from "@fern-fern/ir-sdk/api";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

const UTILS_DIRECTORY = "utils";

export class SdkClientUtilsDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<SubpackageId> {
    public getExportedFilepath(subpackageId: SubpackageId, filename?: string): ExportedFilePath {
        return {
            directories: this.getExportedDirectory(subpackageId),
            file: {
                nameOnDisk: filename ?? this.getFilename()
            }
        };
    }

    public getAllExportedFilepaths(subpackageId: SubpackageId): Record<string, ExportedFilePath> {
        const baseDir = this.getExportedDirectory(subpackageId);
        return {
            "createWebSocket.ts": { directories: baseDir, file: { nameOnDisk: "createWebSocket.ts" } },
            "getAuthHeaders.ts": { directories: baseDir, file: { nameOnDisk: "getAuthHeaders.ts" } },
            "getAuthProtocols.ts": { directories: baseDir, file: { nameOnDisk: "getAuthProtocols.ts" } },
            "getHeaders.ts": { directories: baseDir, file: { nameOnDisk: "getHeaders.ts" } }
        };
    }

    protected getExportedDirectory(subpackageId: SubpackageId): ExportedDirectory[] {
        const fernFilepath = this.packageResolver.resolvePackage(this.getPackageIdFromName(subpackageId)).fernFilepath;

        return [
            ...this.containingDirectory,
            ...getExportedDirectoriesForFernFilepath({
                fernFilepath
            }),
            {
                nameOnDisk: UTILS_DIRECTORY,
                exportDeclaration: { exportAll: true }
            }
        ];
    }

    public getFilename(): string {
        return "index.ts";
    }

    public getExportedName(subpackageId: SubpackageId): string {
        const subpackage = this.packageResolver.resolveSubpackage(subpackageId);
        return `${subpackage.name.pascalCase.safeName}Utils`;
    }

    public getReferenceToUtils(args: DeclarationReferencer.getReferenceTo.Options<SubpackageId>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    protected getPackageIdFromName(subpackageId: SubpackageId): PackageId {
        return { isRoot: false, subpackageId };
    }
}
