import { delay } from "./delay";

/**
 * if the promise resolves:
 *   - if alwaysDelay=true, this doesn't resolve until after ms
 *   - if alwaysDelay=false, this resolves immediately
 * if the promise rejects, this doesn't reject until after ms
 *   (timer starts when withMinimumTime() is invoked)
 */
export async function withMinimumTime<T>(
    promise: Promise<T>,
    ms: number,
    { alwaysDelay = false }: { alwaysDelay?: boolean } = {}
): Promise<T> {
    const delayPromise = delay(ms);

    try {
        const result = await promise;
        if (alwaysDelay) {
            await delayPromise;
        }
        return result;
    } catch (error) {
        await delayPromise;
        throw error;
    }
}
