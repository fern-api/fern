import { FernFilepath } from "@fern-fern/ir-model/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/http";
import { ExportedFilePath, Reference } from "@fern-typescript/commons";
import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export declare namespace EndpointErrorUnionDeclarationReferencer {
    export interface Name {
        service: FernFilepath;
        endpoint: HttpEndpoint;
    }
}
export class EndpointErrorUnionDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<EndpointErrorUnionDeclarationReferencer.Name> {
    public getExportedFilepath(name: EndpointErrorUnionDeclarationReferencer.Name): ExportedFilePath {
        return {
            directories: this.getExportedDirectory(name.service),
            file: {
                nameOnDisk: this.getFilename(name),
                exportDeclaration: {
                    namespaceExport: this.getNamespaceExport(name),
                },
            },
        };
    }

    public getFilename(name: EndpointErrorUnionDeclarationReferencer.Name): string {
        return `${this.getNamespaceExport(name)}.ts`;
    }

    private getNamespaceExport({ endpoint }: EndpointErrorUnionDeclarationReferencer.Name): string {
        return endpoint.name.camelCase.unsafeName;
    }

    public getReferenceToEndpointExport(
        args: DeclarationReferencer.getReferenceTo.Options<EndpointErrorUnionDeclarationReferencer.Name>
    ): Reference {
        return this.getReferenceTo(this.getNamespaceExport(args.name), args);
    }

    protected override getExportedFilepathForReference(
        name: EndpointErrorUnionDeclarationReferencer.Name
    ): ExportedFilePath {
        return {
            directories: this.getExportedDirectory(name.service),
            file: undefined,
        };
    }
}
