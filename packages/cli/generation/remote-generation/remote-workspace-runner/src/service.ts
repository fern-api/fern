import { FernFiddleClient } from "@fern-fern/fiddle-sdk";

export const FIDDLE_ORIGIN =
    process.env.FERN_FIDDLE_ORIGIN ??
    process.env.DEFAULT_FIDDLE_ORIGIN ??
    "https://fiddle-coordinator.buildwithfern.com";

export const REMOTE_GENERATION_SERVICE = new FernFiddleClient({
    environment: FIDDLE_ORIGIN,
});
