import { ts } from 'ts-morph'

import { GeneratedFile } from '../../commons/GeneratedFile'
import { SdkContext } from '../SdkContext'

export interface GeneratedWebsocketTypeSchema extends GeneratedFile<SdkContext> {
    deserializeResponse: (referenceToRawResponse: ts.Expression, context: SdkContext) => ts.Expression
}
