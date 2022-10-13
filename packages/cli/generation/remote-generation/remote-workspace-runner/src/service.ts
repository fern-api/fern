import { FernFiddle } from "@fern-fern/fiddle-client";

export const FIDDLE_ORIGIN =
    process.env.FERN_FIDDLE_ORIGIN ??
    process.env.DEFAULT_FIDDLE_ORIGIN ??
    "https://fiddle-coordinator.buildwithfern.com";

export const REMOTE_GENERATION_SERVICE = new FernFiddle.Client({
    _origin: FIDDLE_ORIGIN,
});
