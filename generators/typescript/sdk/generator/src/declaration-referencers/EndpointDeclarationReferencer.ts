import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer.js";
import { DeclarationReferencer } from "./DeclarationReferencer.js";

export declare namespace EndpointDeclarationReferencer {
    export interface Name {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
    }

    export type Init = AbstractSdkClientClassDeclarationReferencer.Init;
}
export class EndpointDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<EndpointDeclarationReferencer.Name> {
    public getExportedFilepath(name: EndpointDeclarationReferencer.Name): ExportedFilePath {
        return {
            directories: this.getExportedDirectory(name),
            file: {
                nameOnDisk: this.getFilename(name),
                exportDeclaration: {
                    namespaceExport: this.getNamespaceExport(name)
                }
            }
        };
    }

    public getFilename(name: EndpointDeclarationReferencer.Name): string {
        return `${this.getNamespaceExport(name)}.ts`;
    }

    private getNamespaceExport({ endpoint }: EndpointDeclarationReferencer.Name): string {
        return this.caseConverter.camelUnsafe(endpoint.name);
    }

    public getReferenceToEndpointExport(
        args: DeclarationReferencer.getReferenceTo.Options<EndpointDeclarationReferencer.Name>
    ): Reference {
        return this.getReferenceTo(this.getNamespaceExport(args.name), args);
    }

    protected override getExportedFilepathForReference(name: EndpointDeclarationReferencer.Name): ExportedFilePath {
        return {
            directories: this.getExportedDirectory(name),
            file: undefined
        };
    }

    protected getPackageIdFromName(name: EndpointDeclarationReferencer.Name): PackageId {
        return name.packageId;
    }
}
