import { AbstractErrorDeclarationReferencer } from "./AbstractErrorDeclarationReferencer";

export class GenericAPIErrorDeclarationReferencer extends AbstractErrorDeclarationReferencer {
    public getExportedName(): string {
        return `${this.apiName}Error`;
    }
}
