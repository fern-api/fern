import { docsYml } from "@fern-api/configuration-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";

export function convertDocsAvailability(
    availability: docsYml.RawSchemas.Availability | undefined
): FernNavigation.V1.NavigationV1Availability | undefined {
    if (availability == null) {
        return undefined;
    }
    switch (availability) {
        case "stable":
            return FernNavigation.V1.NavigationV1Availability.Stable;
        case "generally-available":
            return FernNavigation.V1.NavigationV1Availability.GenerallyAvailable;
        case "in-development":
            return FernNavigation.V1.NavigationV1Availability.InDevelopment;
        case "pre-release":
            return FernNavigation.V1.NavigationV1Availability.PreRelease;
        case "deprecated":
            return FernNavigation.V1.NavigationV1Availability.Deprecated;
        case "beta":
            return FernNavigation.V1.NavigationV1Availability.Beta;
        case "alpha":
            // TODO: switch to NavigationV1Availability.Alpha once the next fdr-sdk release includes it
            return FernNavigation.V1.NavigationV1Availability.Beta;
        case "preview":
            // TODO: switch to NavigationV1Availability.Preview once the next fdr-sdk release includes it
            return FernNavigation.V1.NavigationV1Availability.Beta;
        case "legacy":
            // TODO: switch to NavigationV1Availability.Legacy once the next fdr-sdk release includes it
            return FernNavigation.V1.NavigationV1Availability.Deprecated;
        default:
            return undefined;
    }
}
