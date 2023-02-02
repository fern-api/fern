import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { ExportedFilePath, Reference } from "@fern-typescript/commons";
import { AbstractExpressServiceDeclarationReferencer } from "./AbstractExpressServiceDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export class ExpressServiceDeclarationReferencer extends AbstractExpressServiceDeclarationReferencer<DeclaredServiceName> {
    public getExportedFilepath(name: DeclaredServiceName): ExportedFilePath {
        return {
            directories: [...this.getExportedDirectory(name)],
            file: {
                nameOnDisk: this.getFilename(name),
            },
        };
    }

    public getFilename(name: DeclaredServiceName): string {
        return `${this.getExportedNameOfService(name)}.ts`;
    }

    public getExportedNameOfService(name: DeclaredServiceName): string {
        const lastFernFilepathPart = name.fernFilepath.allParts[name.fernFilepath.allParts.length - 1];
        return `${lastFernFilepathPart != null ? lastFernFilepathPart.pascalCase.unsafeName : "Root"}Service`;
    }

    public getReferenceToService(args: DeclarationReferencer.getReferenceTo.Options<DeclaredServiceName>): Reference {
        return this.getReferenceTo(this.getExportedNameOfService(args.name), args);
    }
}
