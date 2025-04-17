import { AvailabilityStatus } from "@fern-api/ir-sdk";

import { AbstractExtension } from "../AbstractExtension";
import { ErrorCollector } from "../ErrorCollector";

export declare namespace FernAvailabilityExtension {
    export interface Args extends AbstractExtension.Args {
        node: unknown;
    }
}

export class FernAvailabilityExtension extends AbstractExtension<AvailabilityStatus | undefined> {
    private readonly node: unknown;
    public readonly key = "x-fern-availability";

    constructor({ breadcrumbs, node }: FernAvailabilityExtension.Args) {
        super({ breadcrumbs });
        this.node = node;
    }

    public async convert({
        errorCollector
    }: {
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
