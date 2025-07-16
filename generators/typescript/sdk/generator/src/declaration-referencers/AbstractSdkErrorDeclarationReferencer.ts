import { ExportedFilePath, ExportsManager, ImportsManager, Reference } from "@fern-typescript/commons"
import { SourceFile } from "ts-morph"

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer"

const ERRORS_DIRECTORY = "errors"

export abstract class AbstractSdkErrorDeclarationReferencer extends AbstractDeclarationReferencer {
    public getExportedFilepath(): ExportedFilePath {
        const exportedName = this.getExportedName()
        return {
            directories: [
                ...this.containingDirectory,
                {
                    nameOnDisk: ERRORS_DIRECTORY,
                    exportDeclaration: { namedExports: [exportedName] }
                }
            ],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: { namedExports: [exportedName] }
            }
        }
    }

    public getFilename(): string {
        return `${this.getExportedName()}.ts`
    }

    public getReferenceToError({
        importsManager,
        exportsManager,
        referencedIn
    }: {
        importsManager: ImportsManager
        exportsManager: ExportsManager
        referencedIn: SourceFile
    }): Reference {
        return this.getReferenceTo(this.getExportedName(), {
            name: undefined as never,
            importsManager,
            exportsManager,
            referencedIn,
            importStrategy: {
                type: "fromRoot",
                namespaceImport: "errors"
            }
        })
    }

    protected abstract getExportedName(): string
}
