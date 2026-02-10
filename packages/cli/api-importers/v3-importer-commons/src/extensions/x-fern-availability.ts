import { AvailabilityStatus } from "@fern-api/ir-sdk";

import { AbstractExtension } from "../AbstractExtension.js";

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
            case "ALPHA":
                return AvailabilityStatus.Alpha;
            case "IN_DEVELOPMENT":
                return AvailabilityStatus.InDevelopment;
            case "PRE_RELEASE":
                return AvailabilityStatus.PreRelease;
            case "BETA":
                return AvailabilityStatus.Beta;
            case "PREVIEW":
                return AvailabilityStatus.Preview;
            case "GENERAL_AVAILABILITY":
            case "GA":
                return AvailabilityStatus.GeneralAvailability;
            case "STABLE":
                return AvailabilityStatus.Stable;
            case "DEPRECATED":
                return AvailabilityStatus.Deprecated;
            case "LEGACY":
                return AvailabilityStatus.Legacy;
            default:
                return undefined;
        }
    }
}
