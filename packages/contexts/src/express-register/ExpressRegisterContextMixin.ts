import { GeneratedExpressRegister } from "./GeneratedExpressRegister";

export interface ExpressRegisterContextMixin {
    getGeneratedExpressRegister: () => GeneratedExpressRegister | undefined;
}

export interface WithExpressRegisterContextMixin {
    expressRegister: ExpressRegisterContextMixin;
}
