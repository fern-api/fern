import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { HttpEndpointGenerator } from "./http/HttpEndpointGenerator.js";
import { RawClient } from "./http/RawClient.js";

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
        serviceId: FernIr.ServiceId;
        endpoint: FernIr.HttpEndpoint;
        rawClientReference: string;
        rawClient: RawClient;
    }): ruby.Method[] {
        return this.http.generate({
            endpoint,
            serviceId
        });
    }
}
