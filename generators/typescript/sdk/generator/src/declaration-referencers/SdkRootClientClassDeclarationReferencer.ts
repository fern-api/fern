import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer.js";
import { DeclarationReferencer } from "./DeclarationReferencer.js";

export class SdkRootClientClassDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<never> {
    public getExportedFilepath(): ExportedFilePath {
        const exportedName = this.getExportedName();
        // When the root client class name collides with the package namespace export
        // (e.g. `naming.client` equals `namespaceExport`), re-exporting the client from
        // the root index would produce a duplicate identifier alongside
        // `export * as <namespaceExport> from "./api/index.js"`. In that case, omit the
        // root re-export; the client remains importable directly from "./Client.js".
        const collidesWithNamespaceExport = exportedName === this.namespaceExport;
        return {
            directories: [],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: collidesWithNamespaceExport
                    ? undefined
                    : {
                          namedExports: [exportedName]
                      }
            }
        };
    }

    public getFilename(): string {
        return "Client.ts";
    }

    public getExportedName(): string {
        return this.namingOverride ?? `${this.namespaceExport}Client`;
    }

    public getReferenceToClient(args: DeclarationReferencer.getReferenceTo.Options): Reference {
        return this.getReferenceTo(this.getExportedName(), args);
    }

    protected getPackageIdFromName(): PackageId {
        return { isRoot: true };
    }
}
