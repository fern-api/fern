import { Logger } from "@fern-typescript/commons-v2";
import { GeneratorContext } from "@fern-typescript/declaration-handler";

export class GeneratorContextImpl implements GeneratorContext {
    private isSuccess = true;

    constructor(public readonly logger: Logger) {}

    public fail(): void {
        this.isSuccess = false;
    }

    public didSucceed(): boolean {
        return this.isSuccess;
    }
}
