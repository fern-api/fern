import { FernIr } from "@fern-api/ir-sdk";

const stableStatuses: FernIr.AvailabilityStatus[] = [FernIr.AvailabilityStatus.GeneralAvailability];

export function isMarkedUnstable(availability: FernIr.Availability | undefined): boolean {
    return availability !== undefined && !stableStatuses.includes(availability.status);
}
