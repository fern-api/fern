import { AbstractSdkErrorDeclarationReferencer } from "./AbstractSdkErrorDeclarationReferencer";

export class TimeoutSdkErrorDeclarationReferencer extends AbstractSdkErrorDeclarationReferencer {
    public getExportedName(): string {
        return `${this.namespaceExport}TimeoutError`;
    }
}
