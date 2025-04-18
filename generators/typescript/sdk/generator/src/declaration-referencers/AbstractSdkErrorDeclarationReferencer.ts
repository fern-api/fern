import { ExportedFilePath, ImportsManager, Reference } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

const ERRORS_DIRECTORY = "errors";

export abstract class AbstractSdkErrorDeclarationReferencer extends AbstractDeclarationReferencer {
    public getExportedFilepath(): ExportedFilePath {
        const exportedName = this.getExportedName();
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
        };
    }

    public getFilename(): string {
        return `${this.getExportedName()}.ts`;
    }

    public getReferenceToError({
        importsManager,
        referencedIn
    }: {
        importsManager: ImportsManager;
        referencedIn: SourceFile;
    }): Reference {
        return this.getReferenceTo(this.getExportedName(), {
            name: undefined as never,
            importsManager,
            referencedIn,
            importStrategy: {
                type: "fromRoot",
                namespaceImport: "errors"
            }
        });
    }

    protected abstract getExportedName(): string;
}
