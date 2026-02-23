import { AbstractExpressErrorDeclarationReferencer } from "./AbstractExpressErrorDeclarationReferencer.js";

export class GenericAPIExpressErrorDeclarationReferencer extends AbstractExpressErrorDeclarationReferencer {
    public getExportedName(): string {
        return `${this.namespaceExport}Error`;
    }
}
