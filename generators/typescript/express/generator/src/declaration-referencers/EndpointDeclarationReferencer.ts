import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { AbstractExpressServiceDeclarationReferencer } from "./AbstractExpressServiceDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export declare namespace EndpointDeclarationReferencer {
    export interface Name {
        packageId: PackageId;
        endpoint: HttpEndpoint;
    }
}
export class EndpointDeclarationReferencer extends AbstractExpressServiceDeclarationReferencer<EndpointDeclarationReferencer.Name> {
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
        return endpoint.name.camelCase.unsafeName;
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
