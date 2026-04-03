import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";
import {
    AbstractExpressServiceDeclarationReferencer,
    AbstractSdkClientClassDeclarationReferencer
} from "./AbstractExpressServiceDeclarationReferencer.js";
import { DeclarationReferencer } from "./DeclarationReferencer.js";

export declare namespace ExpressServiceDeclarationReferencer {
    export type Init = AbstractSdkClientClassDeclarationReferencer.Init;
}

export class ExpressServiceDeclarationReferencer extends AbstractExpressServiceDeclarationReferencer<PackageId> {
    public getExportedFilepath(name: PackageId): ExportedFilePath {
        return {
            directories: [...this.getExportedDirectory(name)],
            file: {
                nameOnDisk: this.getFilename(name)
            }
        };
    }

    public getFilename(name: PackageId): string {
        return `${this.getExportedNameOfService(name)}.ts`;
    }

    public getExportedNameOfService(name: PackageId): string {
        if (name.isRoot) {
            return "RootService";
        }
        const subpackage = this.packageResolver.resolveSubpackage(name.subpackageId);
        return `${this.case.pascalUnsafe(subpackage.name)}Service`;
    }

    public getReferenceToService(args: DeclarationReferencer.getReferenceTo.Options<PackageId>): Reference {
        return this.getReferenceTo(this.getExportedNameOfService(args.name), args);
    }

    protected getPackageIdFromName(packageId: PackageId): PackageId {
        return packageId;
    }
}
