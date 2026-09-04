import { PostHog } from "posthog-node";

/**
 * Options that disable posthog-node's background flushes (interval and
 * queue-size triggered). Those flushes log network failures directly to
 * console.error, which cannot be intercepted and would pollute CLI output on
 * network-restricted machines. Events are sent only via an explicit,
 * error-swallowing flush() at exit. `flushAt` is a large-but-bounded cap so a
 * pathological run cannot accumulate an unshippable batch.
 */
export const POSTHOG_CLIENT_OPTIONS = {
    flushAt: 1000,
    flushInterval: 0
} as const;

export function createPosthogClient(apiKey: string): PostHog {
    return new PostHog(apiKey, POSTHOG_CLIENT_OPTIONS);
}
