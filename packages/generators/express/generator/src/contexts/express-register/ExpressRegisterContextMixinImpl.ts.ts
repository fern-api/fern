import { ExpressRegisterContextMixin, GeneratedExpressRegister } from "@fern-typescript/contexts";
import { ExpressRegisterGenerator } from "@fern-typescript/express-register-generator";

export declare namespace ExpressRegisterContextMixinImpl {
    export interface Init {
        expressRegisterGenerator: ExpressRegisterGenerator;
    }
}

export class ExpressRegisterContextMixinImpl implements ExpressRegisterContextMixin {
    private expressRegisterGenerator: ExpressRegisterGenerator;

    constructor({ expressRegisterGenerator }: ExpressRegisterContextMixinImpl.Init) {
        this.expressRegisterGenerator = expressRegisterGenerator;
    }

    public getGeneratedExpressRegister(): GeneratedExpressRegister | undefined {
        return this.expressRegisterGenerator.generateRegisterFunction();
    }
}
