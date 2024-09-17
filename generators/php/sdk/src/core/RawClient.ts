import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { php } from "@fern-api/php-codegen";
import { Arguments } from "@fern-api/generator-commons";

export declare namespace RawClient {
    export interface SendRequestArgs {
        // TODO: Implement me!
    }
}

/**
 * Utility class that helps make calls to the RawClient.
 */
export class RawClient {
    public static CLASS_NAME = "RawClient";
    public static FIELD_NAME = "client";

    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public getClassReference(): php.ClassReference {
        return php.classReference({
            name: RawClient.CLASS_NAME,
            namespace: this.context.getCoreNamespace()
        });
    }

    public getFieldName(): string {
        return RawClient.FIELD_NAME;
    }

    public getField(): php.Field {
        return php.field({
            access: "private",
            name: `$${this.getFieldName()}`,
            type: php.Type.reference(this.context.rawClient.getClassReference())
        });
    }

    public instantiate({ arguments_ }: { arguments_: Arguments }): php.ClassInstantiation {
        return php.instantiateClass({
            classReference: this.getClassReference(),
            arguments_
        });
    }

    /**
     * Sends a request with the RawClient.
     */
    public sendRequest(args: RawClient.SendRequestArgs): void {
        // TODO: Implement me!
        return;
    }
}
