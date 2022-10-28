import { RelativeFilePath } from "@fern-api/core-utils";
import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";
import { getExportedDirectoriesForFernFilepath } from "./utils/getExportedDirectoriesForFernFilepath";

export const TYPES_DIRECTORY_NAME = "types";

export class TypeDeclarationReferencer extends AbstractDeclarationReferencer<DeclaredTypeName> {
    public getExportedFilepath(typeName: DeclaredTypeName): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                ...getExportedDirectoriesForFernFilepath({
                    fernFilepath: typeName.fernFilepathV2,
                    subExports: {
                        [RelativeFilePath.of(TYPES_DIRECTORY_NAME)]: {
                            exportAll: true,
                        },
                    },
                }),
                {
                    nameOnDisk: TYPES_DIRECTORY_NAME,
                    exportDeclaration: { exportAll: true },
                },
            ],
            file: {
                nameOnDisk: this.getFilename(typeName),
                exportDeclaration: { exportAll: true },
            },
        };
    }

    public getFilename(typeName: DeclaredTypeName): string {
        return `${this.getExportedName(typeName)}.ts`;
    }

    public getExportedName(typeName: DeclaredTypeName): string {
        return typeName.name;
    }

    public getReferenceToType(args: DeclarationReferencer.getReferenceTo.Options<DeclaredTypeName>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }
}
