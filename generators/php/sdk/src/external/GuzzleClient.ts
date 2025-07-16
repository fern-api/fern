import { php } from '@fern-api/php-codegen'

import { SdkGeneratorContext } from '../SdkGeneratorContext'

/**
 * The Guzzle HTTP client.
 */
export class GuzzleClient {
    public static readonly NAMESPACE = 'GuzzleHttp'
    public static readonly EXCEPTION_NAMESPACE = 'GuzzleHttp\\Exception'
    public static readonly CLIENT_CLASS_NAME = 'Client'
    public static readonly CLIENT_INTERFACE_CLASS_NAME = 'ClientInterface'
    public static readonly REQUEST_EXCEPTION_CLASS_NAME = 'RequestException'

    private context: SdkGeneratorContext

    public constructor(context: SdkGeneratorContext) {
        this.context = context
    }

    public getClientClassReference(): php.ClassReference {
        return php.classReference({
            name: GuzzleClient.CLIENT_CLASS_NAME,
            namespace: GuzzleClient.NAMESPACE
        })
    }

    public getClientInterfaceClassReference(): php.ClassReference {
        return php.classReference({
            name: GuzzleClient.CLIENT_INTERFACE_CLASS_NAME,
            namespace: GuzzleClient.NAMESPACE
        })
    }

    public getRequestExceptionClassReference(): php.ClassReference {
        return php.classReference({
            name: GuzzleClient.REQUEST_EXCEPTION_CLASS_NAME,
            namespace: GuzzleClient.EXCEPTION_NAMESPACE
        })
    }

    public instantiate(): php.ClassInstantiation {
        return php.instantiateClass({
            classReference: this.getClientClassReference(),
            arguments_: []
        })
    }
}
