import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { ExportedFilePath, Reference } from "@fern-typescript/commons";
import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export class SdkClientClassDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<DeclaredServiceName> {
    public getExportedFilepath(service: DeclaredServiceName): ExportedFilePath {
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

    public getExportedName(service: DeclaredServiceName): string {
        const lastFernFilepathPart = service.fernFilepath.allParts[service.fernFilepath.allParts.length - 1];
        if (lastFernFilepathPart == null) {
            return `${this.namespaceExport}Client`;
        } else if (lastFernFilepathPart.pascalCase.unsafeName !== this.namespaceExport) {
            return lastFernFilepathPart.pascalCase.unsafeName;
        } else {
            return `${lastFernFilepathPart.pascalCase.unsafeName}Service`;
        }
    }

    public getReferenceToClient(args: DeclarationReferencer.getReferenceTo.Options<DeclaredServiceName>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    private isRootClient(service: DeclaredServiceName): boolean {
        return service.fernFilepath.allParts.length === 0;
    }
}
