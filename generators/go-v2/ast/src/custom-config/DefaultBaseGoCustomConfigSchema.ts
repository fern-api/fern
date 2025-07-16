import { BaseGoCustomConfigSchema } from './BaseGoCustomConfigSchema'

export const DefaultBaseGoCustomConfigSchema: BaseGoCustomConfigSchema = {
    alwaysSendRequiredProperties: true,
    inlinePathParameters: true,
    inlineFileProperties: true,
    useReaderForBytesRequest: true,
    union: 'v1'
}
