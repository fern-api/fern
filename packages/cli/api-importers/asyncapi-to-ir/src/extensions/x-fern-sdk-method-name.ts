import { AbstractExtension } from "@fern-api/v3-importer-commons";

import { AsyncAPIV2 } from "../2.x/index.js";
import { AsyncAPIV3 } from "../3.0/index.js";

export declare namespace SdkMethodNameExtension {
    export interface Args extends AbstractExtension.Args {
        operation: AsyncAPIV2.PublishEvent | AsyncAPIV2.SubscribeEvent | AsyncAPIV3.Operation;
    }
}

export class SdkMethodNameExtension extends AbstractExtension<string> {
    private readonly operation: AsyncAPIV2.PublishEvent | AsyncAPIV2.SubscribeEvent | AsyncAPIV3.Operation;
    public readonly key = "x-fern-sdk-method-name";

    constructor({ breadcrumbs, operation, context }: SdkMethodNameExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public convert(): string | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null || typeof extensionValue !== "string") {
            return undefined;
        }

        return extensionValue;
    }
}
