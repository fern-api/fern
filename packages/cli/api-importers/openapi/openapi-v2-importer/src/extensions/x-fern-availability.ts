import { AvailabilityStatus } from "@fern-api/ir-sdk";

import { AbstractConverter } from "../AbstractConverter";
import { AbstractExtension } from "../AbstractExtension";
import { ErrorCollector } from "../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../openapi_3_1/OpenAPIConverterContext3_1";

export declare namespace AvailabilityExtension {
    export interface Args extends AbstractConverter.Args {
        node: unknown;
    }
}

export class AvailabilityExtension extends AbstractExtension<
    OpenAPIConverterContext3_1,
    AvailabilityStatus | undefined
> {
    private readonly node: unknown;
    public readonly key = "x-fern-availability";

    constructor({ breadcrumbs, node }: AvailabilityExtension.Args) {
        super({ breadcrumbs });
        this.node = node;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<AvailabilityStatus | undefined> {
        const extensionValue = this.getExtensionValue(this.node);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "string") {
            return undefined;
        }

        const normalizedValue = extensionValue.toUpperCase().replace(/[-_\s]/g, "_");
        switch (normalizedValue) {
            case "IN_DEVELOPMENT":
                return AvailabilityStatus.InDevelopment;
            case "PRE_RELEASE":
                return AvailabilityStatus.PreRelease;
            case "GENERAL_AVAILABILITY":
                return AvailabilityStatus.GeneralAvailability;
            case "DEPRECATED":
                return AvailabilityStatus.Deprecated;
            default:
                return undefined;
        }
    }
}
