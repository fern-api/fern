import { PostHog } from "posthog-node";

import type { CliReleaseEnvironment } from "./CliReleaseEnvironment.js";

/**
 * Inputs PostHog release conditions can target. Each is sent as a person and group property, alongside the
 * CLI release `environment`, so a condition can match any combination of org, generator, and language.
 */
export interface FeatureFlagContext {
    /** The Fern organization from `fern.config.json` / `fern.yml`. */
    org: string;
    /** The generator the flag is evaluated for, e.g. `fernapi/fern-python-sdk`. */
    generator?: string;
    /** The generator's language, e.g. `python`, which also covers every alias of that language's generator. */
    language?: string;
}

/** The parts of a PostHog flag result that decide whether it is on; `undefined` when no value was returned. */
export type FeatureFlagResultValue = { readonly enabled: boolean; readonly variant?: string } | undefined;

export interface FeatureFlagClient {
    /**
     * Resolves a boolean feature flag for an organization. Resolves to `false` when the flag does
     * not exist, is off, cannot be reached, or is quota limited. Results are cached per process.
     */
    isEnabled(flag: string, context: FeatureFlagContext): Promise<boolean>;
    /** Returns a previously resolved value without making a request, or `undefined` if none exists yet. */
    getCachedValue(flag: string, context: FeatureFlagContext): boolean | undefined;
    /** Sends queued `$feature_flag_called` events. Never rejects. */
    flush(): Promise<void>;
}

/**
 * A flag is on when PostHog returns `true` for a boolean flag, or the `"true"` variant for a
 * multivariate flag. Multivariate flags make overrides possible: PostHog uses the first matching
 * condition set, so sets that force `"false"` (or `"true"`) for an org, a generator, or both can sit
 * ahead of a catch-all set that holds the default for everyone else.
 */
export function isFeatureFlagValueEnabled(value: FeatureFlagResultValue): boolean {
    if (value == null || !value.enabled) {
        return false;
    }
    return value.variant == null || value.variant === "true";
}

export class NoopFeatureFlagClient implements FeatureFlagClient {
    public isEnabled(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public getCachedValue(): boolean | undefined {
        return undefined;
    }

    public flush(): Promise<void> {
        return Promise.resolve();
    }
}

/** The subset of the PostHog client the flag client uses, so tests can substitute it. */
export type FeatureFlagEvaluator = Pick<PostHog, "getFeatureFlagResult" | "capture" | "flush">;

type FlagResult = Awaited<ReturnType<FeatureFlagEvaluator["getFeatureFlagResult"]>>;
type CaptureMessage = Parameters<FeatureFlagEvaluator["capture"]>[0];

/**
 * One event per flag evaluation, with the same targeting properties as `$feature_flag_called`. Exists
 * because PostHog deduplicates `$feature_flag_called` per distinct ID, flag, and value (about hourly).
 */
export const FEATURE_FLAG_EVALUATED_EVENT = "feature_flag_evaluated";

const FLAG_REQUEST_TIMEOUT_MS = 3000;
const FLUSH_TIMEOUT_MS = 3000;

export class PosthogFeatureFlagClient implements FeatureFlagClient {
    private readonly evaluator: FeatureFlagEvaluator;
    private readonly environment: CliReleaseEnvironment;
    private readonly sendFeatureFlagEvents: boolean;
    private readonly pending = new Map<string, Promise<boolean>>();
    private readonly resolved = new Map<string, boolean>();

    constructor({
        environment,
        sendFeatureFlagEvents,
        posthogApiKey,
        evaluator
    }: {
        environment: CliReleaseEnvironment;
        /**
         * Whether evaluations emit `$feature_flag_called` events, which power PostHog's flag usage
         * metrics. Flags are evaluated even when telemetry is disabled, so callers pass `false` then.
         */
        sendFeatureFlagEvents: boolean;
        posthogApiKey?: string;
        evaluator?: FeatureFlagEvaluator;
    }) {
        this.environment = environment;
        this.sendFeatureFlagEvents = sendFeatureFlagEvents;
        this.evaluator =
            evaluator ??
            new PostHog(posthogApiKey ?? "", {
                featureFlagsRequestTimeoutMs: FLAG_REQUEST_TIMEOUT_MS,
                // Matches UserPosthogManager: keeps posthog-node from tagging CLI events with `$is_server: true`.
                isServer: false
            });
    }

    public isEnabled(flag: string, context: FeatureFlagContext): Promise<boolean> {
        const cacheKey = getCacheKey(flag, context);
        const existing = this.pending.get(cacheKey);
        if (existing != null) {
            return existing;
        }
        const evaluation = this.evaluateAndRemember(flag, context, cacheKey);
        this.pending.set(cacheKey, evaluation);
        return evaluation;
    }

    private async evaluateAndRemember(flag: string, context: FeatureFlagContext, cacheKey: string): Promise<boolean> {
        const enabled = await this.evaluate(flag, context);
        this.resolved.set(cacheKey, enabled);
        return enabled;
    }

    public getCachedValue(flag: string, context: FeatureFlagContext): boolean | undefined {
        return this.resolved.get(getCacheKey(flag, context));
    }

    public async flush(): Promise<void> {
        if (!this.sendFeatureFlagEvents) {
            return;
        }
        let timeout: NodeJS.Timeout | undefined;
        try {
            await Promise.race([
                this.flushAfterPendingEvaluations(),
                new Promise<void>((resolve) => {
                    timeout = setTimeout(resolve, FLUSH_TIMEOUT_MS);
                    timeout.unref();
                })
            ]);
        } catch {
            // Flag usage events are analytics only and must never block or fail the CLI.
        } finally {
            clearTimeout(timeout);
        }
    }

    /** In-flight checks capture their usage event only once PostHog answers, so wait for them first. */
    private async flushAfterPendingEvaluations(): Promise<void> {
        await Promise.allSettled(this.pending.values());
        await this.evaluator.flush();
    }

    private async evaluate(flag: string, context: FeatureFlagContext): Promise<boolean> {
        const { org } = context;
        const properties = getTargetingProperties(context, this.environment);
        let result: FlagResult;
        try {
            result = await this.evaluator.getFeatureFlagResult(flag, getFlagDistinctId(org), {
                personProperties: properties,
                groups: { organization: org },
                groupProperties: { organization: properties },
                // posthog-node's own event omits the targeting properties and sends one event per org,
                // flag, and value, which hides per-generator usage. We capture our own below instead.
                sendFeatureFlagEvents: false
            });
        } catch {
            // Flags gate rollouts; an unreachable PostHog must fall back to the default (off), never fail the CLI.
            return false;
        }
        if (this.sendFeatureFlagEvents) {
            this.captureFlagUsage({ flag, org, result, properties });
        }
        return isFeatureFlagValueEnabled(result);
    }

    /**
     * Records each evaluation (evaluations are already cached per flag, org, generator, and language)
     * as two events carrying the targeting properties:
     * - `$feature_flag_called` feeds PostHog's flag usage view. PostHog keeps about one per distinct ID,
     *   flag, and value per hour, so it shows only the first generator an org runs in that window.
     * - {@link FEATURE_FLAG_EVALUATED_EVENT} is not deduplicated, so Insights can count evaluations
     *   exactly by generator, language, and environment.
     */
    private captureFlagUsage({
        flag,
        org,
        result,
        properties
    }: {
        flag: string;
        org: string;
        result: FlagResult;
        properties: Record<string, string>;
    }): void {
        const response = getFlagResponse(result);
        const sharedProperties = {
            ...properties,
            ...(result?.reason != null ? { $feature_flag_reason: result.reason } : {}),
            ...(process.env.CLI_VERSION != null ? { version: process.env.CLI_VERSION } : {})
        };
        this.tryCapture({
            distinctId: getFlagDistinctId(org),
            event: "$feature_flag_called",
            groups: { organization: org },
            // Leave `$feature_flag_has_experiment` unset: posthog-node strips every non-flag property
            // from `$feature_flag_called` events that set it to `false` when PostHog asks for minimal events.
            properties: {
                ...sharedProperties,
                $feature_flag: flag,
                $feature_flag_response: response,
                [`$feature/${flag}`]: response
            }
        });
        this.tryCapture({
            distinctId: getFlagDistinctId(org),
            event: FEATURE_FLAG_EVALUATED_EVENT,
            groups: { organization: org },
            properties: {
                ...sharedProperties,
                flag,
                response,
                enabled: isFeatureFlagValueEnabled(result)
            }
        });
    }

    /** Captures one event on its own, so a failure in one usage event never skips the other. */
    private tryCapture(message: CaptureMessage): void {
        try {
            this.evaluator.capture(message);
        } catch {
            // Flag usage events are analytics only and must never fail the CLI.
        }
    }
}

/**
 * The flag value as PostHog reports it in `$feature_flag_response`: the variant for multivariate
 * flags, `true`/`false` for boolean flags, and `undefined` when PostHog returned no value.
 */
export function getFlagResponse(result: FlagResult): string | boolean | undefined {
    if (result == null) {
        return undefined;
    }
    if (!result.enabled) {
        return false;
    }
    return result.variant ?? true;
}

/**
 * Flags are evaluated per organization (not per user) so percentage rollouts bucket whole orgs
 * and no user identity is sent for users who opted out of telemetry.
 */
export function getFlagDistinctId(org: string): string {
    return `org:${org}`;
}

function getTargetingProperties(
    { org, generator, language }: FeatureFlagContext,
    environment: CliReleaseEnvironment
): Record<string, string> {
    return {
        org,
        environment,
        ...(generator != null ? { generator } : {}),
        ...(language != null ? { language } : {})
    };
}

function getCacheKey(flag: string, { org, generator, language }: FeatureFlagContext): string {
    return JSON.stringify([flag, org, generator ?? null, language ?? null]);
}
