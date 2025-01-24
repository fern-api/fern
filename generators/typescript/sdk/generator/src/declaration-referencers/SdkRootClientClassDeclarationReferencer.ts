import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export class SdkRootClientClassDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<never> {
    public getExportedFilepath(): ExportedFilePath {
        return {
            directories: [],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: {
                    namedExports: [this.getExportedName()]
                }
            }
        };
    }

    public getFilename(): string {
        return "Client.ts";
    }

    public getExportedName(): string {
        return `${this.namespaceExport}Client`;
    }

    public getReferenceToClient(args: DeclarationReferencer.getReferenceTo.Options): Reference {
        return this.getReferenceTo(this.getExportedName(), args);
    }

    protected getPackageIdFromName(): PackageId {
        return { isRoot: true };
    }
}
