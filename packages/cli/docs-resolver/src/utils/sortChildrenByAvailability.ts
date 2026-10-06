import { docsYml } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import { FernNavigation } from "@fern-api/fdr-sdk";

type AvailabilityTier = "generally-available" | "alpha" | "beta" | "preview" | "legacy" | "deprecated";

const DEFAULT_AVAILABILITY_ORDER: (AvailabilityTier | undefined)[] = [
    undefined,
    "generally-available",
    "alpha",
    "beta",
    "preview",
    "legacy",
    "deprecated"
];

function toAvailabilityTier(
    availability: docsYml.RawSchemas.SortByAvailabilityValue | FernNavigation.V1.NavigationV1Availability | undefined
): AvailabilityTier | undefined {
    if (availability == null) {
        return undefined;
    }
    switch (availability) {
        case "unset":
            return undefined;
        case "stable":
        case "generally-available":
            return "generally-available";
        case "in-development":
        case "pre-release":
        case "beta":
            return "beta";
        case "alpha":
        case "preview":
        case "legacy":
        case "deprecated":
            return availability;
        default:
            return assertNever(availability);
    }
}

function getChildAvailability(
    child: FernNavigation.V1.ApiPackageChild
): FernNavigation.V1.NavigationV1Availability | undefined {
    switch (child.type) {
        case "endpointPair":
            return child.nonStream.availability;
        case "apiPackage":
        case "endpoint":
        case "webSocket":
        case "webhook":
        case "grpc":
        case "graphql":
        case "graphqlType":
        case "page":
            return child.availability;
        case "link":
            return undefined;
        default:
            return assertNever(child);
    }
}

/**
 * Stable-sorts children by availability. Availabilities listed in `sortByAvailability` come first, in the
 * order given, followed by the remaining availabilities in {@link DEFAULT_AVAILABILITY_ORDER}.
 */
export function sortChildrenByAvailability(
    children: FernNavigation.V1.ApiPackageChild[],
    sortByAvailability: docsYml.RawSchemas.SortByAvailabilityValue[]
): FernNavigation.V1.ApiPackageChild[] {
    const order: (AvailabilityTier | undefined)[] = [];
    for (const availability of sortByAvailability) {
        const tier = toAvailabilityTier(availability);
        if (!order.includes(tier)) {
            order.push(tier);
        }
    }
    for (const tier of DEFAULT_AVAILABILITY_ORDER) {
        if (!order.includes(tier)) {
            order.push(tier);
        }
    }
    const rankByTier = new Map(order.map((tier, index) => [tier, index]));
    const rank = (child: FernNavigation.V1.ApiPackageChild) =>
        rankByTier.get(toAvailabilityTier(getChildAvailability(child))) ?? order.length;
    return [...children].sort((a, b) => rank(a) - rank(b));
}
