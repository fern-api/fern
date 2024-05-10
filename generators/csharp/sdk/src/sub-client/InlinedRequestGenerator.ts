import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

export declare namespace InlinedRequestGenerator {
    export interface Args {
        /** the reference to the client */
        clientReference: string;
        /** the endpoint for the endpoint */
        endpoint: HttpEndpoint;
        /** reference to a variable that is the body */
        bodyReference?: string;
    }
}
