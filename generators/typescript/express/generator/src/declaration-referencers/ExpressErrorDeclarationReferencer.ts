import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getExportedDirectoriesForFernFilepath, Reference } from "@fern-typescript/commons";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer.js";
import { DeclarationReferencer } from "./DeclarationReferencer.js";

export const ERRORS_DIRECTORY_NAME = "errors";

export class ExpressErrorDeclarationReferencer extends AbstractDeclarationReferencer<FernIr.DeclaredErrorName> {
    public getExportedFilepath(errorName: FernIr.DeclaredErrorName): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                ...getExportedDirectoriesForFernFilepath({
                    fernFilepath: errorName.fernFilepath,
                    caseConverter: this.case,
                    subExports: {
                        [RelativeFilePath.of(ERRORS_DIRECTORY_NAME)]: {
                            exportAll: true
                        }
                    }
                }),
                {
                    nameOnDisk: ERRORS_DIRECTORY_NAME,
                    exportDeclaration: { exportAll: true }
                }
            ],
            file: {
                nameOnDisk: this.getFilename(errorName),
                exportDeclaration: { exportAll: true }
            }
        };
    }

    public getFilename(errorName: FernIr.DeclaredErrorName): string {
        return `${this.getExportedName(errorName)}.ts`;
    }

    public getExportedName(errorName: FernIr.DeclaredErrorName): string {
        return this.case.pascalUnsafe(errorName.name);
    }

    public getReferenceToError(
        args: DeclarationReferencer.getReferenceTo.Options<FernIr.DeclaredErrorName>
    ): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }
}
