import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { AbstractServiceDeclarationReferencer } from "./AbstractServiceDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export declare namespace RootServiceDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {
        apiName: string;
    }
}

export class ServiceDeclarationReferencer extends AbstractServiceDeclarationReferencer<DeclaredServiceName> {
    private apiName: string;

    constructor({ apiName, ...superInit }: RootServiceDeclarationReferencer.Init) {
        super(superInit);
        this.apiName = apiName;
    }

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
