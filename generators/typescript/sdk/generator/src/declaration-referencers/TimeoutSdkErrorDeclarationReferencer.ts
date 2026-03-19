import { AbstractSdkErrorDeclarationReferencer } from "./AbstractSdkErrorDeclarationReferencer.js";

export class TimeoutSdkErrorDeclarationReferencer extends AbstractSdkErrorDeclarationReferencer {
    public getExportedName(): string {
        return this.namingOverride ?? `${this.namespaceExport}TimeoutError`;
    }
}
