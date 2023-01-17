import { AbstractErrorDeclarationReferencer } from "./AbstractErrorDeclarationReferencer";

export class TimeoutErrorDeclarationReferencer extends AbstractErrorDeclarationReferencer {
    public getExportedName(): string {
        return `${this.apiName}TimeoutError`;
    }
}
