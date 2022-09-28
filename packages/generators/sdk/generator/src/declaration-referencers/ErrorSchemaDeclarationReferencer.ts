import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { ERRORS_DIRECTORY_NAME } from "./ErrorDeclarationReferencer";
import { getExportedDirectoriesForFernFilepath } from "./utils/getExportedDirectoriesForFernFilepath";

export class ErrorSchemaDeclarationReferencer extends AbstractDeclarationReferencer<DeclaredErrorName> {
    public getExportedFilepath(errorName: DeclaredErrorName): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                ...getExportedDirectoriesForFernFilepath({
                    fernFilepath: errorName.fernFilepath,
                }),
                {
                    nameOnDisk: ERRORS_DIRECTORY_NAME,
                    exportDeclaration: { exportAll: true },
                },
            ],
            file: {
                nameOnDisk: this.getFilename(errorName),
                exportDeclaration: { exportAll: true },
            },
        };
    }

    public getFilename(errorName: DeclaredErrorName): string {
        return `${this.getExportedName(errorName)}.ts`;
    }

    public getExportedName(errorName: DeclaredErrorName): string {
        return errorName.name;
    }
}
