import { ModelContext } from "@fern-typescript/contexts";
import { AbstractUnknownSingleUnionType } from "@fern-typescript/union-generator";

export class UnknownSingleUnionType extends AbstractUnknownSingleUnionType<ModelContext> {
    public getDocs(): string | null | undefined {
        return undefined;
    }
}
