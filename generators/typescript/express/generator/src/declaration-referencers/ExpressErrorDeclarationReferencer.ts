import { ExportedFilePath, Reference, getExportedDirectoriesForFernFilepath } from "@fern-typescript/commons";

import { RelativeFilePath } from "@fern-api/fs-utils";

import { DeclaredErrorName } from "@fern-fern/ir-sdk/api";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export const ERRORS_DIRECTORY_NAME = "errors";

export class ExpressErrorDeclarationReferencer extends AbstractDeclarationReferencer<DeclaredErrorName> {
    public getExportedFilepath(errorName: DeclaredErrorName): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                ...getExportedDirectoriesForFernFilepath({
                    fernFilepath: errorName.fernFilepath,
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

    public getFilename(errorName: DeclaredErrorName): string {
        return `${this.getExportedName(errorName)}.ts`;
    }

    public getExportedName(errorName: DeclaredErrorName): string {
        return errorName.name.pascalCase.unsafeName;
    }

    public getReferenceToError(args: DeclarationReferencer.getReferenceTo.Options<DeclaredErrorName>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }
}
