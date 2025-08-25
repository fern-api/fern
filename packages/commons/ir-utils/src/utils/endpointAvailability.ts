import { AvailabilityStatus, HttpEndpoint } from "@fern-api/ir-sdk";

const unstableStatuses: AvailabilityStatus[] = [
    AvailabilityStatus.InDevelopment,
    AvailabilityStatus.PreRelease,
    AvailabilityStatus.Deprecated,
];

export function endpointMarkedUnstable(endpoint: HttpEndpoint): boolean {
    return endpoint.availability !== undefined && unstableStatuses.includes(endpoint.availability.status);
}