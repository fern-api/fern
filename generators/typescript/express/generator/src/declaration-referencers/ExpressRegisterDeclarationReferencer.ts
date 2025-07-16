import { ExportedFilePath } from "@fern-typescript/commons";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

export class ExpressRegisterDeclarationReferencer extends AbstractDeclarationReferencer {
    public getExportedFilepath(): ExportedFilePath {
        return {
            directories: [...this.containingDirectory],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: {
                    namedExports: [this.getRegisterFunctionName()]
                }
            }
        };
    }

    public getFilename(): string {
        return `${this.getRegisterFunctionName()}.ts`;
    }

    public getRegisterFunctionName(): string {
        return "register";
    }
}
