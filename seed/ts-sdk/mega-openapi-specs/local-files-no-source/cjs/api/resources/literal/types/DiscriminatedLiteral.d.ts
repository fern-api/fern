import type * as SeedApi from "../../../index.js";
export type DiscriminatedLiteral = SeedApi.literal.DiscriminatedLiteral.CustomName | SeedApi.literal.DiscriminatedLiteral.DefaultName | SeedApi.literal.DiscriminatedLiteral.George | SeedApi.literal.DiscriminatedLiteral.LiteralGeorge;
export declare namespace DiscriminatedLiteral {
    interface CustomName {
        type: "customName";
        value?: string | undefined;
    }
    interface DefaultName {
        type: "defaultName";
        value?: DiscriminatedLiteralDefaultName.Value | undefined;
    }
    namespace DiscriminatedLiteralDefaultName {
        const Value: {
            readonly Bob: "Bob";
        };
        type Value = (typeof Value)[keyof typeof Value];
    }
    interface George {
        type: "george";
        value?: boolean | undefined;
    }
    interface LiteralGeorge {
        type: "literalGeorge";
        value?: boolean | undefined;
    }
}
