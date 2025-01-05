import { php } from "@fern-api/php-codegen";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

/**
 * The Guzzle HTTP client.
 */
export class GuzzleClient {
    public static NAMESPACE = "GuzzleHttp";
    public static CLIENT_CLASS_NAME = "Client";
    public static CLIENT_INTERFACE_CLASS_NAME = "ClientInterface";

    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public getClientClassReference(): php.ClassReference {
        return php.classReference({
            name: GuzzleClient.CLIENT_CLASS_NAME,
            namespace: GuzzleClient.NAMESPACE
        });
    }

    public getClientInterfaceClassReference(): php.ClassReference {
        return php.classReference({
            name: GuzzleClient.CLIENT_INTERFACE_CLASS_NAME,
            namespace: GuzzleClient.NAMESPACE
        });
    }

    public instantiate(): php.ClassInstantiation {
        return php.instantiateClass({
            classReference: this.getClientClassReference(),
            arguments_: []
        });
    }
}
