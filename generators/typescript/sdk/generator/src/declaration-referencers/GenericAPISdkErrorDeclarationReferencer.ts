import { AbstractSdkErrorDeclarationReferencer } from "./AbstractSdkErrorDeclarationReferencer";

export class GenericAPISdkErrorDeclarationReferencer extends AbstractSdkErrorDeclarationReferencer {
    public getExportedName(): string {
        return `${this.namespaceExport}Error`;
    }
}
