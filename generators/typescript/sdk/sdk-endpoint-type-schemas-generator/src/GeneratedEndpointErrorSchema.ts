import { Zurg } from '@fern-typescript/commons'
import { SdkContext } from '@fern-typescript/contexts'
import { ts } from 'ts-morph'

export interface GeneratedEndpointErrorSchema {
    writeToFile(context: SdkContext): void
    getReferenceToRawShape(context: SdkContext): ts.TypeNode
    getReferenceToZurgSchema(context: SdkContext): Zurg.Schema
}
