import { rust } from "@fern-api/rust-codegen";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

/**
 * The Guzzle HTTP client.
 */
export class GuzzleClient {
    public static readonly NAMESPACE = "GuzzleHttp";
    public static readonly EXCEPTION_NAMESPACE = "GuzzleHttp\\Exception";
    public static readonly CLIENT_CLASS_NAME = "Client";
    public static readonly CLIENT_INTERFACE_CLASS_NAME = "ClientInterface";
    public static readonly REQUEST_EXCEPTION_CLASS_NAME = "RequestException";

    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public getClientClassReference(): rust.StructReference {
        return rust.structReference({
            name: GuzzleClient.CLIENT_CLASS_NAME,
            namespace: GuzzleClient.NAMESPACE
        });
    }

    public getClientInterfaceClassReference(): rust.StructReference {
        return rust.structReference({
            name: GuzzleClient.CLIENT_INTERFACE_CLASS_NAME,
            namespace: GuzzleClient.NAMESPACE
        });
    }

    public getRequestExceptionClassReference(): rust.StructReference {
        return rust.structReference({
            name: GuzzleClient.REQUEST_EXCEPTION_CLASS_NAME,
            namespace: GuzzleClient.EXCEPTION_NAMESPACE
        });
    }

    public instantiate(): rust.StructInstantiation {
        return rust.instantiateStruct({
            structReference: this.getClientClassReference(),
            arguments_: []
        });
    }
}
