import { docsYml } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
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
        case "release-candidate":
            return FernNavigation.V1.NavigationV1Availability.ReleaseCandidate;
        case "public-beta":
            return FernNavigation.V1.NavigationV1Availability.PublicBeta;
        case "private-beta":
            return FernNavigation.V1.NavigationV1Availability.PrivateBeta;
        case "limited-availability":
            return FernNavigation.V1.NavigationV1Availability.LimitedAvailability;
        case "canary-release":
            return FernNavigation.V1.NavigationV1Availability.CanaryRelease;
        case "in-development":
            return FernNavigation.V1.NavigationV1Availability.InDevelopment;
        case "pre-release":
            return FernNavigation.V1.NavigationV1Availability.PreRelease;
        case "experimental":
            return FernNavigation.V1.NavigationV1Availability.Experimental;
        case "internal":
            return FernNavigation.V1.NavigationV1Availability.Internal;
        case "deprecated":
            return FernNavigation.V1.NavigationV1Availability.Deprecated;
        case "beta":
            return FernNavigation.V1.NavigationV1Availability.Beta;
        case "alpha":
            return FernNavigation.V1.NavigationV1Availability.Alpha;
        case "preview":
            return FernNavigation.V1.NavigationV1Availability.Preview;
        case "sunset":
            return FernNavigation.V1.NavigationV1Availability.Sunset;
        case "retired":
            return FernNavigation.V1.NavigationV1Availability.Retired;
        case "legacy":
            return FernNavigation.V1.NavigationV1Availability.Legacy;
        default:
            assertNever(availability);
    }
}
