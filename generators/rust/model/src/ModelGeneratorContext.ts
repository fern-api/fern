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

    public getCoreAsIsFiles(): AsIsFileDefinition[] {
        // Model generator doesn't need the client templates, return empty array
        return [];
    }
}
