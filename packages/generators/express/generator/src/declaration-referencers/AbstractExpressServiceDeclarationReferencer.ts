import { entries } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { ExportDeclaration, ExportedDirectory, getExportedDirectoriesForFernFilepath } from "@fern-typescript/commons";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

const SERVICE_DIRECTORY = "service";

export abstract class AbstractExpressServiceDeclarationReferencer<Name> extends AbstractDeclarationReferencer<Name> {
    protected getExportedDirectory(
        service: DeclaredServiceName,
        { subExports }: { subExports?: Record<RelativeFilePath, ExportDeclaration> } = {}
    ): ExportedDirectory[] {
        return [
            ...this.containingDirectory,
            ...getExportedDirectoriesForFernFilepath({
                fernFilepath: service.fernFilepath,
                subExports:
                    subExports != null
                        ? entries(subExports).reduce(
                              (acc, [pathToSubExport, exportDeclaration]) => ({
                                  ...acc,
                                  [join(RelativeFilePath.of(SERVICE_DIRECTORY), pathToSubExport)]: exportDeclaration,
                              }),
                              {}
                          )
                        : undefined,
            }),
            {
                nameOnDisk: SERVICE_DIRECTORY,
                exportDeclaration: { exportAll: true },
            },
        ];
    }
}
