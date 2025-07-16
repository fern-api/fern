import { AvailabilityStatus } from "@fern-api/ir-sdk";

import { AbstractExtension } from "../AbstractExtension";

export declare namespace FernAvailabilityExtension {
    export interface Args extends AbstractExtension.Args {
        node: unknown;
    }
}

export class FernAvailabilityExtension extends AbstractExtension<AvailabilityStatus | undefined> {
    private readonly node: unknown;
    public readonly key = "x-fern-availability";

    constructor({ breadcrumbs, node, context }: FernAvailabilityExtension.Args) {
        super({ breadcrumbs, context });
        this.node = node;
    }

    public convert(): AvailabilityStatus | undefined {
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
            case "BETA":
                return AvailabilityStatus.PreRelease;
            case "GENERAL_AVAILABILITY":
            case "GA":
                return AvailabilityStatus.GeneralAvailability;
            case "DEPRECATED":
                return AvailabilityStatus.Deprecated;
            default:
                return undefined;
        }
    }
}
