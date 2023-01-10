import { Reference } from "@fern-typescript/contexts";
import { SourceFile } from "ts-morph";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { getReferenceToExportViaNamespaceImport } from "./utils/getReferenceToExportViaNamespaceImport";

export const TYPES_DIRECTORY_NAME = "types";

export class EnvironmentEnumDeclarationReferencer extends AbstractDeclarationReferencer {
    public getExportedFilepath(): ExportedFilePath {
        return {
            directories: [...this.containingDirectory],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: {
                    namedExports: [this.getExportedName()],
                },
            },
        };
    }

    public getFilename(): string {
        return "environments.ts";
    }

    public getExportedName(): string {
        return `${this.apiName}Environment`;
    }

    public getReferenceToEnvironmentEnum({
        importsManager,
        sourceFile,
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return getReferenceToExportViaNamespaceImport({
            exportedName: this.getExportedName(),
            filepathToNamespaceImport: this.getExportedFilepath(),
            filepathInsideNamespaceImport: undefined,
            namespaceImport: "environments",
            importsManager,
            referencedIn: sourceFile,
            packageName: this.packageName,
        });
    }
}
