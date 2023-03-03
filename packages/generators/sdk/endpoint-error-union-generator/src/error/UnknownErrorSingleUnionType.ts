import { EndpointErrorUnionContext } from "@fern-typescript/contexts";
import { AbstractParsedSingleUnionType, AbstractUnknownSingleUnionType } from "@fern-typescript/union-generator";

export class UnknownErrorSingleUnionType extends AbstractUnknownSingleUnionType<EndpointErrorUnionContext> {
    constructor(
        superInit: Omit<AbstractParsedSingleUnionType.Init<EndpointErrorUnionContext>, "includeUtilsOnUnionMembers">
    ) {
        super({
            ...superInit,
            includeUtilsOnUnionMembers: true,
        });
    }

    public getDocs(): string | null | undefined {
        return undefined;
    }
}
