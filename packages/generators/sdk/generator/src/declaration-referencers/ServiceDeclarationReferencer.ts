import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractServiceDeclarationReferencer } from "./AbstractServiceDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export class ServiceDeclarationReferencer extends AbstractServiceDeclarationReferencer<DeclaredServiceName> {
    public getExportedFilepath(serviceName: DeclaredServiceName): ExportedFilePath {
        return {
            directories: this.getExportedDirectory(serviceName),
            file: {
                nameOnDisk: this.getFilename(),
            },
        };
    }

    public getFilename(): string {
        return `${this.getExportedName()}.ts`;
    }

    public getExportedName(): string {
        return "Client";
    }

    public getReferenceToClient(args: DeclarationReferencer.getReferenceTo.Options<DeclaredServiceName>): Reference {
        return this.getReferenceTo(this.getExportedName(), args);
    }
}
