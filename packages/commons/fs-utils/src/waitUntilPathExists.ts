import { delay } from "@fern-api/core-utils";

import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { doesPathExist } from "./doesPathExist";

export async function waitUntilPathExists(filepath: AbsoluteFilePath, timeoutMs: number): Promise<boolean> {
    const controller = new AbortController();
    return Promise.race([
        waitUntilPathExistsWithExponentialBackoff({ filepath, controller }).then(() => true),
        delay(timeoutMs).then(() => {
            controller.abort();
            return false;
        })
    ]);
}

async function waitUntilPathExistsWithExponentialBackoff({
    filepath,
    controller,
    delayMs = 50
}: {
    filepath: AbsoluteFilePath;
    controller: AbortController;
    delayMs?: number;
}): Promise<void> {
    if (controller.signal.aborted) {
        return;
    }
    if (await doesPathExist(filepath)) {
        return;
    }
    await delay(delayMs);
    return waitUntilPathExistsWithExponentialBackoff({
        filepath,
        controller,
        // exponential backoff
        delayMs: delayMs * 2
    });
}
