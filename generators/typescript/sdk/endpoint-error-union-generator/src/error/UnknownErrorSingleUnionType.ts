import { SdkContext } from "@fern-typescript/contexts";
import { AbstractUnknownSingleUnionType } from "@fern-typescript/union-generator";

export class UnknownErrorSingleUnionType extends AbstractUnknownSingleUnionType<SdkContext> {
    public needsRequestResponse(): { request: boolean; response: boolean } {
        return {
            request: false,
            response: false
        };
    }
    public getDocs(): string | null | undefined {
        return undefined;
    }
}
