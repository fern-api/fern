import { AbstractSdkErrorDeclarationReferencer } from "./AbstractSdkErrorDeclarationReferencer.js";

export class GenericAPISdkErrorDeclarationReferencer extends AbstractSdkErrorDeclarationReferencer {
    public getExportedName(): string {
        return `${this.namespaceExport}Error`;
    }
}
