import { FernFilepath } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/contexts";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractServiceDeclarationReferencer } from "./AbstractServiceDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export class ServiceDeclarationReferencer extends AbstractServiceDeclarationReferencer<FernFilepath> {
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
        return this.isRootClient(service) ? `${this.apiName}Client` : "Client";
    }

    public getReferenceToClient(args: DeclarationReferencer.getReferenceTo.Options<FernFilepath>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    private isRootClient(service: FernFilepath): boolean {
        return service.length === 0;
    }
}
