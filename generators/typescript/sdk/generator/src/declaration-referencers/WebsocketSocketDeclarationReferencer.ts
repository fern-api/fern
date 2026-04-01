import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer.js";
import { DeclarationReferencer } from "./DeclarationReferencer.js";

export declare namespace WebsocketSocketDeclarationReferencer {
    export type Init = AbstractSdkClientClassDeclarationReferencer.Init;
}

export class WebsocketSocketDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<FernIr.SubpackageId> {
    public getExportedFilepath(subpackageId: FernIr.SubpackageId): ExportedFilePath {
        return {
            directories: this.getExportedDirectory(subpackageId),
            file: {
                nameOnDisk: this.getFilename()
            }
        };
    }

    public getFilename(): string {
        return "Socket.ts";
    }

    public getExportedName(subpackageId: FernIr.SubpackageId): string {
        const subpackage = this.packageResolver.resolveSubpackage(subpackageId);
        if (this.caseConverter.pascalSafe(subpackage.name) !== this.namespaceExport) {
            return `${this.caseConverter.pascalSafe(subpackage.name)}Socket`;
        } else {
            return `${this.caseConverter.pascalUnsafe(subpackage.name)}Socket`;
        }
    }

    public getReferenceToWebsocketSocket(
        args: DeclarationReferencer.getReferenceTo.Options<FernIr.SubpackageId>
    ): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    protected getPackageIdFromName(subpackageId: FernIr.SubpackageId): PackageId {
        return { isRoot: false, subpackageId };
    }
}
