import { GeneratedExpressRegister } from "./GeneratedExpressRegister";

export interface ExpressRegisterContextMixin {
    getGeneratedExpressRegister: () => GeneratedExpressRegister;
}

export interface WithExpressRegisterContextMixin {
    expressRegister: ExpressRegisterContextMixin;
}
