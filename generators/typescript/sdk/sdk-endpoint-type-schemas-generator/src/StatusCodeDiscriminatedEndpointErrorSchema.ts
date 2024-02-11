import { GeneratedEndpointErrorSchema } from "./GeneratedEndpointErrorSchema";

export const StatusCodeDiscriminatedEndpointErrorSchema: GeneratedEndpointErrorSchema = {
    writeToFile: () => {
        /* no-op */
    },
    getReferenceToRawShape: () => {
        throw new Error("No endpoint error schema was generated because errors are status-code discriminated.");
    },
    getReferenceToZurgSchema: () => {
        throw new Error("No endpoint error schema was generated because errors are status-code discriminated.");
    }
};
