import { NameAndWireValue, dynamic } from "@fern-api/dynamic-ir-sdk/api";

/**
 * A discriminated union type instance that can be converted into a language-specific AST node.
 */
export interface DiscriminatedUnionTypeInstance {
    discriminantValue: NameAndWireValue;
    singleDiscriminatedUnionType: dynamic.SingleDiscriminatedUnionType;
    value: unknown;
}
