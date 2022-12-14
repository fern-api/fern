import { entries } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { ExportedDirectory } from "../exports-manager/ExportedFilePath";
import { ExportDeclaration } from "../exports-manager/ExportsManager";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { getExportedDirectoriesForFernFilepath } from "./utils/getExportedDirectoriesForFernFilepath";

const CLIENT_DIRECTORY = "client";

export abstract class AbstractServiceDeclarationReferencer<Name> extends AbstractDeclarationReferencer<Name> {
    protected static EXPORTED_CLIENT_DIRECTORY: ExportedDirectory = {
        nameOnDisk: CLIENT_DIRECTORY,
        exportDeclaration: { exportAll: true },
    };

    protected getExportedDirectory(
        serviceName: DeclaredServiceName,
        { subExports }: { subExports?: Record<RelativeFilePath, ExportDeclaration> } = {}
    ): ExportedDirectory[] {
        return [
            ...this.containingDirectory,
            ...getExportedDirectoriesForFernFilepath({
                fernFilepath: serviceName.fernFilepathV2,
                subExports:
                    subExports != null
                        ? entries(subExports).reduce(
                              (acc, [pathToSubExport, exportDeclaration]) => ({
                                  ...acc,
                                  [join(RelativeFilePath.of(CLIENT_DIRECTORY), pathToSubExport)]: exportDeclaration,
                              }),
                              {}
                          )
                        : undefined,
            }),
            AbstractServiceDeclarationReferencer.EXPORTED_CLIENT_DIRECTORY,
        ];
    }
}
