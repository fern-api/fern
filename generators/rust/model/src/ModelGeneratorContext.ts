import { AbstractRustGeneratorContext, AsIsFileDefinition } from "@fern-api/rust-base";

import { ModelCustomConfigSchema } from "./ModelCustomConfig.js";

export class ModelGeneratorContext extends AbstractRustGeneratorContext<ModelCustomConfigSchema> {
    /**
     * Set of type IDs used as server message body types in WebSocket channels.
     * For these types, the `type` property (wireValue === "type") must be skipped
     * during struct generation because the parent enum uses `#[serde(tag = "type")]`
     * which consumes the `type` field for discriminant dispatch.
     */
    public websocketServerMessageTypeIds: Set<string> = new Set();

    /**
     * Set of type IDs that are referenced as members of undiscriminated unions.
     * Single-property structs in this set need #[serde(transparent)] so they
     * serialize/deserialize as the inner value for untagged enum matching.
     */
    public undiscriminatedUnionMemberTypeIds: Set<string> = new Set();

    /**
     * Set of type IDs that are inlined into discriminated union variants.
     * These types are only referenced by a single union variant's samePropertiesAsObject
     * and nowhere else in the IR, so their fields are inlined directly into the variant
     * instead of generating a separate struct with #[serde(flatten)].
     */
    public inlinedUnionVariantTypeIds: Set<string> = new Set();

    public getCoreAsIsFiles(): AsIsFileDefinition[] {
        // Model generator doesn't need the client templates, return empty array
        return [];
    }
}
