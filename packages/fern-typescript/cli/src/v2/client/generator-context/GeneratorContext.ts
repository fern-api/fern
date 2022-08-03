import { Logger } from "../logger/Logger";

export interface GeneratorContext {
    logger: Logger;
    fail: () => void;
}

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
