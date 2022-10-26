import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export declare namespace RootServiceDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {
        apiName: string;
    }
}

export class RootServiceDeclarationReferencer extends AbstractDeclarationReferencer<DeclaredServiceName> {
    private apiName: string;

    constructor({ apiName, ...superInit }: RootServiceDeclarationReferencer.Init) {
        super(superInit);
        this.apiName = apiName;
    }

    public getExportedFilepath(): ExportedFilePath {
        return {
            directories: this.containingDirectory,
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: {
                    namedExports: [this.getExportedName()],
                },
            },
        };
    }

    public getFilename(): string {
        return "Client.ts";
    }

    public getExportedName(): string {
        return `${this.apiName}Client`;
    }

    public getReferenceToClient(args: DeclarationReferencer.getReferenceTo.Options<DeclaredServiceName>): Reference {
        return this.getReferenceTo(this.getExportedName(), args);
    }
}
