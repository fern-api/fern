import { ExportedFilePath } from "@fern-typescript/commons";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer.js";

export class WebhooksHelperDeclarationReferencer extends AbstractDeclarationReferencer {
    private readonly helperName: string;

    constructor(init: AbstractDeclarationReferencer.Init & { helperName?: string }) {
        super(init);
        this.helperName = init.helperName ?? "WebhooksHelper";
    }

    public getExportedFilepath(): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                {
                    nameOnDisk: "webhooks",
                    exportDeclaration: { namespaceExport: "webhooks" }
                }
            ],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: {
                    namedExports: [this.getExportedName()]
                }
            }
        };
    }

    public getFilename(): string {
        return `${this.helperName}.ts`;
    }

    public getExportedName(): string {
        return this.helperName;
    }
}
