import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { php } from "@fern-api/php-codegen";

/**
 * The Guzzle HTTP client.
 */
export class GuzzleClient {
    public static NAMESPACE = "GuzzleHttp";
    public static CLASS_NAME = "Client";

    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public getClassReference(): php.ClassReference {
        return php.classReference({
            name: GuzzleClient.CLASS_NAME,
            namespace: GuzzleClient.NAMESPACE
        });
    }

    public instantiate(): php.ClassInstantiation {
        return php.instantiateClass({
            classReference: this.getClassReference(),
            arguments_: []
        });
    }
}
