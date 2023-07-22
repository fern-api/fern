import { delay } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { doesPathExist } from "./doesPathExist";

export async function waitUntilPathExists(filepath: AbsoluteFilePath, timeoutMs: number): Promise<boolean> {
    return waitUntilPathExistsWithDeadline({ filepath, deadline: Date.now() + timeoutMs });
}

async function waitUntilPathExistsWithDeadline({
    filepath,
    deadline,
    delayMs = 50,
}: {
    filepath: AbsoluteFilePath;
    deadline: number;
    delayMs?: number;
}): Promise<boolean> {
    if (await doesPathExist(filepath)) {
        return true;
    }
    await delay(delayMs);
    if (Date.now() > deadline) {
        return false;
    }
    return waitUntilPathExistsWithDeadline({
        filepath,
        deadline,
        // exponential backoff
        delayMs: delayMs * 2,
    });
}
