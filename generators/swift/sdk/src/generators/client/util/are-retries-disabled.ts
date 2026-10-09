import { FernIr } from "@fern-fern/ir-sdk";

export function areRetriesDisabled(retries: FernIr.RetriesConfiguration | undefined): boolean {
    return retries?.disabled === true;
}
