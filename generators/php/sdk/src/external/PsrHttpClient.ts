import { php } from "@fern-api/php-codegen";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * PSR-18 HTTP client interface reference.
 */
export class PsrHttpClient {
    public static readonly NAMESPACE = "Psr\\Http\\Client";
    public static readonly CLIENT_INTERFACE_CLASS_NAME = "ClientInterface";

    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public getClientInterfaceClassReference(): php.ClassReference {
        return php.classReference({
            name: PsrHttpClient.CLIENT_INTERFACE_CLASS_NAME,
            namespace: PsrHttpClient.NAMESPACE
        });
    }
}
