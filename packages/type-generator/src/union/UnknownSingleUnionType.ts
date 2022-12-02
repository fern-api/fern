import { TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { AbstractUnknownSingleUnionType } from "@fern-typescript/union-generator";

export class UnknownSingleUnionType extends AbstractUnknownSingleUnionType<TypeContext> {
    public getDocs(): string | null | undefined {
        return undefined;
    }
}
