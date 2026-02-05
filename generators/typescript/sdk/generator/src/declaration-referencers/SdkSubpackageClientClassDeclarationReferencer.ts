import { SubpackageId } from "@fern-fern/ir-sdk/api";
import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export class SdkSubpackageClientClassDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<SubpackageId> {
    public getExportedFilepath(subpackageId: SubpackageId): ExportedFilePath {
        return {
            directories: this.getExportedDirectory(subpackageId),
            file: {
                nameOnDisk: this.getFilename()
            }
        };
    }

    public getFilename(): string {
        return "Client.ts";
    }

    public getExportedName(subpackageId: SubpackageId): string {
        const subpackage = this.packageResolver.resolveSubpackage(subpackageId);
        return `${subpackage.name.pascalCase.unsafeName}Client`;
    }

    public getReferenceToClient(args: DeclarationReferencer.getReferenceTo.Options<SubpackageId>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    protected getPackageIdFromName(subpackageId: SubpackageId): PackageId {
        return { isRoot: false, subpackageId };
    }
}
