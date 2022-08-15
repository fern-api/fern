import { RemoteGenerationService } from "@fern-fern/fiddle-coordinator-api-client/services/remoteGen";
import urlJoin from "url-join";

const FIDDLE_ORIGIN =
    process.env.FERN_FIDDLE_ORIGIN ??
    process.env.DEFAULT_FIDDLE_ORIGIN ??
    "https://fiddle-coordinator.buildwithfern.com";
export const FIDDLE_API_URL = urlJoin(FIDDLE_ORIGIN, "/api");

export const REMOTE_GENERATION_SERVICE = new RemoteGenerationService({
    origin: FIDDLE_API_URL,
});
