import { docsYml } from "@fern-api/configuration-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";

/**
 * Converts the CLI's expanded Availability type to NavigationV1Availability.
 *
 * The CLI config supports 17 availability values, but the currently published
 * @fern-api/fdr-sdk only defines 6. Once the fdr-sdk is updated to include
 * all 17, this function can be simplified to a direct assignment.
 *
 * TODO: Remove the type assertion once @fern-api/fdr-sdk is updated.
 */
export function toNavigationV1Availability(
    availability: docsYml.RawSchemas.Availability | undefined
): FernNavigation.V1.NavigationV1Availability | undefined {
    if (availability == null) {
        return undefined;
    }
    return availability as FernNavigation.V1.NavigationV1Availability;
}
