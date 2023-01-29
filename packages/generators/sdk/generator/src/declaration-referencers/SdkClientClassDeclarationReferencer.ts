import { FernFilepath } from "@fern-fern/ir-model/commons";
import { ExportedFilePath, Reference } from "@fern-typescript/commons";
import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export class SdkClientClassDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<FernFilepath> {
    public getExportedFilepath(service: FernFilepath): ExportedFilePath {
        if (this.isRootClient(service)) {
            return {
                directories: [],
                file: {
                    nameOnDisk: this.getFilename(),
                    exportDeclaration: {
                        namedExports: [this.getExportedName(service)],
                    },
                },
            };
        }

        return {
            directories: this.getExportedDirectory(service),
            file: {
                nameOnDisk: this.getFilename(),
            },
        };
    }

    public getFilename(): string {
        return "Client.ts";
    }

    public getExportedName(service: FernFilepath): string {
        return this.isRootClient(service) ? `${this.namespaceExport}Client` : "Client";
    }

    public getReferenceToClient(args: DeclarationReferencer.getReferenceTo.Options<FernFilepath>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    private isRootClient(service: FernFilepath): boolean {
        return service.length === 0;
    }
}
