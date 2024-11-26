import { NameAndWireValue, dynamic as DynamicSnippets } from "@fern-fern/ir-sdk/api";

/**
 * A discriminated union type instance that can be converted into a language-specific AST node.
 */
export interface DiscriminatedUnionTypeInstance {
    discriminantValue: NameAndWireValue;
    singleDiscriminatedUnionType: DynamicSnippets.SingleDiscriminatedUnionType;
    value: unknown;
}
