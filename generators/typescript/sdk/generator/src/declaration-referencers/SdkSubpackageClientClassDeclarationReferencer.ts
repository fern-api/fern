import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer.js";
import { DeclarationReferencer } from "./DeclarationReferencer.js";

export declare namespace SdkSubpackageClientClassDeclarationReferencer {
    export type Init = AbstractSdkClientClassDeclarationReferencer.Init;
}

export class SdkSubpackageClientClassDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<FernIr.SubpackageId> {
    public getExportedFilepath(subpackageId: FernIr.SubpackageId): ExportedFilePath {
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

    public getExportedName(subpackageId: FernIr.SubpackageId): string {
        const subpackage = this.packageResolver.resolveSubpackage(subpackageId);
        return `${this.case.pascalUnsafe(subpackage.name)}Client`;
    }

    public getReferenceToClient(args: DeclarationReferencer.getReferenceTo.Options<FernIr.SubpackageId>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    protected getPackageIdFromName(subpackageId: FernIr.SubpackageId): PackageId {
        return { isRoot: false, subpackageId };
    }
}
