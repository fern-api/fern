import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getExportedDirectoriesForFernFilepath, Reference } from "@fern-typescript/commons";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer.js";
import { DeclarationReferencer } from "./DeclarationReferencer.js";

export const TYPES_DIRECTORY_NAME = "types";

export declare namespace TypeDeclarationReferencer {
    export type Init = AbstractDeclarationReferencer.Init;
}

export class TypeDeclarationReferencer extends AbstractDeclarationReferencer<FernIr.DeclaredTypeName> {
    public getExportedFilepath(typeName: FernIr.DeclaredTypeName): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                ...getExportedDirectoriesForFernFilepath({
                    fernFilepath: typeName.fernFilepath,
                    caseConverter: this.caseConverter,
                    subExports: {
                        [RelativeFilePath.of(TYPES_DIRECTORY_NAME)]: {
                            exportAll: true
                        }
                    }
                }),
                {
                    nameOnDisk: TYPES_DIRECTORY_NAME,
                    exportDeclaration: { exportAll: true }
                }
            ],
            file: {
                nameOnDisk: this.consolidateTypeFiles ? `${TYPES_DIRECTORY_NAME}.ts` : this.getFilename(typeName),
                exportDeclaration: { exportAll: true }
            }
        };
    }

    public getFilename(typeName: FernIr.DeclaredTypeName): string {
        return `${this.getExportedName(typeName)}.ts`;
    }

    public getExportedName(typeName: FernIr.DeclaredTypeName): string {
        return this.caseConverter.pascalSafe(typeName.name);
    }

    public getReferenceToType(args: DeclarationReferencer.getReferenceTo.Options<FernIr.DeclaredTypeName>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }
}
