import { AbstractExpressErrorDeclarationReferencer } from "./AbstractExpressErrorDeclarationReferencer";

export class GenericAPIExpressErrorDeclarationReferencer extends AbstractExpressErrorDeclarationReferencer {
    public getExportedName(): string {
        return `${this.namespaceExport}Error`;
    }
}
