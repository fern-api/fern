import { BaseContext } from '@fern-typescript/contexts'
import { AbstractUnknownSingleUnionType } from '@fern-typescript/union-generator'

export class UnknownSingleUnionType extends AbstractUnknownSingleUnionType<BaseContext> {
    public getDocs(): string | null | undefined {
        return undefined
    }
}
