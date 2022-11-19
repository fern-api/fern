import { RelativeFilePath } from "@fern-api/fs-utils";
import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";
import { getExportedDirectoriesForFernFilepath } from "./utils/getExportedDirectoriesForFernFilepath";

export const ERRORS_DIRECTORY_NAME = "errors";

export class ErrorDeclarationReferencer extends AbstractDeclarationReferencer<DeclaredErrorName> {
    public getExportedFilepath(errorName: DeclaredErrorName): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                ...getExportedDirectoriesForFernFilepath({
                    fernFilepath: errorName.fernFilepathV2,
                    subExports: {
                        [RelativeFilePath.of(ERRORS_DIRECTORY_NAME)]: {
                            exportAll: true,
                        },
                    },
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

    public getFilename(errorName: DeclaredTypeName): string {
        return `${this.getExportedName(errorName)}.ts`;
    }

    public getExportedName(errorName: DeclaredTypeName): string {
        return errorName.nameV3.unsafeName.pascalCase;
    }

    public getReferenceToError(args: DeclarationReferencer.getReferenceTo.Options<DeclaredErrorName>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }
}
