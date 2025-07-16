import { Reference } from '@fern-typescript/commons'

export interface JsonContext {
    getReferenceToToJson: () => Reference
    getReferenceToFromJson: () => Reference
}
