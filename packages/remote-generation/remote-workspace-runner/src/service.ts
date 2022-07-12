import { services } from "@fern-fern/fiddle-coordinator-api-client";

export const REMOTE_GENERATION_SERVICE = new services.remoteGen.RemoteGenerationService({
    origin: "https://fiddle-coordinator-dev.buildwithfern.com/api",
});
