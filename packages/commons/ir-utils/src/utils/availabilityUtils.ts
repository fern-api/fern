import { FernIr } from "@fern-api/ir-sdk";

const stableStatuses: FernIr.AvailabilityStatus[] = [FernIr.AvailabilityStatus.GeneralAvailability];

export function isMarkedUnstable(availability: FernIr.Availability | null | undefined): boolean {
    return availability != null && !stableStatuses.includes(availability.status);
}
