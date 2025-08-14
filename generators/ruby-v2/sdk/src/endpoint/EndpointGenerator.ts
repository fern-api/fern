import { HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";

import { ruby } from "@fern-api/ruby-ast";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { HttpEndpointGenerator } from "./http/HttpEndpointGenerator";
import { RawClient } from "./http/RawClient";

export class EndpointGenerator {
    private http: HttpEndpointGenerator;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.http = new HttpEndpointGenerator({ context });
    }

    public generate({
        serviceId,
        endpoint,
        rawClientReference,
        rawClient
    }: {
        serviceId: ServiceId;
        endpoint: HttpEndpoint;
        rawClientReference: string;
        rawClient: RawClient;
    }): ruby.Method[] {
        return this.http.generate({
            endpoint,
            serviceId
        });
    }
}
