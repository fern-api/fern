import { SdkContext } from "@fern-typescript/contexts";

export declare namespace BaseClientTypeGenerator {
    export interface Init {
        generateIdempotentRequestOptions: boolean;
    }
}

export class BaseClientTypeGenerator {
    private readonly generateIdempotentRequestOptions: boolean;

    constructor({ generateIdempotentRequestOptions }: BaseClientTypeGenerator.Init) {
        this.generateIdempotentRequestOptions = generateIdempotentRequestOptions;
    }

    public writeToFile(context: SdkContext): void {
        context.sourceFile.addInterface(context.baseClient.generateBaseClientOptionsInterface(context));
        context.sourceFile.addInterface(context.baseClient.generateBaseRequestOptionsInterface(context));
        if (this.generateIdempotentRequestOptions) {
            context.sourceFile.addInterface(context.baseClient.generateBaseIdempotentRequestOptionsInterface(context));
        }
    }
}
