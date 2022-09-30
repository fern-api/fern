import { WrapperName } from "@fern-typescript/commons-v2";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";
import { createExportForFernFilepathDirectory } from "./utils/getExportedDirectoriesForFernFilepath";

export class WrapperDeclarationReferencer extends AbstractDeclarationReferencer<WrapperName> {
    public getExportedFilepath(wrapperName: WrapperName): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                ...wrapperName.fernFilepath.map(createExportForFernFilepathDirectory),
            ],
            file: {
                nameOnDisk: this.getFilename(wrapperName),
                exportDeclaration: wrapperName.isRootWrapper ? { exportAll: true } : undefined,
            },
        };
    }

    public getFilename(wrapperName: WrapperName): string {
        return `${this.getExportedName(wrapperName)}.ts`;
    }

    public getExportedName(wrapperName: WrapperName): string {
        return wrapperName.name;
    }

    public getReferenceToWrapper(args: DeclarationReferencer.getReferenceTo.Options<WrapperName>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }
}
