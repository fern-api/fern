import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { HttpEndpointTestGenerator } from "./test/HttpEndpointTestGenerator";

export class EndpointTestGenerator {
    private http: HttpEndpointTestGenerator;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.http = new HttpEndpointTestGenerator({ context });
    }

    public generate({ endpoint }: { endpoint: HttpEndpoint }): HttpEndpointTestGenerator.Test[] {
        return this.http.generate({
            endpoint
        });
    }
}
