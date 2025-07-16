import {
    ExportDeclaration,
    ExportedDirectory,
    PackageId,
    getExportedDirectoriesForFernFilepath
} from "@fern-typescript/commons";
import { PackageResolver } from "@fern-typescript/resolvers";

import { entries } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { FernFilepath } from "@fern-fern/ir-sdk/api";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

const CLIENT_DIRECTORY = "client";

export declare namespace AbstractSdkClientClassDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {
        packageResolver: PackageResolver;
    }
}

export abstract class AbstractSdkClientClassDeclarationReferencer<Name> extends AbstractDeclarationReferencer<Name> {
    protected packageResolver: PackageResolver;

    constructor({ packageResolver, ...superInit }: AbstractSdkClientClassDeclarationReferencer.Init) {
        super(superInit);
        this.packageResolver = packageResolver;
    }

    protected getExportedDirectory(
        name: Name,
        { subExports }: { subExports?: Record<RelativeFilePath, ExportDeclaration> } = {}
    ): ExportedDirectory[] {
        return [
            ...this.containingDirectory,
            ...getExportedDirectoriesForFernFilepath({
                fernFilepath: this.getFernFilepathFromName(name),
                subExports:
                    subExports != null
                        ? entries(subExports).reduce(
                              (acc, [pathToSubExport, exportDeclaration]) => ({
                                  ...acc,
                                  [join(RelativeFilePath.of(CLIENT_DIRECTORY), pathToSubExport)]: exportDeclaration
                              }),
                              {}
                          )
                        : undefined
            }),
            {
                nameOnDisk: CLIENT_DIRECTORY,
                exportDeclaration: { exportAll: true }
            }
        ];
    }

    private getFernFilepathFromName(name: Name): FernFilepath {
        return this.packageResolver.resolvePackage(this.getPackageIdFromName(name)).fernFilepath;
    }

    protected abstract getPackageIdFromName(name: Name): PackageId;
}
