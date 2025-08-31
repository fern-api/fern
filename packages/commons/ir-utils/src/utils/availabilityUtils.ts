import { Availability, AvailabilityStatus, FernIr } from "@fern-api/ir-sdk";

const stableStatuses: AvailabilityStatus[] = [AvailabilityStatus.GeneralAvailability];

export function isMarkedUnstable(availability: Availability | undefined): boolean {
    return availability !== undefined && !stableStatuses.includes(availability.status);
}
