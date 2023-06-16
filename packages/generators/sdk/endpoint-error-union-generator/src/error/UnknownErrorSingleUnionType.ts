import { SdkContext } from "@fern-typescript/contexts";
import { AbstractParsedSingleUnionType, AbstractUnknownSingleUnionType } from "@fern-typescript/union-generator";

export class UnknownErrorSingleUnionType extends AbstractUnknownSingleUnionType<SdkContext> {
    constructor(superInit: Omit<AbstractParsedSingleUnionType.Init<SdkContext>, "includeUtilsOnUnionMembers">) {
        super({
            ...superInit,
            includeUtilsOnUnionMembers: true,
        });
    }

    public getDocs(): string | null | undefined {
        return undefined;
    }
}
