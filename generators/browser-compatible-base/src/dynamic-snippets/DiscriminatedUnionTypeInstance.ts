import { FernIr } from "@fern-api/dynamic-ir-sdk"

/**
 * A discriminated union type instance that can be converted into a language-specific AST node.
 */
export interface DiscriminatedUnionTypeInstance {
    discriminantValue: FernIr.NameAndWireValue
    singleDiscriminatedUnionType: FernIr.dynamic.SingleDiscriminatedUnionType
    value: unknown
}
