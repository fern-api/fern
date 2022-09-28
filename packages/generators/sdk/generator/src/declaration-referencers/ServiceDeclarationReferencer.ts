import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { getExportedDirectoriesForFernFilepath } from "./utils/getExportedDirectoriesForFernFilepath";

export class ServiceDeclarationReferencer extends AbstractDeclarationReferencer<DeclaredServiceName> {
    public getExportedFilepath(serviceName: DeclaredServiceName): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                ...getExportedDirectoriesForFernFilepath({
                    fernFilepath: serviceName.fernFilepath,
                }),
                {
                    nameOnDisk: "client",
                    exportDeclaration: { exportAll: true },
                },
            ],
            file: {
                nameOnDisk: this.getFilename(),
            },
        };
    }

    public getFilename(): string {
        return `${this.getExportedName()}.ts`;
    }

    public getExportedName(): string {
        return "Client";
    }
}
