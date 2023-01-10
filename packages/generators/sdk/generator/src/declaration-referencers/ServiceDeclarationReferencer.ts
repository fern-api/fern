import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { Reference } from "@fern-typescript/contexts";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractServiceDeclarationReferencer } from "./AbstractServiceDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export class ServiceDeclarationReferencer extends AbstractServiceDeclarationReferencer<DeclaredServiceName> {
    public getExportedFilepath(serviceName: DeclaredServiceName): ExportedFilePath {
        if (this.isRootClient(serviceName)) {
            return {
                directories: [],
                file: {
                    nameOnDisk: this.getFilename(),
                    exportDeclaration: {
                        namedExports: [this.getExportedName(serviceName)],
                    },
                },
            };
        }

        return {
            directories: this.getExportedDirectory(serviceName),
            file: {
                nameOnDisk: this.getFilename(),
            },
        };
    }

    public getFilename(): string {
        return "Client.ts";
    }

    public getExportedName(serviceName: DeclaredServiceName): string {
        return this.isRootClient(serviceName) ? `${this.apiName}Client` : "Client";
    }

    public getReferenceToClient(args: DeclarationReferencer.getReferenceTo.Options<DeclaredServiceName>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    private isRootClient(serviceName: DeclaredServiceName): boolean {
        return serviceName.fernFilepathV2.length === 0;
    }
}
