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
}

/** The subset of the PostHog client the flag client uses, so tests can substitute it. */
export type FeatureFlagEvaluator = Pick<PostHog, "getFeatureFlagResult">;

const FLAG_REQUEST_TIMEOUT_MS = 3000;

export class PosthogFeatureFlagClient implements FeatureFlagClient {
    private readonly evaluator: FeatureFlagEvaluator;
    private readonly environment: CliReleaseEnvironment;
    private readonly pending = new Map<string, Promise<boolean>>();
    private readonly resolved = new Map<string, boolean>();

    constructor({
        environment,
        posthogApiKey,
        evaluator
    }: {
        environment: CliReleaseEnvironment;
        posthogApiKey?: string;
        evaluator?: FeatureFlagEvaluator;
    }) {
        this.environment = environment;
        this.evaluator =
            evaluator ?? new PostHog(posthogApiKey ?? "", { featureFlagsRequestTimeoutMs: FLAG_REQUEST_TIMEOUT_MS });
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

    private async evaluate(flag: string, context: FeatureFlagContext): Promise<boolean> {
        const { org } = context;
        const properties = getTargetingProperties(context, this.environment);
        try {
            const result = await this.evaluator.getFeatureFlagResult(flag, getFlagDistinctId(org), {
                personProperties: properties,
                groups: { organization: org },
                groupProperties: { organization: properties },
                // Flag checks run even when telemetry is disabled, so they never emit events.
                sendFeatureFlagEvents: false
            });
            return isFeatureFlagValueEnabled(result);
        } catch {
            // Flags gate rollouts; an unreachable PostHog must fall back to the default (off), never fail the CLI.
            return false;
        }
    }
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
