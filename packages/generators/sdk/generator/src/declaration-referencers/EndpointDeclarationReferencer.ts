import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { AbstractServiceDeclarationReferencer } from "./AbstractServiceDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";
import { ServiceDeclarationReferencer } from "./ServiceDeclarationReferencer";

export declare namespace EndpointDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {
        serviceDeclarationReferencer: ServiceDeclarationReferencer;
    }

    export interface Name {
        serviceName: DeclaredServiceName;
        endpoint: HttpEndpoint;
    }
}
export class EndpointDeclarationReferencer extends AbstractServiceDeclarationReferencer<EndpointDeclarationReferencer.Name> {
    public getExportedFilepath(name: EndpointDeclarationReferencer.Name): ExportedFilePath {
        return {
            directories: this.getExportedDirectory(name.serviceName),
            file: {
                nameOnDisk: this.getFilename(name),
                exportDeclaration: {
                    namespaceExport: this.getNamespaceExport(name),
                },
            },
        };
    }

    public getFilename(name: EndpointDeclarationReferencer.Name): string {
        return `${this.getNamespaceExport(name)}.ts`;
    }

    private getNamespaceExport({ endpoint }: EndpointDeclarationReferencer.Name) {
        return endpoint.name.camelCase;
    }

    public getReferenceToEndpointExport(
        args: DeclarationReferencer.getReferenceTo.Options<EndpointDeclarationReferencer.Name>
    ): Reference {
        return this.getReferenceTo(this.getNamespaceExport(args.name), args);
    }

    protected override getExportedFilepathForReferences(name: EndpointDeclarationReferencer.Name): ExportedFilePath {
        return {
            directories: this.getExportedDirectory(name.serviceName),
            file: undefined,
        };
    }
}
