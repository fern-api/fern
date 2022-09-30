import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { ExportedDirectory } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { getExportedDirectoriesForFernFilepath } from "./utils/getExportedDirectoriesForFernFilepath";

export abstract class AbstractServiceDeclarationReferencer<Name> extends AbstractDeclarationReferencer<Name> {
    protected getExportedDirectory(serviceName: DeclaredServiceName): ExportedDirectory[] {
        return [
            ...this.containingDirectory,
            ...getExportedDirectoriesForFernFilepath({
                fernFilepath: serviceName.fernFilepath,
            }),
            {
                nameOnDisk: "client",
                exportDeclaration: { exportAll: true },
            },
        ];
    }
}
