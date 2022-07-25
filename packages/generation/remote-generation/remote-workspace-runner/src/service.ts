import { RemoteGenerationService } from "@fern-fern/fiddle-coordinator-api-client/services";

export const REMOTE_GENERATION_SERVICE = new RemoteGenerationService({
    origin: "https://fiddle-coordinator-dev.buildwithfern.com/api",
});
