import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";
import { SdkRootClientClassDeclarationReferencer } from "./SdkRootClientClassDeclarationReferencer";
import { SdkSubpackageClientClassDeclarationReferencer } from "./SdkSubpackageClientClassDeclarationReferencer";

export class SdkClientClassDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<PackageId> {
    private rootClientClassDeclarationReferencer: SdkRootClientClassDeclarationReferencer;
    private subpackageClientClassDeclarationReferencer: SdkSubpackageClientClassDeclarationReferencer;

    constructor(superInit: AbstractSdkClientClassDeclarationReferencer.Init) {
        super(superInit);
        this.rootClientClassDeclarationReferencer = new SdkRootClientClassDeclarationReferencer(superInit);
        this.subpackageClientClassDeclarationReferencer = new SdkSubpackageClientClassDeclarationReferencer(superInit);
    }

    public getExportedFilepath(packageId: PackageId): ExportedFilePath {
        if (packageId.isRoot) {
            return this.rootClientClassDeclarationReferencer.getExportedFilepath();
        } else {
            return this.subpackageClientClassDeclarationReferencer.getExportedFilepath(packageId.subpackageId);
        }
    }

    public getFilename(packageId: PackageId): string {
        if (packageId.isRoot) {
            return this.rootClientClassDeclarationReferencer.getFilename();
        } else {
            return this.subpackageClientClassDeclarationReferencer.getFilename();
        }
    }

    public getExportedName(packageId: PackageId): string {
        if (packageId.isRoot) {
            return this.rootClientClassDeclarationReferencer.getExportedName();
        } else {
            return this.subpackageClientClassDeclarationReferencer.getExportedName(packageId.subpackageId);
        }
    }

    public getReferenceToClient(args: DeclarationReferencer.getReferenceTo.Options<PackageId>): Reference {
        if (args.name.isRoot) {
            return this.rootClientClassDeclarationReferencer.getReferenceToClient({
                ...args,
                name: undefined as never
            });
        } else {
            return this.subpackageClientClassDeclarationReferencer.getReferenceToClient({
                ...args,
                name: args.name.subpackageId
            });
        }
    }

    protected getPackageIdFromName(packageId: PackageId): PackageId {
        return packageId;
    }
}
