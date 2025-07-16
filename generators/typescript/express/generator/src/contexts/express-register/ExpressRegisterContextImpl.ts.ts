import { ExpressRegisterContext, GeneratedExpressRegister } from '@fern-typescript/contexts'
import { ExpressRegisterGenerator } from '@fern-typescript/express-register-generator'

export declare namespace ExpressRegisterContextImpl {
    export interface Init {
        expressRegisterGenerator: ExpressRegisterGenerator
    }
}

export class ExpressRegisterContextImpl implements ExpressRegisterContext {
    private expressRegisterGenerator: ExpressRegisterGenerator

    constructor({ expressRegisterGenerator }: ExpressRegisterContextImpl.Init) {
        this.expressRegisterGenerator = expressRegisterGenerator
    }

    public getGeneratedExpressRegister(): GeneratedExpressRegister | undefined {
        return this.expressRegisterGenerator.generateRegisterFunction()
    }
}
