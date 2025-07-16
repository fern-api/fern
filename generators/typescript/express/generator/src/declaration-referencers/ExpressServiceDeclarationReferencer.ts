import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { AbstractExpressServiceDeclarationReferencer } from "./AbstractExpressServiceDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

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
        return `${subpackage.name.pascalCase.unsafeName}Service`;
    }

    public getReferenceToService(args: DeclarationReferencer.getReferenceTo.Options<PackageId>): Reference {
        return this.getReferenceTo(this.getExportedNameOfService(args.name), args);
    }

    protected getPackageIdFromName(packageId: PackageId): PackageId {
        return packageId;
    }
}
